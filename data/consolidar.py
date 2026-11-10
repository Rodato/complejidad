#!/usr/bin/env python3
"""
Consolida la base de la Notaría 2 de Cali en un solo archivo.

Fuentes (todas se unen en un esquema superset):
  - "Base de datos notaria 2.csv"  -> 1938-1943, transcripción vieja/parcial.
    Esquema pobre, valores en formato europeo ("3.360,00"), fecha = solo año.
    **1943 se EXCLUYE de esta fuente** porque fue re-transcrito completo en
    "1943.xlsx" (ver abajo). De aquí solo entran 1938, 1939, 1940 y 1941.
  - "1942.xlsx"                    -> 1942 (año que faltaba). Esquema rico.
  - "1943.xlsx"                    -> 1943 completo (~440 registros), esquema
    rico. REEMPLAZA los 66 registros viejos de 1943 (decisión del usuario,
    2026-07: el nuevo es la "tabla completa de transacciones").
  - "Base de datos 1944.xlsx"      -> 1944. Esquema rico. Precios en formato
    mixto US/europeo, fechas en texto libre ("11 de Enero de 1944").
  - "ach_escrituras.csv"           -> 1940-1944, extracción automática de los
    tomos escaneados del Archivo Histórico de Cali (investigacion/ACH, Opus con
    visión). Solo escrituras completas. Es una copia congelada que este script
    refresca si encuentra la salida del ACH en investigacion/ (carpeta local,
    fuera del repo); si no, usa la copia.

Los tres archivos ricos (1942, 1943, 1944) comparten el mismo esquema de
columnas, pero 1942/1943 arrancan en la columna A y traen "N° Escritura",
mientras 1944 arranca en la columna C y no trae escritura.

Esquema de salida (superset):
  fuente, anio, fecha, vendedor, comprador, valor_texto, valor_num,
  area, negocio, escritura, tipo_inmueble, ubicacion, confianza, ach_ref

Fusión con el ACH (decisión del usuario, 2026-11-10): las filas transcritas a
mano quedan INTACTAS y en el mismo orden; del ACH solo se agregan, al final, las
escrituras que la base no tiene. Una escritura del ACH ya está si coincide con
una fila a mano del mismo año por (a) el mismo número de escritura más una
parte o el precio en común; (b) número distinto pero vendedor, comprador y
precio iguales (alguno de los dos leyó mal el número); o (c) si alguna no trae
número, vendedor y comprador en común y precio compatible. Nunca con las partes
invertidas: una venta con pacto de retroventa y su retroventa son dos
escrituras con las mismas partes al revés. `ach_ref` dice de
dónde sale cada fila del ACH (tomo y páginas) y, en las filas a mano, con qué
escritura del ACH cruzan. `tipo_inmueble`, `ubicacion` y `confianza` solo
vienen en las filas del ACH; `ubicacion` no es confiable para georreferenciar
sin revisar la imagen, y conviene revisar las filas con confianza < 0.85.

Decisiones de diseño (acordadas con el usuario, 2026-06/07):
  - Superset: se conservan todas las columnas; los campos ausentes en una
    fuente (fecha completa y área en 1938-41; escritura en 1938-41 y 1944)
    quedan vacíos.
  - valor_num: columna numérica limpia; valor_texto conserva el original.
  - Partes (vendedor/comprador) se conservan tal cual; la limpieza de
    nombres y separación de apoderados se hará al armar el taller.
  - anio = año de la fuente (año de protocolización en la notaría), aunque
    algún acto proceda de una fecha anterior (p. ej. testamentos de 1940
    protocolizados en 1943).

Uso:
  python3 consolidar.py
"""
import csv
import re
import datetime
import unicodedata
from collections import Counter
from pathlib import Path

import openpyxl

AQUI = Path(__file__).parent
VIEJO = AQUI / "Base de datos notaria 2.csv"
F1942 = AQUI / "1942.xlsx"
F1943 = AQUI / "1943.xlsx"
NUEVO = AQUI / "Base de datos 1944.xlsx"
ACH = AQUI / "ach_escrituras.csv"
ACH_ORIGEN = AQUI.parent / "investigacion" / "ACH" / "outputs" / "transacciones" / "transacciones_ach.csv"
SALIDA = AQUI / "consolidado_notaria2.csv"

# 1943 viejo se descarta: fue reemplazado por 1943.xlsx.
EXCLUIR_DEL_VIEJO = {"1943"}

