#!/usr/bin/env python3
"""
Prepara los datos del Taller 5 («La renta del suelo en Cali») en src/lib/datos.json.

Dos épocas que no se pueden cruzar registro por registro (hay 80 años en medio), solo
por lugar: por barrio y por distancia a la Plaza de Caicedo.

1941–1944 · compraventas de la Notaría 2 con precio y área
  - investigacion/ACH/outputs/transacciones/transacciones_ach.csv (extracción del
    Archivo Histórico de Cali, sep-2026). Solo escrituras completas. Es local: la carpeta
    investigacion/ no está en el repo. Hace falta solo para regenerar este JSON.
  - data/consolidado_notaria2.csv, años 1942–1944, para las escrituras que el ACH no
    trae (se descartan las que ya están, por año + número de escritura, o por año +
    precio cuando no hay número, como en 1944).
  Se excluyen retroventas (son préstamos con garantía, no precios de mercado), promesas,
  hipotecas y ventas parciales (mitades, cuotas, derechos): en esas no se sabe si el área
  es la del lote completo o la de la parte vendida.

2020–2026 · avisos de venta de Johan Torres (trabajo de grado sobre gentrificación)
  - 2026-II/0.Insumos/johan_torres/df_cali_limpia valor alquiler.xlsx (no se versiona:
    son datos de terceros). Pese al nombre, son precios de venta, no de alquiler.
  - 2025 no viene, y 2026 trae solo casas y casas campestres, cargadas a las comunas 2,
    17, 19 y 22: es otra muestra. Por eso 2020–2024 es la referencia y 2026 aparece solo
    en la parte de composición.

Las ubicaciones del 40 se ponen en el centro del barrio de hoy (mediana de las
coordenadas de los avisos de Johan en ese barrio). Es una aproximación de barrio, no de
predio: el campo `ubicacion` del ACH no es confiable para georreferenciar con más detalle.

Uso (desde la raíz del repo):
  /opt/homebrew/bin/python3.11 "2026-II/5.Taller_Renta/taller-renta/scripts/preparar_datos.py"
"""
import json
import re
import unicodedata
from pathlib import Path

import numpy as np
import pandas as pd

RAIZ = Path(__file__).resolve().parents[4]
ACH = RAIZ / "investigacion/ACH/outputs/transacciones/transacciones_ach.csv"
NOTARIA = RAIZ / "data/consolidado_notaria2.csv"
JOHAN = RAIZ / "2026-II/0.Insumos/johan_torres/df_cali_limpia valor alquiler.xlsx"
SALIDA = Path(__file__).resolve().parents[1] / "src/lib/datos.json"

# Plaza de Caicedo: el centro fundacional, punto cero de la distancia.
PLAZA = (3.4515, -76.5320)

# Anillos de distancia (km) para resumir. Los del 40 son menos porque la ciudad era chica.
ANILLOS_40 = [0, 1, 2, 3, 5, 12]
ANILLOS_HOY = [0, 2, 4, 6, 8, 10, 14, 25]

