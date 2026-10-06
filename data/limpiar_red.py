#!/usr/bin/env python3
"""
Depura la red de la Notaría 2 (vendedor -> comprador) desde el consolidado.

Dos modos, para comparar cuánto se mueven las métricas del parcial:

  moderada  -> normalizar + quitar apoderados/paréntesis + separar co-partes
               ("A y B" en dos nodos) + alias por pliegue de acentos.
  afondo    -> lo de 'moderada' + resolución de entidades por fuzzy
               (quitar honoríficos/iniciales, agrupar variantes del mismo
               nombre) + tabla de alias curada para los actores grandes.

Modelo de red:
  - Cada registro = conjunto de vendedores S y compradores B.
  - Aristas dirigidas s->b para todo s in S, b in B (s != b).
  - compras(b)  = # registros en que b es comprador  (= acumulación de tierra)
  - ventas(s)   = # registros en que s es vendedor
  - Estructura/betweenness sobre el DiGraph simple.

Uso:
  python limpiar_red.py --comparar          # imprime tabla raw/moderada/afondo
  python limpiar_red.py --modo afondo        # escribe red_afondo.csv (edge list)
"""
import argparse
import csv
import re
import unicodedata
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

import networkx as nx

AQUI = Path(__file__).parent
CONSOLIDADO = AQUI / "consolidado_notaria2.csv"
ALIAS_CSV = AQUI / "alias_curados.csv"

NA = {"", "na", "n/a", "nan", "none", "null", "-"}

# fragmentos que sobran al separar co-partes (no son personas)
STOP_FRAG = {
    "viuda", "vda", "menor", "menores", "otros", "otro", "otras", "otra",
    "cia", "cía", "y cia", "hijos", "sucesores", "demas", "demás",
}
# formas/sufijos sociales que quedan sueltos al partir (no son un actor real):
SOLO_SOC = {
    "compañía", "compania", "cía", "cia", "s a", "sa", "cía s a", "cia s a",
    "cía ltda", "cia ltda", "cía limitada", "cia limitada", "ltda", "limitada",
}
HONORIF = {
    "sr", "sra", "srta", "sres", "dr", "dra", "don", "dona", "doña",
    "senor", "senora", "senorita", "general", "gral", "doctor", "doctora",
    "el", "la", "los", "las",
}
# frases que marcan apoderado / rol -> se corta el nombre principal ahí
CORTES = [
    r"\brepr\.?\s+por\b", r"\brepresentad[oa]s?\s+por\b", r"\bpor\s+medio\s+de\b",
    r"\ben\s+nombre\s+de\b", r"\ba\s+favor\s+de\b", r"\bapoderad[oa]\b",
    r"\bp\.?\s*p\.?\b",
]
CORTE_RE = re.compile("|".join(CORTES))

# alias curados (clave = forma canónica) para los actores grandes.
# Se comparan sobre el nombre YA plegado de acentos.
ALIAS_CURADOS = {
    "sebastian caicedo": ["sebastian caicedo", "sebastian caicedo b"],
    "susana caicedo": ["susana caicedo", "susana caicedo de vaccari"],
    "municipio de cali": ["municipio de cali"],
    "banco central hipotecario": ["banco central hipotecario", "banco central hip"],
    "the royal bank of canada": ["the royal bank of canada", "royal bank of canada"],
    "cristina serrano vda de lourido": ["cristina serrano vda de lourido"],
    "sucesion jesus lourido": ["sucesion jesus lourido", "sucesion de jesus lourido"],
}


def base_norm(s):
    s = str(s or "").strip().lower()
    s = s.replace('"', "").replace("'", "").replace("“", "").replace("”", "")
    s = re.sub(r"\s+", " ", s)
    return s


def pliega_acentos(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s)
                   if not unicodedata.combining(c))


def quita_apoderado(s):
    """Corta el texto en la primera marca de apoderado/rol y quita paréntesis."""
    s = re.sub(r"\(.*?\)", " ", s)          # (repr. por ...), (retroventa)...
    m = CORTE_RE.search(s)
    if m:
        s = s[:m.start()]
    return re.sub(r"\s+", " ", s).strip(" ,.-")


def valido(p):
    """Limpia bordes y descarta fragmentos que no son personas/entidades:
    puros signos (—, –, -, comillas), demasiado cortos, palabras de relleno,
    formas sociales sueltas ('compañía', 'cía. s.a') o marcas de no-transacción
    ('n/a — reforma estatutaria...')."""
    p = p.strip(" ,.-–—\"'").strip()
    if len(p) < 3:
        return None
    if not re.search(r"[a-z0-9áéíóúñ]", p):     # sin letras/dígitos -> basura
        return None
    if p in STOP_FRAG or p in NA:
        return None
    if p.startswith("n/a"):                      # "n/a — reforma estatutaria..."
        return None
    if re.sub(r"[.\s]+", " ", p).strip() in SOLO_SOC:   # sufijo social suelto
        return None
    return p


