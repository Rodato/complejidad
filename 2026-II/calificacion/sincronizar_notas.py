"""Hoja de calificación de 2026-II en el spreadsheet del curso.

Lee las pestañas de respuestas que llenan las apps de los talleres (taller_sismo,
taller_redes, taller3_relatos, taller4_azucar, taller5_renta) y arma, en el MISMO
spreadsheet:

  - «Calificar T1 · Sismo», «Calificar T2 · Redes», …: una fila por entrega con las
    respuestas y, a la izquierda (congeladas), las columnas Nota, Concepto y
    Comentario para ir calificando.
  - «Notas 2026-II»: una fila por estudiante con la nota de cada taller (fórmulas que
    leen las pestañas de calificar; la pareja hereda la nota de la entrega conjunta)
    y el promedio.

Se puede correr cuantas veces se quiera: las notas y comentarios ya puestos se
conservan (se emparejan por código), las entregas nuevas se agregan al final y un
taller sin respuestas todavía (p. ej. el T5 antes del 4-nov) se omite hasta que las
tenga. Si un estudiante reenvía después de calificado, la columna «Enviado» lo avisa.

Reglas:
  - Una entrega por código: la última (los dobles envíos son dobles clics).
  - Los códigos se normalizan: 202412345 → 2412345 (mismo estudiante).
  - Filas con «PRUEBA» en el código se ignoran.
  - No insertar columnas en las pestañas de calificar: el script reescribe las
    respuestas. Nota y Comentario se ubican por el encabezado, así que sobreviven.

Nada de esto toca disco: no deja CSV ni Excel con datos de estudiantes (el repo es
público). Correr:

  /opt/homebrew/bin/python3.11 -m venv .venv && .venv/bin/pip install gspread google-auth
  .venv/bin/python sincronizar_notas.py

Variables opcionales: SA_KEY (JSON del service account), SHEET_ID.
"""

from __future__ import annotations

import glob
import math
import os
import re
import unicodedata
from collections import Counter
from datetime import datetime, timedelta, timezone

import gspread
from google.oauth2.service_account import Credentials

AQUI = os.path.dirname(os.path.abspath(__file__))
SEMESTRE = os.path.dirname(AQUI)
SA_KEY = os.environ.get(
    "SA_KEY",
    os.path.join(SEMESTRE, "..", "2026-I", "3.Taller_Inmobiliario",
                 "complejidad-496215-c245601f03a8.json"),
)
SHEET_ID = os.environ.get("SHEET_ID", "1pquFP4e-SMK1gTYJQNSz8AtV2Ce7V0MDwlPSSQhKW3c")

TALLERES = [
    dict(clave="T1", nombre="Sismo", hoja="taller_sismo",
         app="1.Taller_Terremoto/taller-sismo", grupo="Acto"),
    dict(clave="T2", nombre="Redes", hoja="taller_redes",
         app="2.Taller_Redes/taller-redes", grupo="Acto"),
    dict(clave="T3", nombre="Relatos", hoja="taller3_relatos",
         app="3.Taller_Relatos/taller-relatos", grupo="Acto"),
    dict(clave="T4", nombre="Azúcar", hoja="taller4_azucar",
         app="4.Taller_Azucar/taller-azucar", grupo="Parte"),
    dict(clave="T5", nombre="Renta", hoja="taller5_renta",
         app="5.Taller_Renta/taller-renta", grupo="Parte"),
]
RESUMEN = "Notas 2026-II"

# Columnas fijas de las pestañas de calificar (A–H). Las fórmulas del resumen
# dependen de estas letras: Nota en B, Código en E, Cód. pareja en F.
FIJAS = ["Estudiante", "Nota", "Concepto", "Comentario", "Código", "Cód. pareja",
         "Pareja (como la escribieron)", "Enviado"]
ANCHOS_FIJAS = [190, 60, 95, 300, 80, 90, 170, 125]
META = {"timestamp", "nombre", "codigo", "pareja"}

