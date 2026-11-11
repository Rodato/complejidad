#!/usr/bin/env python3
"""
Prepara los datos del quiz «Renta, gentrificación y segregación» en src/lib/datos.json.

Cinco preguntas que aplican dos lecturas a nuestros datos:
  - Gilma Mosquera y Jacques Aprile-Gniset, «Notas sobre el proceso de segregación social
    en el espacio urbano» (1980), págs. 67–95; sobre todo 70–72, 88–91 y la nota 5 (94–95).
  - Neil Smith, «Toward a Theory of Gentrification» (1979), págs. 538–548.

Fuentes (todas en el repo salvo la base de avisos):
  - 2026-II/5.Taller_Renta/taller-renta/src/lib/datos.json: las 269 compraventas de 1941–44
    ya depuradas por el Taller 5 (ACH + consolidado), con barrio, $/m² y partes. Se usan tal
    cual, con una corrección: la escritura id 140 (Martínez → Caicedo de Vaccari, 1.233 m²,
    $14.000, 4-feb-1943, «Versalles») repite la id 134 (26-ene-1943, «barrio Granada
    (antiguamente Versalles)»). Es la misma venta y se cuenta una vez, en Granada.
  - 2026-II/0.Insumos/johan_torres/df_cali_limpia valor alquiler.xlsx: avisos de venta
    2020–2024 (no se versiona). Mismos filtros del Taller 5: sin duplicados, sin 2026, sin
    casas campestres.
  - 2026-II/graficos/segregacion_precios/{indice,nivel}_grupos.csv: los agregados de la
    gráfica para Mosquera y Aprile (11-nov-2026): m² de apartamento 2022–23 y cambio real
    por grupo de barrios.

El quiz no nombra a quien aportó la base de avisos (como el Taller 5).

Uso (desde la raíz del repo):
  /opt/homebrew/bin/python3.11 2026-II/6.Quiz_Gentrificacion/quiz-gentrificacion/scripts/preparar_datos.py
"""
import json
import re
import unicodedata
from pathlib import Path

import pandas as pd

AQUI = Path(__file__).resolve().parents[1]
RAIZ = Path(__file__).resolve().parents[4]
T5 = RAIZ / "2026-II/5.Taller_Renta/taller-renta/src/lib/datos.json"
JOHAN = RAIZ / "2026-II/0.Insumos/johan_torres/df_cali_limpia valor alquiler.xlsx"
GRAFICOS = RAIZ / "2026-II/graficos/segregacion_precios"
SALIDA = AQUI / "src/lib/datos.json"

DUPLICADA = 140  # misma venta que la id 134


def norm(s):
    return unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower()


def limpio(nombre):
    """Sin cédulas ni notas entre paréntesis o corchetes: en la app va solo el nombre."""
    n = re.sub(r"\s*\[.*?\]", "", str(nombre))  # primero los corchetes: pueden llevar «c)» adentro
    n = re.sub(r"\s*\(.*?\)", "", n)
    n = re.sub(r"^Dr\.\s*", "", n).replace("Municipío", "Municipio")
    return re.sub(r"\s+", " ", n).strip(" ;")


def r2(x, d=2):
    return None if x is None or pd.isna(x) else round(float(x), d)


# ─────────────────────────────────────────────────────────────────────────────
# 1941–1944
# ─────────────────────────────────────────────────────────────────────────────
t5 = json.loads(T5.read_text())
c = t5["cuarenta"]
e = pd.DataFrame(c["escrituras"])
e = e[e.id != DUPLICADA].copy()
lotes = e[e.tipo == "lote"]
med40 = float(lotes.pm2.median())

# Pregunta 1 · la doble curva: el cono por anillos (del Taller 5) y las esquinas.
perfil = [p for p in c["perfil"] if p["tipo"] == "lote"]
esq = lotes.lugar.map(norm).str.contains("esquina")
NOMBRE_SIN_BARRIO = {"Sindicato": "barrio del Sindicato (ejido)"}


def donde(fila):
    if isinstance(fila.barrio, str):
        return fila.barrio
    t = norm(fila.lugar)
    if "sindicato" in t:
        return "Barrio del Sindicato (ejido)"
    m = re.search(r"esquina[^,]*", fila.lugar, flags=re.I)
    return m.group(0).strip().capitalize() if m else fila.lugar


esquinas = [
    {"anio": int(f.anio), "donde": donde(f), "pm2": r2(f.pm2), "area": r2(f.area, 1)}
    for f in lotes[esq].sort_values("pm2").itertuples()
]

# Pregunta 2 · la ruta de la fuga: lo que se vendió en el viejo y en los nuevos bastiones.
FUGA = ["La Merced", "Centenario", "Granada", "Versalles"]
fuga = [
    {"fecha": f.fecha, "anio": int(f.anio), "barrio": f.barrio, "tipo": f.tipo,
     "vendedor": limpio(f.vendedor), "comprador": limpio(f.comprador),
     "pm2": r2(f.pm2), "area": r2(f.area, 1)}
    for f in e[e.barrio.isin(FUGA)].sort_values(["anio", "fecha"]).itertuples()
]

# Pregunta 3 · posición de cada barrio en su época (precio ÷ mediana de la ciudad).
hoy_t5 = {b["barrio"]: b for b in c["barrios"]}
POSICIONES = ["Centenario", "Granada", "Versalles", "Juanambú", "Santa Mónica", "San Fernando"]
posiciones = []
for b in POSICIONES:
    l40 = lotes[lotes.barrio == b].pm2
    h = hoy_t5[b]
    posiciones.append({
        "barrio": b, "n_40": int(len(l40)), "pm2_40": r2(l40.median()), "pos_40": r2(l40.median() / med40),
        "n_hoy": h["n_hoy"], "pm2_hoy": h["mediana_hoy"], "pos_hoy": h["indice_hoy"],
    })

