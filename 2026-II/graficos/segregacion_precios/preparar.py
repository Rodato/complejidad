#!/usr/bin/env python3
"""
Precios de vivienda por grupos de barrios, 2020–2024: el gráfico para leer a Mosquera y
Aprile (1980), «Notas sobre el proceso de segregación social en el espacio urbano»,
págs. 85–91 (el ciclo atracción-expulsión: el grupo dirigente funda un bastión, las capas
medias lo invaden, el grupo dirigente se va y funda otro).

Lo pidió Boris el 11-nov-2026: evolución de precios de barrios de clase alta y media, y del
proletariado hacia la clase media en el corredor sur (desde Valle del Lili).

Fuente: avisos de venta de Johan Torres (2026-II/0.Insumos/johan_torres/, no se versiona).
Mismas decisiones que el Taller 5 (ver su README):
  - 2020–2024 es la referencia. 2026 queda fuera: es otra muestra (solo casas y casas
    campestres, cargadas al sur y al oeste) y salta en todos los grupos.
  - Sin casas campestres.
  - Índice ajustado por barrio y tipo: regresión del log del precio por m² con efectos
    fijos barrio × tipo y dummies de año, ahora una por grupo. Base 2022 = 100, porque es el
    único año en que todos los grupos tienen avisos. Un año entra si el grupo tiene al
    menos 10 avisos ese año.
  - Banda: percentiles 5–95 de 500 réplicas bootstrap, remuestreando avisos dentro de cada
    año. Mide el ruido de la muestra, no el sesgo de qué zonas cubrió cada año.
  - Inflación: IPC a diciembre (DANE), la misma tabla de la parte 6 del Taller 5.

Los grupos son nuestros (por zona y precio) y el gráfico no los rotula por clase: no tenemos a mano el estrato moda
por barrio (el portal de datos de la Alcaldía está caído desde el 21-oct-2026).

Salida, junto a este script: segregacion_precios.{png,pdf} y los agregados
indice_grupos.csv y nivel_grupos.csv (solo agregados, no avisos).

Uso (desde la raíz del repo). Necesita pandas, numpy, openpyxl y matplotlib; el 3.11 de
Homebrew no trae matplotlib, así que conviene un venv:
  /opt/homebrew/bin/python3.11 -m venv /tmp/venv-graficos
  /tmp/venv-graficos/bin/pip install pandas numpy openpyxl matplotlib
  /tmp/venv-graficos/bin/python 2026-II/graficos/segregacion_precios/preparar.py
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

RAIZ = Path(__file__).resolve().parents[3]
JOHAN = RAIZ / "2026-II/0.Insumos/johan_torres/df_cali_limpia valor alquiler.xlsx"
AQUI = Path(__file__).resolve().parent

BASE = 2022
ANIOS = [2020, 2021, 2022, 2023, 2024]
MIN_N = 10

# IPC, variación a diciembre (DANE). Llevado a dic-2022 = 100.
IPC_VAR = {2021: 5.62, 2022: 13.12, 2023: 9.28, 2024: 5.20}
IPC = {2022: 100.0}
IPC[2021] = 100 / (1 + IPC_VAR[2022] / 100)
IPC[2020] = IPC[2021] / (1 + IPC_VAR[2021] / 100)
IPC[2023] = 100 * (1 + IPC_VAR[2023] / 100)
IPC[2024] = IPC[2023] * (1 + IPC_VAR[2024] / 100)

# (clave, título, barrios en letra chica, clase: solo para el orden de lectura, no se grafica)
GRUPOS = [
    ("sur_alto", "Ciudad Jardín y Pance", "comuna 22: Ciudad Jardín, Pance,\nCiudad Campestre, Río Lili", "alta"),
    ("oeste", "Normandía y vecinos", "Normandía, Santa Rita, Santa Teresita,\nArboledas, Juanambú", "alta"),
    ("aguacatal", "Aguacatal y Terrón Colorado", "comuna 1: torres pegadas a Normandía", "alta"),
    ("norte_trad", "Santa Mónica y el norte", "resto de la comuna 2: Santa Mónica,\nCentenario, Granada, Versalles, La Flora…", "media"),
    ("c19", "San Fernando y Santa Isabel", "comuna 19: San Fernando, Santa Isabel,\nEl Lido, Cristales, Tequendama…", "media"),
    ("lili", "Valle del Lili", "barrio Lili, comuna 17", "media"),
    ("c17", "El Ingenio, Caney, Capri…", "resto de la comuna 17", "media"),
    ("medio_oriente", "Centro-oriente", "comunas 4, 5 y 8 a 12", "media"),
    ("aguablanca", "Distrito de Aguablanca", "comunas 13, 14, 15 y 21", "popular"),
]
# Años que se sacan aunque tengan 10 avisos: en 2020 los apartamentos de «Parcelaciones Pance»
# son otro producto (75 m² en el borde oriental, hacia Valle del Lili, contra 140 m² en 2022),
# y ni el área ni las coordenadas lo corrigen. El salto 2020→2022 (+43 %) sería de composición.
EXCLUIR = {("sur_alto", 2020)}

OESTE = ["Normandia", "Alto Normandia", "Santa Rita", "Santa Teresita", "Arboledas", "Juanambú"]

# Paleta categórica de referencia, tres primeras posiciones (validadas en todos los pares).
# Un solo color: cada panel es una serie, y el gráfico no rotula clases (decisión de Daniel, 11-nov).
SERIE = "#2a78d6"
TINTA, TINTA2, TINTA3 = "#0b0b0b", "#52514e", "#8a8984"
REJILLA, FONDO, IPC_COLOR = "#e6e5e0", "#fcfcfb", "#8a8984"


def grupo(r):
    if r.barrio in OESTE:
        return "oeste"
    if r.barrio in ("Aguacatal", "Terron Colorado"):
        return "aguacatal"
    if r.comuna == 22:
        return "sur_alto"
    if r.comuna == 2:
        return "norte_trad"
    if r.barrio == "Lili":
        return "lili"
    if r.comuna == 17:
        return "c17"
    if r.comuna == 19:
        return "c19"
    if r.comuna in (13, 14, 15, 21):
        return "aguablanca"
    if r.comuna in (4, 5, 8, 9, 10, 11, 12):
        return "medio_oriente"
    return None  # comunas 3, 6, 7, 16, 18 y 20: no entran en ningún grupo


def indice(d):
    """Índice dentro de barrio × tipo, base 2022 = 100."""
    celda = d.barrio + "|" + d.subcategoria
    y = np.log(d.precio_m2)
    otros = [a for a in sorted(d.anio.unique()) if a != BASE]
    X = pd.get_dummies(d.anio).reindex(columns=otros, fill_value=0).astype(float)
    Xd = X - X.groupby(celda.values).transform("mean")
    yd = y - y.groupby(celda.values).transform("mean")
    b, *_ = np.linalg.lstsq(Xd.values, yd.values, rcond=None)
    out = {BASE: 100.0}
    out.update({a: 100 * float(np.exp(v)) for a, v in zip(otros, b)})
    return out


def pesos(x):
    # «\$» para que matplotlib no lo lea como fórmula.
    return f"\\${x / 1e6:.1f} M".replace(".", ",")


j = pd.read_excel(JOHAN)
j = j.drop_duplicates(subset=["subcategoria", "barrio", "area", "precio", "anio", "latitud", "longitud"])
j = j[(j.subcategoria != "Casa campestre") & j.anio.isin(ANIOS)].copy()
j["grupo"] = j.apply(grupo, axis=1)
j = j[j.grupo.notna()]

rng = np.random.default_rng(20261111)
filas, niveles = [], {}
for clave, *_ in GRUPOS:
    d = j[j.grupo == clave]
    n = d.groupby("anio").size()
    ok = [a for a in ANIOS if n.get(a, 0) >= MIN_N and (clave, a) not in EXCLUIR]
    d = d[d.anio.isin(ok)].reset_index(drop=True)
    est = indice(d)
    por_anio = [d.index[d.anio == a].to_numpy() for a in ok]
    reps = []
    for _ in range(500):
        idx = np.concatenate([rng.choice(ix, len(ix), replace=True) for ix in por_anio])
        reps.append(indice(d.loc[idx]))
    reps = pd.DataFrame(reps)
    for a in ok:
        filas.append({"grupo": clave, "anio": a, "n": int(n[a]), "indice": round(est[a], 1),
                      "p05": round(float(reps[a].quantile(0.05)), 1), "p95": round(float(reps[a].quantile(0.95)), 1),
                      "ipc": round(IPC[a], 1)})
    # Nivel: mediana del m² de apartamento en 2022–2023, los años que todos comparten.
    ap = d[(d.subcategoria == "Apartamento") & d.anio.isin([2022, 2023])].precio_m2
    ca = d[(d.subcategoria == "Casa") & d.anio.isin([2022, 2023])].precio_m2
    niveles[clave] = {"apto": float(ap.median()), "n_apto": len(ap), "casa": float(ca.median()), "n_casa": len(ca)}

res = pd.DataFrame(filas)
res.to_csv(AQUI / "indice_grupos.csv", index=False)
niv = pd.DataFrame(niveles).T
niv.to_csv(AQUI / "nivel_grupos.csv")

# ─────────────────────────────────────────────────────────────────────────────
# Gráfico: un panel por grupo, del más caro al más barato.
# ─────────────────────────────────────────────────────────────────────────────
plt.rcParams.update({"font.family": "Helvetica Neue", "font.size": 10, "axes.edgecolor": REJILLA,
                     "axes.labelcolor": TINTA2, "xtick.color": TINTA2, "ytick.color": TINTA2})
fig, ejes = plt.subplots(3, 3, figsize=(11, 13.6), sharex=True, sharey=True, facecolor=FONDO)
fig.subplots_adjust(left=0.07, right=0.97, top=0.845, bottom=0.135, hspace=0.78, wspace=0.12)

for ax, (clave, titulo, sub, clase) in zip(ejes.flat, GRUPOS):
    r = res[res.grupo == clave].sort_values("anio")
    c = SERIE
    ax.set_facecolor(FONDO)
    ax.grid(axis="y", color=REJILLA, linewidth=0.8)
    ax.set_axisbelow(True)
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    ax.tick_params(length=0)
    ax.plot(sorted(IPC), [IPC[a] for a in sorted(IPC)], color=IPC_COLOR, linewidth=1.3, linestyle=(0, (3, 2.5)), zorder=2)
    ax.fill_between(r.anio, r.p05, r.p95, color=c, alpha=0.14, linewidth=0, zorder=1)
    # Si falta un año, la línea se corta en punteado.
    for (a0, v0), (a1, v1) in zip(r[["anio", "indice"]].values[:-1], r[["anio", "indice"]].values[1:]):
        ax.plot([a0, a1], [v0, v1], color=c, linewidth=2, linestyle="-" if a1 - a0 == 1 else (0, (1, 2)), zorder=3)
    ax.scatter(r.anio, r.indice, s=34, color=c, edgecolor=FONDO, linewidth=1.5, zorder=4)
    ult = r.iloc[-1]
    real = 100 * (ult.indice / ult.ipc - 1)
    ax.annotate(f"{ult.indice:.0f}".replace(".", ","), (ult.anio, ult.indice), xytext=(7, 0),
                textcoords="offset points", va="center", fontsize=10, color=TINTA, fontweight="bold")
    nv = niveles[clave]
    partes = [f"apto {pesos(nv['apto'])}"] if nv["n_apto"] >= 15 else []
    partes += [f"casa {pesos(nv['casa'])}"] if nv["n_casa"] >= 15 else []
    nivel = " · ".join(partes)
    ax.set_title(titulo, loc="left", fontsize=12, fontweight="bold", color=TINTA, pad=34)
    ax.text(0, 1.035, sub, transform=ax.transAxes, fontsize=8.3, color=TINTA2, va="bottom", linespacing=1.15)
    ax.text(0, -0.17, f"Mediana del m² 2022–23: {nivel}", transform=ax.transAxes, fontsize=8.5, color=TINTA2, va="top")
    ax.text(0, -0.25, f"{int(ult.anio)} contra 2022, descontada la inflación: {real:+.0f} %".replace("-", "−"),
            transform=ax.transAxes, fontsize=8.5, color=TINTA, va="top")
    ax.set_ylim(60, 140)
    ax.set_xlim(2019.7, 2024.6)
    ax.set_xticks(ANIOS)
    ax.set_xticklabels(["20", "21", "22", "23", "24"])
    ax.set_yticks([60, 80, 100, 120, 140])

# Rótulo de la inflación, una sola vez, donde la línea queda despejada.
ejes.flat[1].text(2022.75, IPC[2023] + 4, "inflación", fontsize=8.5, color=TINTA2, ha="center", va="bottom")
# Por qué Ciudad Jardín y Pance no tienen 2020 ni 2024.
ejes.flat[0].text(2019.85, 64, "2020: otros apartamentos (75 m², al borde\nde Valle del Lili), no comparables.\n2021 y 2024: menos de 10 avisos.",
                  fontsize=7.8, color=TINTA2, va="bottom", linespacing=1.25)

fig.text(0.07, 0.965, "Precio del m² en avisos de venta, Cali 2020–2024", fontsize=17, fontweight="bold", color=TINTA)
fig.text(0.07, 0.94, "Índice ajustado por barrio y tipo de vivienda, 2022 = 100. Pesos corrientes; la línea punteada gris es la inflación.",
         fontsize=10, color=TINTA2)
fig.text(0.07, 0.92, "Paneles ordenados del más caro al más barato, por el m² de apartamento en 2022–23. Si falta un año, la línea va punteada.",
         fontsize=10, color=TINTA2)
fig.text(0.07, 0.022,
         # Sin el nombre de quien aportó la base: la gráfica puede ir a clase (como en el Taller 5, 6ac5f9e).
         "Fuente: " + f"{len(j):,}".replace(",", ".") +
         " avisos de venta de casas y apartamentos de 2020–2024 en estos nueve grupos (sin campestres). "
         "2025 no está y 2026 es otra muestra.\n"
         "Cada año viene de zonas distintas: por eso el índice compara cada barrio y tipo consigo mismo. "
         "La banda es el ruido de la muestra (bootstrap, 5–95 %).\n"
         "Un año entra si el grupo tiene al menos 10 avisos. Los grupos son nuestros, por zona y precio. "
         "Inflación: IPC a diciembre, DANE.",
         fontsize=8, color=TINTA3, va="bottom", linespacing=1.4)

for ext in ("png", "pdf"):
    fig.savefig(AQUI / f"segregacion_precios.{ext}", dpi=200, facecolor=FONDO)

pd.set_option("display.width", 200)
print(res.pivot(index="grupo", columns="anio", values=["indice", "n"]).to_string())
print(niv.round(0).to_string())