# Escala de concepto del curso y sus colores (los mismos de los Excel de 2026-I).
CONCEPTOS = [
    ("Excelente", "C6EFCE"), ("Muy bueno", "DDEBF7"), ("Aceptable", "FFEB9C"),
    ("Insuficiente", "FCE4D6"), ("Deficiente", "FFC7CE"),
]
AZUL = "1F4E78"
COL = timezone(timedelta(hours=-5))


# --- Utilidades ----------------------------------------------------------------

def norm_codigo(c: str) -> str:
    """Deja solo dígitos y quita el prefijo de año largo: 202412345 → 2412345."""
    if isinstance(c, float) and c.is_integer():
        c = int(c)
    d = re.sub(r"\D", "", str(c))
    if len(d) == 9 and d.startswith("20"):
        d = d[2:]
    return d


def codigos_en(texto: str) -> list[str]:
    return [norm_codigo(m) for m in re.findall(r"\d{7,9}", texto or "")]


def _sin_tildes(t: str) -> list[str]:
    t = unicodedata.normalize("NFKD", t.lower())
    return re.findall(r"[a-zñ]+", "".join(ch for ch in t if not unicodedata.combining(ch)))


def codigos_pareja(texto: str, propio: str, directorio: dict[str, set[str]]) -> list[str]:
    """Códigos de la(s) pareja(s). Si la escribieron sin código, se busca por nombre:
    un estudiante cuyo nombre contenga todas las palabras escritas (mínimo dos)."""
    cods = [c for c in codigos_en(texto) if c != propio]
    if cods or codigos_en(texto):
        return cods
    palabras = set(_sin_tildes(texto))
    if len(palabras) < 2:
        return []
    hallados = [cod for cod, noms in directorio.items() if cod != propio
                and any(palabras <= set(_sin_tildes(n)) for n in noms)]
    return hallados if len(hallados) == 1 else []


def hora_col(ts: str) -> str:
    try:
        t = datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(COL)
        return t.strftime("%Y-%m-%d %H:%M")
    except ValueError:
        return ts


def mejor_nombre(variantes: list[str]) -> str:
    """Prefiere la variante con mayúsculas y minúsculas mezcladas y más larga."""
    vs = [v.strip() for v in variantes if v and v.strip()]
    if not vs:
        return ""
    mixtas = [v for v in vs if not v.isupper() and not v.islower()]
    def puntaje(v):  # primero: palabras con mayúscula inicial («de», «los» no cuentan)
        ps = [w for w in v.split() if len(w) > 3]
        return (sum(w[0].isupper() for w in ps) / max(len(ps), 1), len(v))
    elegido = max(mixtas or vs, key=puntaje)
    return elegido.title() if elegido.isupper() or elegido.islower() else elegido


def rgb(hexa: str) -> dict:
    return {k: int(hexa[i:i + 2], 16) / 255 for k, i in (("red", 0), ("green", 2), ("blue", 4))}


def col_letra(n: int) -> str:
    """1 → A, 27 → AA."""
    s = ""
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


# --- Encabezados legibles a partir del código de cada app -------------------------

def _limpiar_plantilla(t: str) -> str:
    t = re.sub(r"\$\{nombre\((\w+)\)\}", r"[\1]", t)
    t = re.sub(r"\$\{(\w+)\}", r"[\1]", t)
    t = re.sub(r"\$\{[^}]*\}", "…", t)
    return re.sub(r"\s+", " ", t).strip()


def _jsx_a_texto(t: str) -> str:
    t = t.replace('{" "}', " ")
    t = re.sub(r"\{`([^`]*)`\}", r"\1", t)
    for _ in range(3):
        t = re.sub(r"\{[^{}]*\}", "…", t)
    t = re.sub(r"<[^>]+>", "", t)
    return _limpiar_plantilla(t)