# conectores de razón social: ' y Cía.', ' y Compañía', ' y Hnos'... NO son
# separadores de co-partes (romperían "Eder y Cía. S.A." en nodos basura).
_SUF_SOC = r"c[ií]a\b|compa[nñ][ií]a\b|hnos\b|hermanos\b"
_SEP_COPARTES = re.compile(
    r"\s*,\s*"                              # la coma siempre separa
    r"|\s+y\s+(?!(?:" + _SUF_SOC + r"))"    # ' y ' salvo ' y Cía/Compañía/Hnos'
    r"|\s+e\s+(?!hijos\b)"                   # ' e ' salvo ' e hijos'
)


def separa_copartes(cell):
    """Divide una casilla en co-partes por ' y ', ', ', ' e ', respetando las
    razones sociales ('X y Cía. S.A.', 'X y Compañía')."""
    if not cell:
        return []
    out = []
    for p in _SEP_COPARTES.split(cell):
        p = valido(p)
        if p:
            out.append(p)
    return out


def limpia_nodo_moderada(raw):
    """raw (texto de casilla) -> lista de nodos (normalizados, sin apoderado)."""
    s = base_norm(raw)
    if s in NA:
        return []
    s = quita_apoderado(s)
    partes = separa_copartes(s)
    if not partes:                              # casilla sin delimitadores
        v = valido(s)
        partes = [v] if v else []
    return partes


# ---------- resolución de entidades (solo 'a fondo') ----------

def clave_afondo(nodo):
    """Clave de matching: pliega acentos, quita honoríficos e iniciales sueltas."""
    s = pliega_acentos(nodo)
    s = re.sub(r"[.]", " ", s)
    toks = [t for t in s.split() if t and t not in HONORIF]
    toks = [t for t in toks if not (len(t) == 1)]   # iniciales sueltas
    return " ".join(toks).strip()


def construye_alias(freq):
    """freq: Counter nodo->#ocurrencias. Devuelve dict nodo->canonico
    agrupando variantes del mismo nombre (union-find + fuzzy + curados)."""
    nodos = list(freq)
    claves = {n: clave_afondo(n) for n in nodos}

    parent = {n: n for n in nodos}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    # 1) misma clave exacta (p. ej. acentos): sebastian/sebastián caicedo
    por_clave = defaultdict(list)
    for n in nodos:
        por_clave[claves[n]].append(n)
    for grp in por_clave.values():
        for m in grp[1:]:
            union(grp[0], m)

    # 2) fuzzy entre claves que comparten primer token (nombre de pila).
    #    CONSERVADOR: nunca fusiona por un solo token (un nombre de pila suelto
    #    como "rafael" o "compañía" es imán de falsos positivos en una élite
    #    caleña con muchos homónimos). Exige apellido igual, o subconjunto con
    #    >=2 tokens compartidos, o alta similitud global.
    por_primer = defaultdict(list)
    for k in por_clave:
        if k:
            por_primer[k.split()[0]].append(k)
    for ks in por_primer.values():
        for i in range(len(ks)):
            for j in range(i + 1, len(ks)):
                a, b = ks[i], ks[j]
                ta, tb = set(a.split()), set(b.split())
                if len(ta) < 2 or len(tb) < 2:      # sin imanes de un solo token
                    continue
                mismo_apellido = a.split()[-1] == b.split()[-1]
                subset = (ta <= tb or tb <= ta) and len(ta & tb) >= 2
                ratio = SequenceMatcher(None, a, b).ratio()
                if mismo_apellido or subset or ratio >= 0.90:
                    union(por_clave[a][0], por_clave[b][0])

    # 3) alias curados: fuerza la unión de sus variantes y fija el rótulo
    curado_variant_keys = {}
    for canon, variantes in ALIAS_CURADOS.items():
        for v in variantes:
            curado_variant_keys[clave_afondo(v)] = canon
    for canon in set(curado_variant_keys.values()):
        miembros = [n for n in nodos
                    if curado_variant_keys.get(claves[n]) == canon]
        for m in miembros[1:]:
            union(miembros[0], m)

    # rótulo canónico por grupo
    grupos = defaultdict(list)
    for n in nodos:
        grupos[find(n)].append(n)
    alias = {}
    for miembros in grupos.values():
        forzado = next((curado_variant_keys[claves[m]] for m in miembros
                        if claves[m] in curado_variant_keys), None)
        rotulo = forzado or max(miembros, key=lambda m: (freq[m], len(m)))
        for m in miembros:
            alias[m] = rotulo
    return alias


# ---------- construcción de la red ----------