# Barrio o paraje como lo nombran las escrituras → barrio de hoy en la base de Johan.
# El primero que aparece en el texto manda (las escrituras nombran barrios vecinos en
# los linderos). Vilachí y El Sindicato se dejan sin ubicar: no hay certeza de a qué
# barrio de hoy corresponden. La Chanca de las escrituras (calles 3–6 con carreras 12–14)
# es la de la comuna 3, no el corregimiento de Navarro.
PUENTE = [
    (r"san fernando", "San Fernando", ["San Fernando Viejo", "San Fernando Nuevo"]),
    (r"jorge isaacs", "Jorge Isaacs", ["Jorge Isaacs"]),
    (r"barrio obrero|ejidos del barrio obrero", "Obrero", ["Barrio Obrero"]),
    (r"\bsucre\b", "Sucre", ["Sucre"]),
    (r"alameda", "La Alameda", ["Alameda"]),
    (r"san nicolas", "San Nicolás", ["San Nicolás"]),
    (r"belalcazar|belarcazar|velalcazar|matadero", "Belalcázar (El Matadero)", ["Belalcázar"]),
    (r"granada", "Granada", ["Granada"]),
    (r"cascajero|saavedra galindo", "Saavedra Galindo (El Cascajero)", ["Saavedra Galindo"]),
    (r"santa rosa|las galerias", "Santa Rosa (Las Galerías)", ["Santa Rosa"]),
    (r"san antonio|loma de la cruz", "San Antonio", ["San Antonio"]),
    (r"centenario", "Centenario", ["Centenario"]),
    (r"juanambu", "Juanambú", ["Juanambú"]),
    (r"santa monica", "Santa Mónica", ["Santa Mónica"]),
    (r"paso ?ancho", "Pasoancho", ["Pasoancho"]),
    (r"porvenir", "El Porvenir", ["Porvenir"]),
    (r"versalles", "Versalles", ["Versalles"]),
    (r"el pueblo|del pueblo|general santander", "El Pueblo (Santander)", ["Santander"]),
    (r"bretana", "Bretaña", ["Bretaña"]),
    (r"san juan bosco", "San Juan Bosco", ["San Juan Bosco"]),
    (r"bellavista", "Bellavista", ["Bellavista"]),
    (r"calvario", "El Calvario", ["El Calvario"]),
    (r"el penon", "El Peñón", ["El Peñón"]),
    (r"santa teresita", "Santa Teresita", ["Santa Teresita"]),
    (r"el piloto", "El Piloto", ["El Piloto"]),
    (r"la floresta", "La Floresta", ["La Floresta"]),
    (r"la merced", "La Merced", ["La Merced"]),
    (r"san pedro|plaza de caicedo", "San Pedro (Plaza de Caicedo)", ["San Pedro"]),
    (r"primero de mayo", "Primero de Mayo", ["Primero de Mayo"]),
    (r"la chanca", "La Chanca", ["Navarro - La Chanca"]),
    # Corregimientos de 1940 que hoy son ciudad: la base del cono.
    (r"pance", "Pance (corregimiento)", ["Parcelaciones Pance"]),
    (r"melendez", "Meléndez (corregimiento)", ["Meléndez"]),
]


def norm(s) -> str:
    return unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower()


def numero(t):
    """Primer número de un texto de área, con separadores US o europeos."""
    t = str(t).replace("≈", "").replace("~", "")
    m = re.search(r"\d[\d.,]*", t)
    if not m:
        return None
    s = m.group(0).rstrip(".,")
    if re.fullmatch(r"\d{1,3}(\.\d{3})+(,\d+)?", s):
        s = s.replace(".", "").replace(",", ".")
    elif re.fullmatch(r"\d{1,3}(,\d{3})+(\.\d+)?", s):
        s = s.replace(",", "")
    elif re.fullmatch(r"\d+,\d{1,2}", s):
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def ubicar(texto):
    """(barrio como en la escritura, barrios de hoy) del primer lugar que se nombra."""
    t = norm(texto)
    mejor = None
    for patron, historico, hoy in PUENTE:
        m = re.search(patron, t)
        if m and (mejor is None or m.start() < mejor[0]):
            mejor = (m.start(), historico, hoy)
    return (mejor[1], mejor[2]) if mejor else (None, None)


def km(lat, lon):
    return np.hypot((lat - PLAZA[0]) * 111.0, (lon - PLAZA[1]) * 111.0 * np.cos(np.radians(PLAZA[0])))


def redondo(x, n=2):
    return None if x is None or pd.isna(x) else round(float(x), n)