CAMPOS = ["fuente", "anio", "fecha", "vendedor", "comprador",
          "valor_texto", "valor_num", "area", "negocio", "escritura",
          "tipo_inmueble", "ubicacion", "confianza", "ach_ref"]

CAMPOS_ACH = ["tomo", "pagina_inicio", "pagina_fin", "anio", "fecha", "escritura",
              "negocio", "vendedor", "comprador", "valor_texto", "valor_num",
              "area_texto", "area_num_m2", "tipo_inmueble", "ubicacion",
              "confianza", "observaciones"]


def limpiar_texto(s):
    """Quita espacios sobrantes y colapsa saltos de línea internos."""
    if s is None:
        return ""
    s = str(s).strip()
    s = re.sub(r"\s+", " ", s)
    return s


def limpiar_escritura(v):
    """El N° de escritura llega de Excel como float (10.0). Se muestra como
    entero ('10') cuando es integral; los que son texto ('Test. Scarpetta')
    se limpian normal."""
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return limpiar_texto(v)


def parse_valor(s):
    """Convierte un precio en texto a float, detectando formato US vs europeo.

    Regla: si hay '.' y ',' el ÚLTIMO separador es el decimal.
    Si solo hay ',' decide por la cantidad de dígitos que le siguen
    (2 = decimal, 3 = miles). Si solo hay '.', misma regla (2 = decimal
    como "150.00"; 3 = miles como "9.000"). Rangos y guiones devuelven None.
    """
    if s is None:
        return None
    s = str(s).strip()
    if s in ("", "-", "No especificada"):
        return None
    s = s.replace("$", "").strip()
    # rangos tipo "380,00 - 2,780.80": ambiguo, no se normaliza
    if " - " in s or " – " in s:
        return None
    m = re.search(r"[\d.,]+", s)
    if not m:
        return None
    num = m.group().strip(".,")
    tiene_punto = "." in num
    tiene_coma = "," in num
    if tiene_punto and tiene_coma:
        if num.rfind(".") > num.rfind(","):   # US: 1,795.33
            num = num.replace(",", "")
        else:                                  # europeo: 1.500,00
            num = num.replace(".", "").replace(",", ".")
    elif tiene_coma:
        despues = num.split(",")[-1]
        if len(despues) == 2:                  # 175,75 -> decimal
            num = num.replace(",", ".")
        else:                                  # 40,000 -> miles
            num = num.replace(",", "")
    elif tiene_punto:
        despues = num.split(".")[-1]
        if len(despues) == 3:                  # 9.000 / 1.234.000 -> miles
            num = num.replace(".", "")
        # len == 2 ("150.00") u otros: float() lo maneja como decimal
    # sin separador: float() lo maneja directo
    try:
        return float(num)
    except ValueError:
        return None


def fecha_texto(valor):
    """Normaliza una fecha a texto legible.

    datetime -> 'YYYY-MM-DD'. String -> texto limpio ('-' se vuelve vacío).
    No fuerza el año: los acts con fecha anterior vienen como texto libre
    (p. ej. '28/10/1940 (prot. 1943)') y se conservan tal cual.
    """
    if valor is None:
        return ""
    if isinstance(valor, datetime.datetime):
        return valor.strftime("%Y-%m-%d")
    s = limpiar_texto(valor)
    return "" if s == "-" else s