def detalle_preguntas(app: str, campos: list[str]) -> dict[str, dict]:
    """campo → {num, tit, lab, ayuda} leído de los .tsx de la app.

    Busca el último <Ejercicio numero=… titulo=…> antes del campo y, dentro de ese
    ejercicio, el último label=… (y su ayuda=…, si la hay)."""
    fuentes = [open(f, encoding="utf-8").read()
               for f in glob.glob(os.path.join(SEMESTRE, app, "src", "**", "*.tsx"), recursive=True)]
    patron_ej = re.compile(
        r'numero="([^"]+)"\s+titulo=(?:"([^"]+)"|\{`([^`]+)`\}|\{"([^"]+)"\})')
    patron_label = re.compile(r'label=(?:"([^"]+)"|\{`([^`]+)`\}|\{"([^"]+)"\})')
    patron_ayuda = re.compile(r'ayuda=(?:"([^"]+)"|\{`([^`]+)`\}|\{"([^"]+)"\})')
    genericos = {"su respuesta", "tu respuesta"}
    out = {}
    for c in campos:
        num = tit = lab = ayuda = enunciado = None
        for t in fuentes:
            i = t.find(f'set("{c}"')
            if i < 0:
                i = t.find(f"r.{c}}}")
            if i < 0:
                continue
            ejs = list(patron_ej.finditer(t[:i]))
            inicio = 0
            if ejs:
                e = ejs[-1]
                num, tit = e.group(1), next(g for g in e.groups()[1:] if g)
                inicio = e.end()
            ls = list(patron_label.finditer(t[inicio:i]))
            if ls:
                lab = next(g for g in ls[-1].groups() if g)
                ay = list(patron_ayuda.finditer(t[inicio + ls[-1].end():i]))
                if ay:
                    ayuda = next(g for g in ay[-1].groups() if g)
            # Enunciado: el último <p> del ejercicio antes del campo, sin meterse en
            # un <Revelable> ni en el campo anterior (ahí está la respuesta esperada).
            j = t.find(f"r.{c}", inicio)
            j = j if 0 <= j <= i else i
            desde = inicio
            for marca in ("</Revelable>", "onChange="):
                k = t.rfind(marca, inicio, j)
                if k > desde:
                    desde = k
            ps = re.findall(r"<p[^>]*>(.*?)</p>", t[desde:j], re.S)
            if ps:
                enunciado = _jsx_a_texto(ps[-1]) or None
            break
        tit = _limpiar_plantilla(tit) if tit else None
        lab = _limpiar_plantilla(lab) if lab else None
        ayuda = _limpiar_plantilla(ayuda) if ayuda else None
        if lab and lab.lower() in genericos:
            lab = None
        out[c] = dict(num=num, tit=tit, lab=lab, ayuda=ayuda, enunciado=enunciado)
    return out


def preguntas(app: str, campos: list[str]) -> dict[str, tuple[str, str]]:
    """campo → (encabezado corto, texto completo de la pregunta). Si algo falla en la
    lectura de los .tsx, cae al nombre de la columna."""
    out = {}
    for c, d in detalle_preguntas(app, campos).items():
        partes = [p for p in (d["num"], d["tit"]) if p]
        corto = " ".join(partes) if partes else c
        lab = d["lab"]
        if lab:
            corto += " — " + (lab if len(lab) <= 90 else lab[:88] + "…")
        nota = f"{c}\n\n{lab or d['tit'] or ''}".strip()
        out[c] = (corto, nota)
    return out


# --- Lectura de entregas -------------------------------------------------------

def entregas(ws) -> tuple[list[str], list[dict], Counter]:
    """Última entrega por código normalizado, en orden de llegada."""
    valores = ws.get_all_values()
    if len(valores) < 2:
        return [], [], Counter()
    enc = valores[0]
    filas = [dict(zip(enc, f + [""] * (len(enc) - len(f)))) for f in valores[1:]]
    filas = [f for f in filas if "PRUEBA" not in f.get("codigo", "").upper()
             and norm_codigo(f.get("codigo", ""))]
    envios = Counter(norm_codigo(f["codigo"]) for f in filas)
    ultima: dict[str, dict] = {}
    for f in sorted(filas, key=lambda f: f.get("timestamp", "")):
        ultima[norm_codigo(f["codigo"])] = f
    orden = sorted(ultima.values(), key=lambda f: f.get("timestamp", ""))
    return enc, orden, envios


# --- Pestaña de calificar ------------------------------------------------------