# ─────────────────────────────────────────────────────────────────────────────
# 2020–2026: Johan
# ─────────────────────────────────────────────────────────────────────────────
j = pd.read_excel(JOHAN)
n_crudo = len(j)
j = j.drop_duplicates(subset=["subcategoria", "barrio", "area", "precio", "anio", "latitud", "longitud"])
j["km"] = km(j.latitud, j.longitud)
# Sector según el rumbo desde la plaza. Norte/sur a secas no sirve: el sur mezclaría
# Ciudad Jardín con el oriente (Aguablanca), que van en direcciones opuestas.
rumbo = np.degrees(np.arctan2(j.latitud - PLAZA[0], (j.longitud - PLAZA[1]) * np.cos(np.radians(PLAZA[0]))))
j["sector"] = np.select([(rumbo >= 45) & (rumbo < 135), (rumbo >= -45) & (rumbo < 45), (rumbo >= -135) & (rumbo < -45)],
                        ["norte", "oriente", "sur"], "occidente")
ref = j[j.anio <= 2024]
mediana_hoy = float(ref.precio_m2.median())

centro = j.groupby("barrio")[["latitud", "longitud"]].median()

# Perfil por anillos, un sector a la vez: el cono roto.
perfil_hoy = []
for sector in ["sur", "oriente", "norte", "occidente"]:
    sub = ref[ref.sector == sector]
    for i in range(len(ANILLOS_HOY) - 1):
        a0, b0 = ANILLOS_HOY[i], ANILLOS_HOY[i + 1]
        g = sub[(sub.km > a0) & (sub.km <= b0)].precio_m2
        if len(g) >= 10:
            perfil_hoy.append({"sector": sector, "desde": a0, "hasta": b0, "n": int(len(g)),
                               "mediana": round(float(g.median()), -3)})

# Rótulos del mapa: barrios que cualquiera en Cali ubica.
ROTULOS = {"Granada": "Granada", "San Fernando Viejo": "San Fernando", "Urbanización Ciudad Jardín": "Ciudad Jardín",
           "Parcelaciones Pance": "Pance", "Mojica": "Mojica", "Siloé": "Siloé", "Menga": "Menga",
           "El Ingenio": "El Ingenio", "Alfonso Lopez P. 1a Etapa": "Alfonso López"}
rotulos = [{"nombre": v, "lat": round(float(centro.loc[k_, "latitud"]), 4), "lon": round(float(centro.loc[k_, "longitud"]), 4)}
           for k_, v in ROTULOS.items() if k_ in centro.index]

# Malla para el mapa: celdas de ~0,005° (unos 550 m), mediana relativa a la ciudad.
PASO = 0.005
ref = ref.assign(ci=(ref.latitud / PASO).round().astype(int), cj=(ref.longitud / PASO).round().astype(int))
celdas = []
for (ci, cj), g in ref.groupby(["ci", "cj"]):
    if len(g) >= 3:
        celdas.append({"lat": round(ci * PASO, 4), "lon": round(cj * PASO, 4), "n": int(len(g)),
                       "indice": round(float(g.precio_m2.median()) / mediana_hoy, 2)})

# Medianas ingenuas por año y tipo (incluye 2026) frente al índice dentro de barrio y tipo.
ingenuas = []
for (anio, tipo), g in j.groupby(["anio", "subcategoria"]):
    ingenuas.append({"anio": int(anio), "tipo": tipo, "n": int(len(g)), "mediana": round(float(g.precio_m2.median()), -3)})

k = j[j.subcategoria != "Casa campestre"].copy()
k["celda"] = k.barrio + "|" + k.subcategoria
k["y"] = np.log(k.precio_m2)
X = pd.get_dummies(k.anio.astype(str), drop_first=True).astype(float)
Xd = X - X.groupby(k.celda).transform("mean")
yd = k.y - k.groupby("celda").y.transform("mean")
b, *_ = np.linalg.lstsq(Xd.values, yd.values, rcond=None)
indice = [{"anio": 2020, "indice": 100.0}] + [
    {"anio": int(c), "indice": round(100 * float(np.exp(v)), 1)} for c, v in zip(X.columns, b)
]