def leer_registros():
    with open(CONSOLIDADO, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def clave_match(s):
    """Clave laxa para casar entradas del CSV curado con nodos: pliega acentos
    y signos. NO quita tokens, así que nombres distintos siguen distintos."""
    s = pliega_acentos(base_norm(s))
    s = re.sub(r"[\"'.,–—-]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def cargar_alias_curados():
    """Lee alias_curados.csv -> dict clave_match(variante) -> canonico."""
    mapa = {}
    if not ALIAS_CSV.exists():
        return mapa
    with open(ALIAS_CSV, encoding="utf-8") as f:
        for linea in f:
            linea = linea.strip()
            if not linea or linea.startswith("#") or linea.startswith("variante,"):
                continue
            partes = linea.split(",")
            if len(partes) < 2:
                continue
            variante, canonico = partes[0].strip(), partes[1].strip()
            if variante and canonico:
                mapa[clave_match(variante)] = canonico
    return mapa


def construir(modo):
    """modo in {raw, moderada, afondo, curada}. Devuelve (G, compras, ventas)."""
    regs = leer_registros()

    def nodos_de(cell):
        if modo == "raw":
            s = base_norm(cell)
            return [] if s in NA else [s]
        return limpia_nodo_moderada(cell)

    # primera pasada: recolecta nodos crudos-limpios y sus frecuencias
    registros = []
    freq = Counter()
    for r in regs:
        S = nodos_de(r.get("vendedor"))
        B = nodos_de(r.get("comprador"))
        registros.append((S, B))
        for n in set(S) | set(B):
            freq[n] += 1

    alias = {}
    if modo == "afondo":
        alias = construye_alias(freq)

    curados = cargar_alias_curados() if modo == "curada" else {}

    def canon(n):
        if modo == "curada":
            return curados.get(clave_match(n), n)
        return alias.get(n, n)

    G = nx.DiGraph()
    compras, ventas = Counter(), Counter()
    for S, B in registros:
        S = [canon(s) for s in S]
        B = [canon(b) for b in B]
        for b in set(B):
            compras[b] += 1
        for s in set(S):
            ventas[s] += 1
        for s in S:
            for b in B:
                if s != b:
                    G.add_edge(s, b)
    G.add_nodes_from(compras)
    G.add_nodes_from(ventas)
    return G, compras, ventas


def cv(counter, universo):
    import statistics
    vals = [counter.get(n, 0) for n in universo]
    mu = statistics.mean(vals) if vals else 0
    sd = statistics.pstdev(vals) if vals else 0
    return sd / mu if mu else 0


def resumen(modo):
    G, compras, ventas = construir(modo)
    U = list(G.nodes())
    N, L = G.number_of_nodes(), G.number_of_edges()
    Gu = G.to_undirected()
    comps = sorted(nx.connected_components(Gu), key=len, reverse=True)
    gigante = len(comps[0]) if comps else 0
    k = 2 * L / N if N else 0
    dens = nx.density(G)
    btw = nx.betweenness_centrality(G) if N else {}
    top_compras = compras.most_common(5)
    top_btw = sorted(btw.items(), key=lambda t: -t[1])[:5]
    # Caicedo (busca la variante canónica dominante)
    cai = [n for n in U if "sebasti" in n and "caicedo" in n]
    cai_stats = [(n, compras.get(n, 0), ventas.get(n, 0), round(btw.get(n, 0), 3))
                 for n in cai]
    return {
        "modo": modo, "N": N, "L": L, "k": round(k, 2), "dens": round(dens, 4),
        "comps": len(comps), "gigante": gigante,
        "gigante_pct": round(100 * gigante / N, 1) if N else 0,
        "cv_compras": round(cv(compras, U), 2),
        "max_compras": max(compras.values()) if compras else 0,
        "top_compras": top_compras, "top_btw": top_btw, "caicedo": cai_stats,
    }


def comparar():
    filas = [resumen(m) for m in ("raw", "moderada", "afondo", "curada")]
    print("\n=== MÉTRICAS ESTRUCTURALES ===")
    campos = ["modo", "N", "L", "k", "dens", "comps", "gigante", "gigante_pct",
              "cv_compras", "max_compras"]
    anchos = {c: max(len(c), *(len(str(f[c])) for f in filas)) for c in campos}
    print("  " + " | ".join(c.ljust(anchos[c]) for c in campos))
    for f in filas:
        print("  " + " | ".join(str(f[c]).ljust(anchos[c]) for c in campos))

    for f in filas:
        print(f"\n=== {f['modo'].upper()} — TOP ACUMULADORES (compras) ===")
        for n, d in f["top_compras"]:
            print(f"    {d:3}  {n[:48]}")
        print(f"    -- TOP BROKERS (betweenness) --")
        for n, b in f["top_btw"]:
            print(f"    {b:.3f}  {n[:44]}")
        print(f"    -- Sebastián Caicedo (variantes) --")
        for n, c, v, b in f["caicedo"]:
            print(f"    compras={c:2} ventas={v:2} btw={b}  {n[:40]}")


def escribir(modo, salida):
    G, compras, ventas = construir(modo)
    with open(salida, "w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["source", "target"])
        for u, v in G.edges():
            w.writerow([u, v])
    print(f"Escrito {salida.name}: {G.number_of_nodes()} nodos, {G.number_of_edges()} aristas")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--comparar", action="store_true")
    ap.add_argument("--modo", choices=["raw", "moderada", "afondo", "curada"])
    args = ap.parse_args()
    if args.comparar or not args.modo:
        comparar()
    else:
        escribir(args.modo, AQUI / f"red_{args.modo}.csv")