def leer_viejo():
    """Lee la transcripción vieja (CSV), excluyendo los años ya reemplazados."""
    filas = []
    with open(VIEJO, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            anio = limpiar_texto(row.get("fecha"))
            if anio in EXCLUIR_DEL_VIEJO:
                continue
            filas.append({
                "fuente": "notaria2_1938-1941",
                "anio": anio,
                "fecha": "",
                "vendedor": limpiar_texto(row.get("vendedor")),
                "comprador": limpiar_texto(row.get("comprador")),
                "valor_texto": limpiar_texto(row.get("Valor")),
                "valor_num": parse_valor(row.get("Valor")),
                "area": "",
                "negocio": limpiar_texto(row.get("Negocio")),
                "escritura": "",
            })
    return filas


def leer_rico(path, anio, hoja="Hoja 1"):
    """Lee un Excel con el esquema rico A-G (1942, 1943).

    Columnas: A=N° Escritura, B=Fecha, C=Vendedor, D=Comprador,
    E=Precio, F=Área, G=Descripción. Fila 0 = título, fila 1 = encabezado.
    Se conserva toda fila que tenga vendedor o comprador.
    """
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb[hoja]
    filas = []
    for i, row in enumerate(ws.iter_rows(min_col=1, max_col=7, values_only=True)):
        if i < 2:                              # título + encabezado
            continue
        escritura, fecha, vendedor, comprador, precio, area, desc = row
        vend = limpiar_texto(vendedor)
        comp = limpiar_texto(comprador)
        if not vend and not comp:              # fila vacía o de relleno
            continue
        filas.append({
            "fuente": f"notaria2_{anio}",
            "anio": str(anio),
            "fecha": fecha_texto(fecha),
            "vendedor": vend,
            "comprador": comp,
            "valor_texto": limpiar_texto(precio),
            "valor_num": parse_valor(precio),
            "area": limpiar_texto(area),
            "negocio": limpiar_texto(desc),
            "escritura": limpiar_escritura(escritura),
        })
    return filas


def leer_1944():
    """Lee el Excel de 1944 (esquema rico pero arranca en la columna C,
    sin columna de escritura y con fechas en texto libre)."""
    wb = openpyxl.load_workbook(NUEVO, data_only=True)
    ws = wb["Hoja1"]
    filas = []
    encabezado_visto = False
    for row in ws.iter_rows(min_col=3, max_col=8, values_only=True):
        if all(c is None for c in row):
            continue
        fecha, vendedor, comprador, precio, area, desc = row
        if not encabezado_visto:               # primera fila no vacía = encabezado
            encabezado_visto = True
            continue
        filas.append({
            "fuente": "notaria2_1944",
            "anio": "1944",
            "fecha": fecha_texto(fecha),
            "vendedor": limpiar_texto(vendedor),
            "comprador": limpiar_texto(comprador),
            "valor_texto": limpiar_texto(precio),
            "valor_num": parse_valor(precio),
            "area": limpiar_texto(area),
            "negocio": limpiar_texto(desc),
            "escritura": "",
        })
    return filas


# ---------------------------------------------------------------- ACH

def actualizar_copia_ach():
    """Refresca ach_escrituras.csv desde la salida del ACH, si está en esta
    máquina (investigacion/ es local). Solo escrituras completas. El año es el
    de la carpeta del tomo (año de protocolización, como en las demás
    fuentes); si el tomo no está en carpeta de año, el que leyó el modelo."""
    if not ACH_ORIGEN.exists():
        return False
    filas = []
    with open(ACH_ORIGEN, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["completa"].strip().lower() != "true":
                continue
            tomo = r["fuente"]
            carpeta = re.match(r"(\d{4})__", tomo)
            anio = carpeta.group(1) if carpeta else r["anio"]
            filas.append({**{c: r.get(c, "") for c in CAMPOS_ACH}, "tomo": tomo, "anio": anio})
    filas.sort(key=lambda r: (r["anio"], r["tomo"], int(r["pagina_inicio"] or 0)))
    with open(ACH, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CAMPOS_ACH)
        w.writeheader()
        w.writerows(filas)
    return True


def leer_ach():
    """Lee la copia del ACH en el esquema del consolidado."""
    if not ACH.exists():
        return []
    filas = []
    with open(ACH, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            esc = limpiar_texto(r["escritura"])
            if re.fullmatch(r"\d+\.0", esc):
                esc = esc[:-2]
            filas.append({
                "fuente": "ach_notaria2",
                "anio": r["anio"],
                "fecha": limpiar_texto(r["fecha"]),
                "vendedor": limpiar_texto(r["vendedor"]),
                "comprador": limpiar_texto(r["comprador"]),
                "valor_texto": limpiar_texto(r["valor_texto"]),
                "valor_num": float(r["valor_num"]) if r["valor_num"] else None,
                "area": limpiar_texto(r["area_texto"]),
                "negocio": limpiar_texto(r["negocio"]),
                "escritura": esc,
                "tipo_inmueble": limpiar_texto(r["tipo_inmueble"]),
                "ubicacion": limpiar_texto(r["ubicacion"]),
                "confianza": r["confianza"],
                "ach_ref": f"{r['tomo']} págs. {r['pagina_inicio']}-{r['pagina_fin']}",
            })
    return filas


# Palabras que no identifican a nadie (tratamientos, roles, conectores).
_NO_NOMBRE = {"del", "los", "las", "por", "sus", "con", "sucesion", "senora", "senor",
              "don", "dona", "viuda", "vda", "hijos", "cali", "sociedad", "compania",
              "retroventa", "pacto", "representado", "representada", "apoderado"}


def _tokens(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return {t for t in re.sub(r"[^a-z ]", " ", s).split() if len(t) > 2 and t not in _NO_NOMBRE}


def _solape(a, b):
    """Fracción de nombres en común, sobre la parte con menos nombres."""
    p, q = _tokens(a), _tokens(b)
    return len(p & q) / max(1, min(len(p), len(q)))


def _numero(esc):
    """N° de escritura si es un número limpio ('1.234' -> '1234'); si no, None."""
    s = (esc or "").replace(".", "").strip()
    return s if re.fullmatch(r"\d+", s) else None


def coincide(h, x):
    """¿La fila a mano `h` y la del ACH `x` son la misma escritura?"""
    if h["anio"] != x["anio"]:
        return False
    hv, xv = h["valor_num"], x["valor_num"]
    mismo_precio = hv is not None and xv is not None and abs(hv - xv) < 1
    precio_compatible = hv is None or xv is None or mismo_precio
    vv = _solape(h["vendedor"], x["vendedor"])
    cc = _solape(h["comprador"], x["comprador"])
    hn, xn = _numero(h["escritura"]), _numero(x["escritura"])
    if hn and xn:
        if hn == xn:
            return vv >= .5 or cc >= .5 or mismo_precio
        # número distinto: solo si es claramente la misma (uno leyó mal el número)
        return vv >= .75 and cc >= .75 and mismo_precio
    # Sin número en alguna de las dos. No se aceptan partes invertidas: una
    # venta con pacto de retroventa y su retroventa tienen las mismas partes
    # al revés y el mismo precio, y son dos escrituras.
    return vv >= .5 and cc >= .5 and precio_compatible


def fusionar(humanas, ach):
    """Devuelve las filas del ACH que la base no tiene. A cada fila a mano que
    cruza con el ACH le pone en `ach_ref` la primera escritura del ACH con que
    coincide; no le cambia nada más."""
    por_anio = {}
    for h in humanas:
        por_anio.setdefault(h["anio"], []).append(h)
    nuevas, ya = [], Counter()
    for x in ach:
        pares = [h for h in por_anio.get(x["anio"], []) if coincide(h, x)]
        if not pares:
            nuevas.append(x)
            continue
        ya[x["anio"]] += 1
        for h in pares:
            h["ach_ref"] = h["ach_ref"] or x["ach_ref"]
    return nuevas, ya


def main():
    copia = actualizar_copia_ach()
    fuentes = [
        ("1938-1941 (viejo)", leer_viejo()),
        ("1942",             leer_rico(F1942, 1942)),
        ("1943",             leer_rico(F1943, 1943)),
        ("1944",             leer_1944()),
    ]
    humanas = [fila for _, filas in fuentes for fila in filas]
    for fila in humanas:
        for campo in ("tipo_inmueble", "ubicacion", "confianza", "ach_ref"):
            fila.setdefault(campo, "")
    ach = leer_ach()
    nuevas, ya = fusionar(humanas, ach)
    todo = humanas + nuevas

    with open(SALIDA, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CAMPOS)
        w.writeheader()
        for fila in todo:
            if fila["valor_num"] is not None:
                fila = {**fila, "valor_num": f"{fila['valor_num']:.2f}"}
            else:
                fila = {**fila, "valor_num": ""}
            w.writerow(fila)

    # --- resumen ---
    for etiqueta, filas in fuentes:
        print(f"Registros {etiqueta:20}: {len(filas)}")
    origen = "refrescada desde investigacion/ACH" if copia else "copia guardada"
    print(f"Escrituras del ACH:           {len(ach)} ({origen})")
    print(f"  ya estaban en la base:      {sum(ya.values())} {dict(sorted(ya.items()))}")
    print(f"  agregadas:                  {len(nuevas)} "
          f"{dict(sorted(Counter(r['anio'] for r in nuevas).items()))}")
    print(f"Filas a mano que cruzan:      {sum(1 for h in humanas if h['ach_ref'])}")
    print(f"Total consolidado:            {len(todo)}")
    sin_valor = sum(1 for r in todo if r["valor_num"] is None)
    print(f"Sin valor numérico:           {sin_valor} (rangos, guiones o vacíos)")
    print(f"Salida: {SALIDA.name}")


if __name__ == "__main__":
    main()