# Composición por comuna: 2020–2024 frente a 2026.
comp = []
for c in sorted(j.comuna.unique()):
    comp.append({
        "comuna": int(c),
        "ref": round(float((ref.comuna == c).mean()) * 100, 1),
        "y2026": round(float((j[j.anio == 2026].comuna == c).mean()) * 100, 1),
        "mediana": round(float(ref[ref.comuna == c].precio_m2.median()), -3) if (ref.comuna == c).any() else None,
    })

# ─────────────────────────────────────────────────────────────────────────────
# 1941–1944: Notaría 2 (ACH + consolidado)
# ─────────────────────────────────────────────────────────────────────────────
a = pd.read_csv(ACH)
a = a[(a.completa == True) & a.anio.between(1941, 1944)].copy()
a["clave"] = a.anio.astype(int).astype(str) + "-" + a.escritura.astype(str).str.extract(r"(\d+)")[0].fillna("?")
a["area_m2"] = a.area_num_m2
a["lugar"] = a.ubicacion.fillna("")
a["obs"] = a.observaciones.fillna("")
a["tipo_txt"] = a.tipo_inmueble.fillna("")
a["fuente"] = "ACH"
neg = a.negocio.fillna("").map(norm)
# Ventas de una parte del inmueble. Ojo: «cuotas» y «%» a secas son plazos e intereses.
PARCIAL = (r"mitad|indivis|cuota (?:o accion|parte|de dominio)|derechos (?:equivalentes|de comunero|herencia|sucesor)"
           r"|% del (?:inmueble|lote|predio|terreno)")
parcial = (a.observaciones.fillna("") + " " + a.area_texto.fillna("")).map(norm).str.contains(PARCIAL)
a["valida"] = (neg.str.contains("compraventa") & ~neg.str.contains("retroventa|promesa")
               & ~parcial & ~a.tipo_txt.isin(["derechos", "finca", "otro"]))
a["tipo"] = np.where(a.tipo_txt == "lote", "lote", "casa")

d = pd.read_csv(NOTARIA)
d = d[d.anio >= 1942].copy()
d["clave"] = d.anio.astype(int).astype(str) + "-" + d.escritura.astype(str).str.extract(r"(\d+)")[0].fillna("?")
# Fuera lo que ya está en el ACH: por escritura, o por año + precio si no hay número.
ya = set(a.clave) | set(a.anio.astype(int).astype(str) + "$" + a.valor_num.round(0).astype(str))
d = d[~d.clave.isin(ya) & ~(d.anio.astype(str) + "$" + d.valor_num.round(0).astype(str)).isin(ya)]
d["area_m2"] = d.area.map(numero)
d["lugar"] = d.negocio.fillna("")
d["obs"] = d.negocio.fillna("")
d["fecha"] = d.fecha.astype(str).str[:10]
d["fuente"] = "Notaría 2 (consolidado)"
nt = d.negocio.fillna("").map(norm)
d["valida"] = (nt.str.contains(r"vend|venta|compraventa")
               & ~nt.str.contains(r"hipoteca|mutuo|cancela|poder|retroventa|promesa|finca|hacienda")
               & ~nt.str.contains(PARCIAL))


def tipo_por_texto(t):
    """Lo que se nombra primero: «venta de lote… lindando con casa de X» es un lote."""
    c, l = re.search(r"casa", t), re.search(r"lote|terreno|solar", t)
    if c and (not l or c.start() < l.start()):
        return "casa"
    return "lote" if l else "otro"


d["tipo"] = nt.map(tipo_por_texto)

cols = ["fuente", "anio", "fecha", "clave", "vendedor", "comprador", "valor_num", "area_m2", "lugar", "obs", "tipo", "valida"]
h = pd.concat([a[cols], d[cols]], ignore_index=True)
# El Municipio vende ejidos: el suelo. Si hay casa, es mejora del arrendatario que compra
# (varias escrituras lo dicen), así que el precio no la incluye. Cuenta como lote.
h["municipio"] = h.vendedor.fillna("").str.contains(r"Municipio|Distrito de Cali")
h.loc[h.municipio, "tipo"] = "lote"
h = h[h.valida & h.valor_num.gt(0) & h.area_m2.ge(20) & h.tipo.isin(["lote", "casa"])].copy()
h["pm2"] = h.valor_num / h.area_m2
h["arrendatario"] = h.obs.map(norm).str.contains("arrendatari")