# Pregunta 5 · San Antonio en 1942.
sa40 = e[e.barrio == "San Antonio"].sort_values("fecha")
san_antonio_40 = [
    {"fecha": f.fecha, "vendedor": limpio(f.vendedor), "comprador": limpio(f.comprador),
     "pm2": r2(f.pm2), "area": r2(f.area, 1)}
    for f in sa40.itertuples()
]

# ─────────────────────────────────────────────────────────────────────────────
# 2020–2024
# ─────────────────────────────────────────────────────────────────────────────
j = pd.read_excel(JOHAN)
j = j.drop_duplicates(subset=["subcategoria", "barrio", "area", "precio", "anio", "latitud", "longitud"])
j = j[(j.subcategoria != "Casa campestre") & (j.anio <= 2024)]
med_hoy = float(j.precio_m2.median())


def resumen(sub):
    return {"n": int(len(sub)), "pm2": r2(sub.precio_m2.median(), 0), "pos": r2(sub.precio_m2.median() / med_hoy),
            "apto_pct": r2(100 * (sub.subcategoria == "Apartamento").mean(), 0),
            "nuevo_pct": r2(100 * (sub.estado == "Nuevo").mean(), 0), "area": r2(sub.area.median(), 0)}


sa = j[j.barrio == "San Antonio"]
san_antonio_hoy = resumen(sa) | {"por_anio": {str(k): int(v) for k, v in sa.anio.value_counts().sort_index().items()},
                                 "casas": int((sa.subcategoria == "Casa").sum()), "usadas": int((sa.estado == "Usado").sum())}
CENTRO = {"La Merced": ["La Merced"], "Granada": ["Granada"], "El Peñón": ["El Peñón"], "San Antonio": ["San Antonio"]}
centro = [{"barrio": k} | resumen(j[j.barrio.isin(v)]) for k, v in CENTRO.items()]

c22 = j[j.comuna == 22]
nuevo = {"c22_n": int(len(c22)), "c22_nuevo": int((c22.estado == "Nuevo").sum()),
         "ciudad_n": int(len(j)), "ciudad_nuevo": int((j.estado == "Nuevo").sum())}
cj = resumen(j[j.barrio == "Urbanización Ciudad Jardín"])

# Pregunta 4 · los grupos de la gráfica de precios.
TITULOS = {
    "sur_alto": "Ciudad Jardín y Pance", "oeste": "Normandía y vecinos", "aguacatal": "Aguacatal y Terrón Colorado",
    "norte_trad": "Santa Mónica y el norte", "c19": "San Fernando y Santa Isabel", "lili": "Valle del Lili",
    "c17": "El Ingenio, Caney, Capri…", "medio_oriente": "Centro-oriente", "aguablanca": "Distrito de Aguablanca",
}
ind = pd.read_csv(GRAFICOS / "indice_grupos.csv")
niv = pd.read_csv(GRAFICOS / "nivel_grupos.csv", index_col=0)
grupos = []
for clave, titulo in TITULOS.items():
    ult = ind[ind.grupo == clave].sort_values("anio").iloc[-1]
    grupos.append({"clave": clave, "titulo": titulo, "apto": r2(niv.loc[clave, "apto"], 0),
                   "n_apto": int(niv.loc[clave, "n_apto"]), "anio_real": int(ult.anio),
                   "real": r2(100 * (ult.indice / ult.ipc - 1), 1)})

datos = {
    "cuarenta": {
        "n": int(len(e)), "n_lotes": int(len(lotes)), "mediana_lotes": r2(med40),
        "perfil": perfil,
        "esquinas": esquinas, "n_esquina": int(esq.sum()), "mediana_esquina": r2(lotes[esq].pm2.median()),
        "n_resto": int((~esq).sum()), "mediana_resto": r2(lotes[~esq].pm2.median()),
        "fuga": fuga, "posiciones": posiciones, "san_antonio": san_antonio_40,
    },
    "hoy": {
        "n": int(len(j)), "mediana": r2(med_hoy, 0),
        "grupos": grupos, "nuevo": nuevo, "ciudad_jardin": cj,
        "san_antonio": san_antonio_hoy, "centro": centro,
    },
}
SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1))

# Lo que el quiz pregunta, para verificar a ojo.
print(f"1941–44: {len(e)} escrituras, {len(lotes)} lotes, mediana ${med40:.2f}")
print("perfil:", [(p['desde'], p['hasta'], p['n'], p['mediana']) for p in perfil])
print(f"esquina: {int(esq.sum())} lotes, mediana {lotes[esq].pm2.median():.2f}; resto {int((~esq).sum())}, "
      f"{lotes[~esq].pm2.median():.2f}; razón {lotes[esq].pm2.median() / lotes[~esq].pm2.median():.2f}")
print(pd.DataFrame(esquinas).to_string(index=False))
print(pd.DataFrame(fuga)[["anio", "barrio", "tipo", "pm2", "vendedor", "comprador"]].to_string(index=False))
print(pd.DataFrame(posiciones).to_string(index=False))
g = next(p for p in posiciones if p["barrio"] == "Granada")
print(f"caída de Granada: {g['pos_40']} / {g['pos_hoy']} = {g['pos_40'] / g['pos_hoy']:.1f}")
print("San Antonio 1942:", pd.DataFrame(san_antonio_40)[["fecha", "pm2", "area"]].values.tolist())
print("San Antonio hoy:", san_antonio_hoy)
print("centro hoy:", centro)
print("nuevo:", nuevo, "Ciudad Jardín:", cj)
print(pd.DataFrame(grupos).to_string(index=False))