def leer_calificaciones(ws) -> tuple[list[str], dict[str, dict]]:
    """Orden actual de códigos y, por código, la nota, el comentario y el envío."""
    vals = ws.get_all_values(value_render_option="UNFORMATTED_VALUE")
    if len(vals) < 3:
        return [], {}
    enc = vals[1]
    def idx(nombre):
        return enc.index(nombre) if nombre in enc else None
    i_cod, i_nota, i_com, i_env = idx("Código"), idx("Nota"), idx("Comentario"), idx("Enviado")
    orden, datos = [], {}
    for f in vals[2:]:
        f = list(f) + [""] * (len(enc) - len(f))
        cod = norm_codigo(f[i_cod]) if i_cod is not None else ""
        if not cod:
            continue
        orden.append(cod)
        datos[cod] = dict(
            nota=f[i_nota] if i_nota is not None else "",
            comentario=f[i_com] if i_com is not None else "",
            enviado=str(f[i_env]) if i_env is not None else "",
            nombre=f[0],
        )
    return orden, datos


def formato_inicial(sh, ws, n_cols: int, anchos: list[int]):
    sid = ws.id
    reqs = [
        {"updateSheetProperties": {
            "properties": {"sheetId": sid, "gridProperties": {
                "frozenRowCount": 2, "frozenColumnCount": 4}},
            "fields": "gridProperties.frozenRowCount,gridProperties.frozenColumnCount"}},
        # Todo el cuerpo: texto ajustado y alineado arriba (las respuestas son largas).
        {"repeatCell": {
            "range": {"sheetId": sid, "startRowIndex": 2, "startColumnIndex": 0,
                      "endColumnIndex": n_cols},
            "cell": {"userEnteredFormat": {"wrapStrategy": "WRAP", "verticalAlignment": "TOP",
                                           "textFormat": {"fontSize": 10}}},
            "fields": "userEnteredFormat(wrapStrategy,verticalAlignment,textFormat.fontSize)"}},
        # Fila 1: grupos (Acto / Parte); fila 2: preguntas.
        {"repeatCell": {
            "range": {"sheetId": sid, "startRowIndex": 0, "endRowIndex": 2,
                      "startColumnIndex": 0, "endColumnIndex": n_cols},
            "cell": {"userEnteredFormat": {
                "backgroundColor": rgb(AZUL), "wrapStrategy": "WRAP",
                "verticalAlignment": "MIDDLE",
                "textFormat": {"bold": True, "foregroundColor": rgb("FFFFFF"), "fontSize": 10}}},
            "fields": "userEnteredFormat(backgroundColor,wrapStrategy,verticalAlignment,textFormat)"}},
        # Columnas de calificación resaltadas.
        {"repeatCell": {
            "range": {"sheetId": sid, "startRowIndex": 2, "startColumnIndex": 1,
                      "endColumnIndex": 4},
            "cell": {"userEnteredFormat": {"backgroundColor": rgb("FFF8E1")}},
            "fields": "userEnteredFormat.backgroundColor"}},
        {"repeatCell": {
            "range": {"sheetId": sid, "startRowIndex": 2, "startColumnIndex": 1,
                      "endColumnIndex": 3},
            "cell": {"userEnteredFormat": {"horizontalAlignment": "CENTER",
                                           "textFormat": {"bold": True, "fontSize": 11}}},
            "fields": "userEnteredFormat(horizontalAlignment,textFormat)"}},
        {"repeatCell": {
            "range": {"sheetId": sid, "startRowIndex": 2, "startColumnIndex": 0,
                      "endColumnIndex": 1},
            "cell": {"userEnteredFormat": {"textFormat": {"bold": True}}},
            "fields": "userEnteredFormat.textFormat.bold"}},
        {"updateDimensionProperties": {
            "range": {"sheetId": sid, "dimension": "ROWS", "startIndex": 1, "endIndex": 2},
            "properties": {"pixelSize": 70}, "fields": "pixelSize"}},
        # Nota: número de 0 a 5.
        {"setDataValidation": {
            "range": {"sheetId": sid, "startRowIndex": 2, "startColumnIndex": 1,
                      "endColumnIndex": 2},
            "rule": {"condition": {"type": "NUMBER_BETWEEN",
                                   "values": [{"userEnteredValue": "0"},
                                              {"userEnteredValue": "5"}]},
                     "inputMessage": "Nota de 0 a 5", "strict": True, "showCustomUi": True}}},
    ]
    for j, ancho in enumerate(anchos):
        reqs.append({"updateDimensionProperties": {
            "range": {"sheetId": sid, "dimension": "COLUMNS", "startIndex": j, "endIndex": j + 1},
            "properties": {"pixelSize": ancho}, "fields": "pixelSize"}})
    for texto, color in CONCEPTOS:
        reqs.append({"addConditionalFormatRule": {"index": 0, "rule": {
            "ranges": [{"sheetId": sid, "startRowIndex": 2, "startColumnIndex": 2,
                        "endColumnIndex": 3}],
            "booleanRule": {"condition": {"type": "TEXT_EQ",
                                          "values": [{"userEnteredValue": texto}]},
                            "format": {"backgroundColor": rgb(color)}}}}})
    sh.batch_update({"requests": reqs})