# Quién vende: las variantes de un mismo nombre se unen a mano.
CANON = [
    (r"municipio|distrito de cali", "Municipio de Cali"),
    (r"colombian holding", "Colombian Holding Corporation"),
    (r"compania central de construcciones", "Compañía Central de Construcciones"),
    (r"tejares? (de )?san fernando", "Tejares San Fernando S. A."),
    (r"susana caicedo de vaccari", "Susana Caicedo de Vaccari"),
    (r"tejar de santa monica", "Tejar de Santa Mónica"),
]


def vendedor_canonico(v):
    t = norm(v)
    for patron, nombre in CANON:
        if re.search(patron, t):
            return nombre
    return str(v)


h["vendedor_canon"] = h.vendedor.fillna("").map(vendedor_canonico)
ub = h.lugar.map(ubicar)
h["barrio"] = ub.map(lambda x: x[0])
h["barrios_hoy"] = ub.map(lambda x: x[1])


def centro_de(hoy):
    if not hoy:
        return (np.nan, np.nan)
    sub = centro.loc[[b for b in hoy if b in centro.index]]
    return (sub.latitud.median(), sub.longitud.median()) if len(sub) else (np.nan, np.nan)


cc = h.barrios_hoy.map(centro_de)
h["lat"] = cc.map(lambda x: x[0])
h["lon"] = cc.map(lambda x: x[1])
h["km"] = km(h.lat, h.lon)
h = h.sort_values(["anio", "fecha"], na_position="last").reset_index(drop=True)

mediana_40_lotes = float(h[h.tipo == "lote"].pm2.median())

resumen_anual = []
for (anio, tipo), g in h.groupby(["anio", "tipo"]):
    resumen_anual.append({"anio": int(anio), "tipo": tipo, "n": int(len(g)), "mediana": redondo(g.pm2.median())})

perfil_40 = []
for tipo in ["lote", "casa"]:
    s = h[(h.tipo == tipo) & h.km.notna()]
    for i in range(len(ANILLOS_40) - 1):
        a0, b0 = ANILLOS_40[i], ANILLOS_40[i + 1]
        g = s[(s.km > a0) & (s.km <= b0)].pm2
        if len(g) >= 3:
            perfil_40.append({"tipo": tipo, "desde": a0, "hasta": b0, "n": int(len(g)), "mediana": redondo(g.median())})

# Barrios con al menos 3 lotes en el 40: su índice entonces y el de su barrio hoy.
barrios = []
for barrio, g in h[h.barrio.notna()].groupby("barrio"):
    hoy = g.barrios_hoy.iloc[0]
    lotes = g[g.tipo == "lote"].pm2
    hj = ref[ref.barrio.isin(hoy)].precio_m2
    barrios.append({
        "barrio": barrio,
        "hoy": " / ".join(hoy),
        "lat": redondo(g.lat.iloc[0], 4),
        "lon": redondo(g.lon.iloc[0], 4),
        "km": redondo(g.km.iloc[0], 1),
        "n_lotes": int(len(lotes)),
        "n_casas": int((g.tipo == "casa").sum()),
        "lote_mediana": redondo(lotes.median()) if len(lotes) else None,
        "indice_40": redondo(lotes.median() / mediana_40_lotes) if len(lotes) else None,
        "n_hoy": int(len(hj)),
        "mediana_hoy": round(float(hj.median()), -3) if len(hj) else None,
        "indice_hoy": redondo(hj.median() / mediana_hoy) if len(hj) else None,
    })
barrios.sort(key=lambda x: -(x["n_lotes"] + x["n_casas"]))