# El spreadsheet está en es_ES: la API interpreta las fórmulas y los valores de las
# reglas en el idioma de la hoja (separador «;», decimal «,»). Las fórmulas se escriben
# con comas y sin decimales, y loc() las traduce al vuelo según el locale real.
DECIMAL_COMA = True


def loc(formula: str) -> str:
    """Cambia «,» por «;» fuera de comillas si la hoja usa coma decimal."""
    if not DECIMAL_COMA:
        return formula
    out, comilla = [], None
    for ch in formula:
        if comilla:
            if ch == comilla:
                comilla = None
        elif ch in "\"'":
            comilla = ch
        elif ch == ",":
            ch = ";"
        out.append(ch)
    return "".join(out)


def num(x: float) -> str:
    s = str(x)
    return s.replace(".", ",") if DECIMAL_COMA else s


def concepto(fila: int) -> str:
    b = f"B{fila}"
    return loc(f'=IF({b}="","",IF({b}*10>=45,"Excelente",IF({b}>=4,"Muy bueno",'
               f'IF({b}>=3,"Aceptable",IF({b}>=2,"Insuficiente","Deficiente")))))')


def ajustar_altos(sh, ws, cuerpo: list[list]):
    """Alto de cada fila según el texto más largo. La API no auto-ajusta filas con
    texto envuelto, así que se estima: ~6,3 px por carácter a 10 pt, 16 px por línea.
    Respeta los anchos de columna actuales (si se cambian a mano, se recalcula)."""
    if not cuerpo:
        return
    md = sh.fetch_sheet_metadata({
        "fields": "sheets(properties(sheetId),data(columnMetadata(pixelSize)))",
        "ranges": [f"'{ws.title}'!A1:{col_letra(len(cuerpo[0]))}1"]})
    hoja = next(x for x in md["sheets"] if x["properties"]["sheetId"] == ws.id)
    anchos = [c.get("pixelSize", 100) for c in hoja["data"][0]["columnMetadata"]]
    reqs = []
    for i, fila in enumerate(cuerpo):
        alto = 0
        for j, v in enumerate(fila):
            cpl = max(1.0, (anchos[j] if j < len(anchos) else 100) - 8) / 6.3
            lineas = sum(max(1, math.ceil(len(p) / cpl)) for p in str(v).split("\n"))
            alto = max(alto, lineas * 16 + 10)
        reqs.append({"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "ROWS", "startIndex": i + 2, "endIndex": i + 3},
            "properties": {"pixelSize": int(min(max(alto, 42), 900))}, "fields": "pixelSize"}})
    sh.batch_update({"requests": reqs})


def sincronizar_taller(sh, t: dict, hojas: dict, leidas: dict, directorio: dict) -> dict | None:
    if t["hoja"] not in hojas:
        print(f"  {t['clave']}: la pestaña '{t['hoja']}' no existe todavía — se omite.")
        return None
    enc, filas, envios = leidas[t["hoja"]]
    if not filas:
        print(f"  {t['clave']}: '{t['hoja']}' está vacía — se omite.")
        return None

    campos = [c for c in enc if c not in META]
    pregs = preguntas(t["app"], campos)
    titulo = f"Calificar {t['clave']} · {t['nombre']}"

    nueva = titulo not in hojas
    if nueva:
        ws = sh.add_worksheet(title=titulo, rows=max(len(filas) + 20, 60),
                              cols=len(FIJAS) + len(campos))
        orden_prev, prev = [], {}
    else:
        ws = hojas[titulo]
        orden_prev, prev = leer_calificaciones(ws)

    por_cod = {norm_codigo(f["codigo"]): f for f in filas}
    orden = [c for c in orden_prev if c in por_cod or (prev.get(c, {}).get("nota") not in ("", None))]
    orden += [c for c in por_cod if c not in orden]

    # Fila 1: grupo (Acto 1, Parte 2…) solo donde cambia; fila 2: preguntas.
    grupos, ultimo = [], None
    for c in campos:
        m = re.match(r"[ap](\d)_", c)
        g = f"{t['grupo']} {m.group(1)}" if m else "Contexto"
        grupos.append(g if g != ultimo else "")
        ultimo = g
    fila1 = [f"{t['clave']} · {t['nombre']}", "CALIFICACIÓN", "", ""] + [""] * 4 + grupos
    fila2 = FIJAS + [pregs[c][0] for c in campos]

    cuerpo, avisos = [], 0
    for cod in orden:
        f = por_cod.get(cod)
        p = prev.get(cod, {})
        nota = p.get("nota", "")
        if f is None:  # calificado pero ya no está en las respuestas
            cuerpo.append([p.get("nombre", ""), nota, "", p.get("comentario", ""), cod, "", "",
                           "⚠ ya no aparece en las respuestas"] + [""] * len(campos))
            continue
        pareja_cods = codigos_pareja(f.get("pareja", ""), cod, directorio)
        enviado = hora_col(f.get("timestamp", ""))
        if envios[cod] > 1:
            enviado += f" ({envios[cod]} envíos)"
        anterior = str(p.get("enviado", "")).split(" ⚠")[0].split(" (")[0]
        ya_avisado = "⚠ reenvió" in str(p.get("enviado", ""))
        if nota not in ("", None) and (ya_avisado or (anterior and anterior != enviado.split(" (")[0])):
            enviado += " ⚠ reenvió después de calificado"
            avisos += 1
        cuerpo.append([f.get("nombre", "").strip(), nota, "", p.get("comentario", ""), cod,
                       " ".join(pareja_cods), f.get("pareja", "").strip(), enviado]
                      + [f.get(c, "") for c in campos])

    n_cols = len(FIJAS) + len(campos)
    if ws.col_count < n_cols or ws.row_count < len(cuerpo) + 2:
        ws.resize(rows=max(ws.row_count, len(cuerpo) + 20), cols=max(ws.col_count, n_cols))

    ws.batch_clear([f"A1:{col_letra(ws.col_count)}{ws.row_count}"])
    ws.update([fila1, fila2] + cuerpo, "A1", value_input_option="RAW")
    if cuerpo:
        ws.update([[concepto(i)] for i in range(3, len(cuerpo) + 3)], f"C3:C{len(cuerpo) + 2}",
                  value_input_option="USER_ENTERED")

    # Notas en los encabezados con el texto completo de cada pregunta.
    sh.batch_update({"requests": [{"updateCells": {
        "range": {"sheetId": ws.id, "startRowIndex": 1, "endRowIndex": 2,
                  "startColumnIndex": len(FIJAS) + j, "endColumnIndex": len(FIJAS) + j + 1},
        "rows": [{"values": [{"note": pregs[c][1]}]}], "fields": "note"}}
        for j, c in enumerate(campos)]})

    if nueva:
        anchos = list(ANCHOS_FIJAS)
        for c in campos:
            largo = sum(len(f.get(c, "")) for f in filas) / len(filas)
            anchos.append(460 if largo > 300 else 300 if largo > 120 else 170 if largo > 25 else 110)
        formato_inicial(sh, ws, n_cols, anchos)
    ajustar_altos(sh, ws, cuerpo)

    calificadas = sum(1 for fila in cuerpo if fila[1] not in ("", None))
    print(f"  {t['clave']}: {len(cuerpo)} entregas en '{titulo}' "
          f"({calificadas} calificadas{'; ' + str(avisos) + ' reenvíos tras calificar' if avisos else ''})"
          f"{' — pestaña nueva' if nueva else ''}")
    nombres = {}
    for f in filas:
        nombres.setdefault(norm_codigo(f["codigo"]), []).append(f.get("nombre", ""))
        for pc, nom in zip(codigos_en(f.get("pareja", "")),
                           re.split(r"[\d()\n,;/]+", f.get("pareja", ""))):
            nombres.setdefault(pc, []).append(nom)
        for pc in codigos_pareja(f.get("pareja", ""), norm_codigo(f["codigo"]), directorio):
            nombres.setdefault(pc, [])
    return dict(titulo=titulo, nombres=nombres, ws=ws, **t)