escrituras = [
    {
        "id": i,
        "fuente": r.fuente,
        "anio": int(r.anio),
        "fecha": None if pd.isna(r.fecha) or str(r.fecha) in ("nan", "NaT") else str(r.fecha)[:10],
        "vendedor": str(r.vendedor) if pd.notna(r.vendedor) else "",
        "comprador": str(r.comprador) if pd.notna(r.comprador) else "",
        "valor": redondo(r.valor_num),
        "area": redondo(r.area_m2, 1),
        "pm2": redondo(r.pm2, 3),
        "tipo": r.tipo,
        "municipio": bool(r.municipio),
        "arrendatario": bool(r.arrendatario),
        "barrio": r.barrio if isinstance(r.barrio, str) else None,
        "km": redondo(r.km, 2),
        "lugar": re.sub(r"\s+", " ", str(r.lugar))[:220],
    }
    for i, r in h.iterrows()
]

vendedores = []
for v, g in h.groupby("vendedor_canon"):
    if len(g) >= 4:
        vendedores.append({
            "vendedor": v,
            "n": int(len(g)),
            "n_lotes": int((g.tipo == "lote").sum()),
            "mediana": redondo(g[g.tipo == "lote"].pm2.median()) if (g.tipo == "lote").any() else None,
            "barrios": [b for b, _ in g.barrio.value_counts().head(3).items()],
        })
vendedores.sort(key=lambda x: -x["n"])

datos = {
    "plaza": {"lat": PLAZA[0], "lon": PLAZA[1]},
    "cuarenta": {
        "n": len(h),
        "n_lotes": int((h.tipo == "lote").sum()),
        "n_casas": int((h.tipo == "casa").sum()),
        "n_ubicadas": int(h.km.notna().sum()),
        "mediana_lotes": redondo(mediana_40_lotes),
        "resumen_anual": resumen_anual,
        "perfil": perfil_40,
        "barrios": barrios,
        "vendedores": vendedores,
        "municipio": {
            "n": int(h.municipio.sum()),
            "mediana": redondo(h[h.municipio].pm2.median()),
            "a_arrendatarios": int((h.municipio & h.arrendatario).sum()),
            "mediana_particulares": redondo(h[~h.municipio & (h.tipo == "lote")].pm2.median()),
            "n_particulares": int((~h.municipio & (h.tipo == "lote")).sum()),
        },
        "escrituras": escrituras,
    },
    "hoy": {
        "n_crudo": n_crudo,
        "n": len(j),
        "n_ref": len(ref),
        "mediana": round(mediana_hoy, -3),
        "perfil": perfil_hoy,
        "celdas": celdas,
        "rotulos": rotulos,
        "ingenuas": ingenuas,
        "indice": indice,
        "composicion": comp,
    },
}
SALIDA.write_text(json.dumps(datos, ensure_ascii=False, separators=(",", ":"), allow_nan=False))

print(f"1941–44: {len(h)} compraventas ({datos['cuarenta']['n_lotes']} lotes, {datos['cuarenta']['n_casas']} casas), "
      f"{datos['cuarenta']['n_ubicadas']} ubicadas; mediana lotes {mediana_40_lotes:.2f} $/m²")
print(pd.DataFrame(resumen_anual).pivot(index="anio", columns="tipo", values=["n", "mediana"]))
print(pd.DataFrame(perfil_40))
print(pd.DataFrame(barrios)[["barrio", "km", "n_lotes", "n_casas", "lote_mediana", "indice_40", "n_hoy", "indice_hoy"]].to_string())
print("Vendedores:", [(v["vendedor"], v["n"], v["mediana"]) for v in vendedores])
print("Municipio:", datos["cuarenta"]["municipio"])
print(f"Hoy: {n_crudo} avisos, {len(j)} sin duplicados, {len(ref)} de 2020–24; mediana {mediana_hoy:,.0f} $/m²")
print(pd.DataFrame(perfil_hoy).pivot(index="sector", columns="desde", values="mediana"))
print("Índice dentro de barrio y tipo:", indice)
print("Celdas del mapa:", len(celdas))
print(f"→ {SALIDA} ({SALIDA.stat().st_size / 1024:.0f} KB)")