# --- Resumen -------------------------------------------------------------------

def sincronizar_resumen(sh, hechos: list[dict], hojas: dict):
    nombres: dict[str, list[str]] = {}
    for h in hechos:
        for cod, ns in h["nombres"].items():
            nombres.setdefault(cod, []).extend(ns)
    estudiantes = sorted(((mejor_nombre(ns), cod) for cod, ns in nombres.items()),
                         key=lambda x: x[0].lower())

    enc = ["Estudiante", "Código"] + [f"{h['clave']} · {h['nombre']}" for h in hechos] + \
          ["Promedio", "Calificados"]
    filas = [enc]
    k = len(hechos)
    ult = col_letra(2 + k)
    for i, (nom, cod) in enumerate(estudiantes, start=2):
        fila = [nom, cod]
        for h in hechos:
            q = "'" + h["titulo"].replace("'", "''") + "'"
            fila.append(loc(
                f'=LET(f,IFERROR(MATCH($B{i},{q}!$E:$E,0),IFERROR(MATCH("*"&$B{i}&"*",{q}!$F:$F,0),0)),'
                f'IF(f=0,"—",IF(INDEX({q}!$B:$B,f)="","por calificar",INDEX({q}!$B:$B,f))))'))
        fila.append(loc(f'=IFERROR(ROUND(AVERAGE(C{i}:{ult}{i}),1),"")'))
        fila.append(loc(f'=COUNT(C{i}:{ult}{i})&" de "&(COUNTA(C{i}:{ult}{i})-COUNTIF(C{i}:{ult}{i},"—"))'))
        filas.append(fila)

    nueva = RESUMEN not in hojas
    ws = sh.add_worksheet(title=RESUMEN, rows=len(filas) + 30, cols=len(enc) + 2) if nueva \
        else hojas[RESUMEN]
    if ws.row_count < len(filas) + 5 or ws.col_count < len(enc):
        ws.resize(rows=max(ws.row_count, len(filas) + 30), cols=max(ws.col_count, len(enc)))
    ws.batch_clear([f"A1:{col_letra(ws.col_count)}{ws.row_count}"])
    ws.update([[f[0], f[1]] for f in filas], "A1", value_input_option="RAW")
    ws.update([f[2:] for f in filas], "C1", value_input_option="USER_ENTERED")

    sid = ws.id
    reqs = [
        {"updateSheetProperties": {"properties": {"sheetId": sid, "gridProperties": {
            "frozenRowCount": 1, "frozenColumnCount": 1}},
            "fields": "gridProperties.frozenRowCount,gridProperties.frozenColumnCount"}},
        {"repeatCell": {"range": {"sheetId": sid, "startRowIndex": 0, "endRowIndex": 1},
                        "cell": {"userEnteredFormat": {
                            "backgroundColor": rgb(AZUL), "horizontalAlignment": "CENTER",
                            "textFormat": {"bold": True, "foregroundColor": rgb("FFFFFF")}}},
                        "fields": "userEnteredFormat(backgroundColor,horizontalAlignment,textFormat)"}},
        {"repeatCell": {"range": {"sheetId": sid, "startRowIndex": 1, "startColumnIndex": 2,
                                  "endColumnIndex": len(enc)},
                        "cell": {"userEnteredFormat": {"horizontalAlignment": "CENTER"}},
                        "fields": "userEnteredFormat.horizontalAlignment"}},
        {"repeatCell": {"range": {"sheetId": sid, "startRowIndex": 1, "startColumnIndex": 2 + k,
                                  "endColumnIndex": 3 + k},
                        "cell": {"userEnteredFormat": {"textFormat": {"bold": True}}},
                        "fields": "userEnteredFormat.textFormat.bold"}},
        {"updateDimensionProperties": {"range": {"sheetId": sid, "dimension": "COLUMNS",
                                                 "startIndex": 0, "endIndex": 1},
                                       "properties": {"pixelSize": 260}, "fields": "pixelSize"}},
        {"updateDimensionProperties": {"range": {"sheetId": sid, "dimension": "COLUMNS",
                                                 "startIndex": 1, "endIndex": len(enc)},
                                       "properties": {"pixelSize": 105}, "fields": "pixelSize"}},
    ]
    if nueva:
        rango = {"sheetId": sid, "startRowIndex": 1, "startColumnIndex": 2,
                 "endColumnIndex": 3 + k}
        reglas = [("TEXT_EQ", "por calificar", "FFF2CC"), ("TEXT_EQ", "—", "EDEDED")]
        for tipo, val, color in reglas:
            reqs.append({"addConditionalFormatRule": {"index": 0, "rule": {
                "ranges": [rango], "booleanRule": {
                    "condition": {"type": tipo, "values": [{"userEnteredValue": val}]},
                    "format": {"backgroundColor": rgb(color)}}}}})
        for (texto, color), (lo, hi) in zip(CONCEPTOS, [(4.5, 5), (4, 4.49), (3, 3.99),
                                                         (2, 2.99), (0, 1.99)]):
            reqs.append({"addConditionalFormatRule": {"index": 0, "rule": {
                "ranges": [rango], "booleanRule": {
                    "condition": {"type": "NUMBER_BETWEEN",
                                  "values": [{"userEnteredValue": num(lo)},
                                             {"userEnteredValue": num(hi)}]},
                    "format": {"backgroundColor": rgb(color)}}}}})
    sh.batch_update({"requests": reqs})
    print(f"  Resumen: {len(estudiantes)} estudiantes en '{RESUMEN}'.")
    return ws


def main():
    if not os.path.exists(SA_KEY):
        raise SystemExit(f"No encuentro la llave del service account en:\n  {SA_KEY}")
    creds = Credentials.from_service_account_file(
        SA_KEY, scopes=["https://www.googleapis.com/auth/spreadsheets"])
    sh = gspread.authorize(creds).open_by_key(SHEET_ID)
    global DECIMAL_COMA
    locale = sh.fetch_sheet_metadata()["properties"].get("locale", "en_US")
    DECIMAL_COMA = not locale.startswith("en")
    hojas = {ws.title: ws for ws in sh.worksheets()}

    print("Sincronizando…")
    # Primero se leen todas las entregas: el directorio código → nombres sirve para
    # reconocer a la pareja cuando la escribieron sin código.
    leidas = {t["hoja"]: entregas(hojas[t["hoja"]]) for t in TALLERES if t["hoja"] in hojas}
    directorio: dict[str, set[str]] = {}
    for _, filas, _ in leidas.values():
        for f in filas:
            directorio.setdefault(norm_codigo(f["codigo"]), set()).add(f.get("nombre", ""))
            for pc, nom in zip(codigos_en(f.get("pareja", "")),
                               re.split(r"[\d()\n,;/]+", f.get("pareja", ""))):
                directorio.setdefault(pc, set()).add(nom)
    hechos = [h for t in TALLERES
              if (h := sincronizar_taller(sh, t, hojas, leidas, directorio))]
    hojas = {ws.title: ws for ws in sh.worksheets()}
    resumen = sincronizar_resumen(sh, hechos, hojas)

    # Las pestañas de calificación van de primeras.
    orden = [resumen] + [h["ws"] for h in hechos]
    sh.batch_update({"requests": [
        {"updateSheetProperties": {"properties": {"sheetId": ws.id, "index": i},
                                   "fields": "index"}} for i, ws in enumerate(orden)]})
    print(f"\nListo: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit#gid={resumen.id}")


if __name__ == "__main__":
    main()
