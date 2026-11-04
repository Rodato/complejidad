"""Excel de calificación para compartir (p. ej. con Boris): formato de examen.

  - «Resumen»: una fila por estudiante, nota de cada taller y promedio.
  - Una hoja por taller: arriba los pesos, la escala y la clave usada para calificar, y un
    índice con enlaces; después, cada entrega como un examen (enunciado → respuesta), con
    la nota, el concepto, el desglose por acto y el comentario. Un salto de página por
    entrega, para imprimir.

Las notas y comentarios se leen de las pestañas «Calificar …» del spreadsheet (así entran
las correcciones hechas a mano). El desglose por acto, los pesos y la clave salen de
`propuestas/T?_notas.json` (gitignoreado: tiene datos de estudiantes).

Salida: Notas_2026-II_talleres_<n>.xlsx en esta carpeta (gitignoreado, PII).
Correr: .venv/bin/python armar_excel.py   (necesita gspread, google-auth y openpyxl)
"""

from __future__ import annotations

import json
import math
import os
import re
from datetime import date

import gspread
from google.oauth2.service_account import Credentials
from openpyxl import Workbook
from openpyxl.cell.rich_text import CellRichText, TextBlock
from openpyxl.cell.text import InlineFont
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.pagebreak import Break

import sincronizar_notas as s

AQUI = os.path.dirname(os.path.abspath(__file__))
PROPUESTAS = os.path.join(AQUI, "propuestas")

TITULOS = {
    "T1": "Taller 1 · Cali ante el espejo del terremoto",
    "T2": "Taller 2 · Nodos, vínculos y poder",
    "T3": "Taller 3 · Lo que la red cuenta",
    "T4": "Taller 4 · La burguesía azucarera en red",
    "T5": "Taller 5 · La renta del suelo en Cali",
}
CONTEXTO = {"escenario_id": None, "escenario_titulo": "Escenario asignado",
            "familia": "Familia asignada", "personaje": "Personaje asignado",
            "actor": "Actor de Cali asignado"}
# Campos que no se muestran como pregunta propia: los calcula la app y se resumen dentro
# de la respuesta estructurada a la que pertenecen.
OMITIR = {"a1_aciertos", "a2_aciertos", "a2_n_conocer", "a2_n_actuar"}
ETIQUETAS = {  # preguntas que en la app son un widget sin número ni enunciado
    "a3_camino": ("3.1", "De los Pazzi a los Lamberteschi",
                  "Camino más corto que armó en la app, familia por familia."),
    "a2_fichas": ("2.1", "Seis escrituras de 1938–1943",
                  "Para cada escritura: ¿de quién a quién pasa la tierra? (o «no pasa tierra»)."),
    "p3_enlaces": ("3.1", "Matrimonios entre los grupos del cuadro 7, 1930–1950",
                   "Matrimonios que encontraron: persona – persona, año, fuente y si lo verificaron."),
}

AZUL, GRIS, AMARILLO = "1F4E78", "F2F2F2", "FFF8E1"
COLOR_CONCEPTO = dict(s.CONCEPTOS)
MANO = Font(name="Calibri", size=11)


def concepto(n) -> str:
    if not isinstance(n, (int, float)):
        return ""
    return ("Excelente" if n >= 4.5 else "Muy bueno" if n >= 4 else "Aceptable" if n >= 3
            else "Insuficiente" if n >= 2 else "Deficiente")


def coma(x) -> str:
    return f"{x:.1f}".replace(".", ",") if isinstance(x, (int, float)) else str(x)


def leer_ts(app: str, archivo: str) -> str:
    return open(os.path.join(s.SEMESTRE, app, archivo), encoding="utf-8").read()


def recortar(t: str, n: int = 110) -> str:
    t = re.sub(r"\s+", " ", t).strip()
    return t if len(t) <= n else t[: n - 1] + "…"


# --- Diccionarios de cada app para traducir las respuestas estructuradas ---------

def diccionarios() -> dict:
    d: dict = {}
    t1 = leer_ts("1.Taller_Terremoto/taller-sismo", "src/lib/contenido.ts")
    d["factores"] = {m[0]: (m[1], m[2]) for m in re.findall(
        r'id: "(f\d)",\s*texto:\s*"((?:[^"\\]|\\.)*)",\s*correcta: "(\w+)"', t1)}
    d["cronologia"] = {m[0]: (m[1], m[2]) for m in re.findall(
        r'id: "(c\d)",\s*anio: "([^"]+)",\s*hecho:\s*"((?:[^"\\]|\\.)*)"', t1)}
    d["lazo"] = {m[0]: m[1] for m in re.findall(r'id: "(l\d)",\s*etapa: "([^"]+)"', t1)}
    t2 = leer_ts("2.Taller_Redes/taller-redes", "src/lib/contenido.ts")
    d["relaciones"] = {m[0]: (m[1], m[2]) for m in re.findall(
        r'id: "(r\d)",\s*texto: "([^"]+)",\s*correcta: "(\w+)"', t2)}
    t3 = leer_ts("3.Taller_Relatos/taller-relatos", "src/lib/contenido.ts")
    d["actores_fichas"] = dict(re.findall(r'\{ id: "(\w+)", nombre: "([^"]+)"', t3))
    d["fichas"] = {}
    for m in re.finditer(r'id: "(e\d)",\s*fecha: "([^"]+)",\s*texto:\s*"((?:[^"\\]|\\.)*)",\s*'
                         r'correcta: (null|\{ de: "(\w+)", a: "(\w+)" \})', t3):
        d["fichas"][m[1]] = (m[2], m[3], None if m[4] == "null" else (m[5], m[6]))
    d["chequeo"] = {m[0]: m[1].split(":")[0] for m in re.findall(
        r'\{ id: "(patron|protagonista|quiebre|cifras|limite)", texto: "([^"]+)"', t3)}
    notaria = json.load(open(os.path.join(s.SEMESTRE, "3.Taller_Relatos/taller-relatos",
                                          "src/data/notaria.json"), encoding="utf-8"))
    d["actores"] = {a["id"]: a["etiqueta"] for a in notaria["actores"]}
    return d


def _json(v):
    v = (v or "").strip()
    if v[:1] in "[{":
        try:
            return json.loads(v)
        except json.JSONDecodeError:
            return None
    return None


def renderizar(campo: str, valor: str, fila: dict, D: dict) -> str:
    """Respuesta tal como la lee un profesor (los widgets de la app vienen en JSON)."""
    v = (valor or "").strip()
    j = _json(v)
    ok = lambda b: "✓" if b else "✗"
    if campo == "a1_clasificacion" and isinstance(j, dict):
        lineas, bien = [], 0
        for k in sorted(D["factores"]):
            texto, correcta = D["factores"][k]
            r = j.get(k, "")
            bien += r == correcta
            extra = "" if r == correcta else f" (correcta: {correcta})"
            lineas.append(f"{ok(r == correcta)} {recortar(texto, 95)} → {r or '—'}{extra}")
        return f"{bien} de {len(D['factores'])} correctas\n" + "\n".join(lineas)
    if campo == "a2_cronologia" and isinstance(j, dict):
        lineas = [f"{D['cronologia'][k][0]} — {recortar(D['cronologia'][k][1], 85)} → {j.get(k, '—')}"
                  for k in sorted(D["cronologia"], key=lambda x: int(x[1:]))]
        tot = (f"Según su clasificación: {fila.get('a2_n_conocer', '?')} produjeron conocimiento · "
               f"{fila.get('a2_n_actuar', '?')} actuaron sobre las edificaciones")
        return tot + "\n" + "\n".join(lineas)
    if campo == "a4_lazo" and isinstance(j, dict):
        nombres = {"si": "sí", "parcial": "parcialmente", "no": "no", "nose": "no sé"}
        return "\n".join(f"{D['lazo'][k]}: {nombres.get(j.get(k, ''), j.get(k, '—'))}"
                         for k in sorted(D["lazo"]))
    if campo == "a1_direccion" and isinstance(j, dict):
        lineas, bien = [], 0
        for k in sorted(D["relaciones"]):
            texto, correcta = D["relaciones"][k]
            r = j.get(k, "")
            bien += r == correcta
            lineas.append(f"{ok(r == correcta)} {texto} → {r.replace('_', ' ') or '—'}")
        return f"{bien} de {len(D['relaciones'])} correctas\n" + "\n".join(lineas)
    if campo == "a3_camino" and isinstance(j, list):
        return " → ".join(j) if j else ""
    if campo == "a2_fichas" and isinstance(j, dict):
        lineas, bien = [], 0
        for k in sorted(D["fichas"], key=lambda x: int(x[1:])):
            fecha, texto, correcta = D["fichas"][k]
            r = j.get(k, {}) or {}
            if r.get("no"):
                dijo, acierto = "no pasa tierra", correcta is None
            else:
                de, a = r.get("de", ""), r.get("a", "")
                dijo = (f"{D['actores_fichas'].get(de, de or '?')} → "
                        f"{D['actores_fichas'].get(a, a or '?')}")
                acierto = correcta is not None and (de, a) == correcta
            bien += acierto
            lineas.append(f"{ok(acierto)} {fecha}: {recortar(texto, 80)} → {dijo}")
        return f"{bien} de {len(D['fichas'])} correctas\n" + "\n".join(lineas)
    if campo == "a4_chequeo" and isinstance(j, dict):
        marcadas = [D["chequeo"].get(k, k) for k, b in j.items() if b]
        faltan = [D["chequeo"].get(k, k) for k, b in j.items() if not b]
        return ("Marcó: " + (", ".join(marcadas) or "nada")
                + (f" · No marcó: {', '.join(faltan)}" if faltan else ""))
    if campo == "p3_enlaces" and isinstance(j, list):
        lineas = []
        for e in j:
            if not any(str(x).strip() for x in e.values()):
                continue
            lineas.append(f"{e.get('persona1', '?')} – {e.get('persona2', '?')} · año: "
                          f"{e.get('anio') or '?'} · fuente: {e.get('fuente') or '?'} · "
                          f"verificado: {(e.get('verificado') or '?').replace('_', ' ')}")
        return "\n".join(lineas)
    if campo in ("a3_acumula", "a3_reparte") and v in D["actores"]:
        return D["actores"][v]
    if isinstance(j, dict):
        return "\n".join(f"{k}: {x}" for k, x in j.items())
    if isinstance(j, list):
        return "\n".join(json.dumps(x, ensure_ascii=False) if isinstance(x, dict) else str(x) for x in j)
    if re.fullmatch(r"[a-z]+(_[a-z]+)+", v):
        return v.replace("_", " ")
    if re.fullmatch(r"[A-Z][a-z]+(-[A-Z][a-z]+)+", v):
        return v.replace("-", " ")
    return v


def _punto(t: str) -> str:
    t = t.strip()
    return t if t[-1:] in ".?!:»" else t + "."


def enunciado(campo: str, d: dict, anterior: tuple | None) -> tuple[str, str, str | None, tuple]:
    """(número, texto de la pregunta, ayuda, clave del bloque) para el examen. Si el campo
    sigue a otro del mismo ejercicio, solo se repite lo que cambia (su label)."""
    if campo in ETIQUETAS:
        num, tit, texto = ETIQUETAS[campo]
        return num, f"{_punto(tit)} {texto}", None, (num, tit)
    num, tit, lab, ayuda, enun = (d.get(k) for k in ("num", "tit", "lab", "ayuda", "enunciado"))
    if enun and len(re.sub(r"[^A-Za-zÁÉÍÓÚáéíóúñÑ]", "", enun)) < 15:
        enun = None
    bloque = (num, tit)
    mismo = anterior == bloque
    partes = []
    if tit and not mismo:
        partes.append(_punto(tit))
    if enun and not mismo and (not lab or len(lab) < 45 or enun.rstrip().endswith("?")):
        partes.append(enun)
    if lab:
        partes.append(lab)
    if not partes and tit:
        partes.append(_punto(tit))
    return ("" if mismo else (num or "")), " ".join(partes) or campo, ayuda, bloque


def legible(linea: str, clave: str, D: dict) -> str:
    """Cambia los ids internos de la app (c5, f4, l3) por lo que Boris ve en el examen."""
    if clave != "T1":
        return linea
    linea = re.sub(r"\bc(\d)\b", lambda m: D["cronologia"].get(f"c{m[1]}", (m[0],))[0], linea)
    linea = re.sub(r"\bl(\d)\b", lambda m: D["lazo"].get(f"l{m[1]}", m[0]), linea)
    return re.sub(r"\bf(\d)\b", r"afirmación \1", linea)


# --- Estilos -------------------------------------------------------------------------

def relleno(hexa: str) -> PatternFill:
    return PatternFill("solid", fgColor=hexa)


ENVUELTO = Alignment(wrap_text=True, vertical="top")
ANCHO_B = 110  # caracteres de la columna B


def alto(texto: str, ancho: int = ANCHO_B, pt: int = 15) -> float:
    cpl = ancho * 1.15
    lineas = sum(max(1, math.ceil(len(p) / cpl)) for p in str(texto).split("\n"))
    return min(lineas * pt + 4, 409)


# --- Hojas ---------------------------------------------------------------------------

def hoja_resumen(wb, notas_tab: list[list], claves: list[str]):
    ws = wb.active
    ws.title = "Resumen"
    ws["A1"] = "Introducción a la Complejidad 2026-II · Notas de los talleres"
    ws["A1"].font = Font(bold=True, size=14, color=AZUL)
    ws["A2"] = f"Propuesta para revisar · {date.today():%Y-%m-%d}"
    ws["A2"].font = Font(italic=True, color="595959")
    ws["A3"] = ("Escala: 4,5–5 Excelente · 4,0–4,4 Muy bueno · 3,0–3,9 Aceptable · "
                "2,0–2,9 Insuficiente · 1,0–1,9 Deficiente.  «—» = no entregó (no cuenta en "
                "el promedio).  Las parejas comparten la nota de la entrega conjunta.")
    ws["A3"].alignment = ENVUELTO
    ws.merge_cells(start_row=3, start_column=1, end_row=3, end_column=3 + len(claves))
    ws.row_dimensions[3].height = 32

    enc = notas_tab[0]
    idx = {h: i for i, h in enumerate(enc)}
    columnas = ["Estudiante", "Código"] + [h for h in enc if h[:2] in claves] + ["Promedio"]
    for j, h in enumerate(columnas, start=1):
        c = ws.cell(row=5, column=j, value=h)
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = relleno(AZUL)
        c.alignment = Alignment(horizontal="center", vertical="center")
    borde = Border(bottom=Side(style="thin", color="D9D9D9"))
    for i, f in enumerate(notas_tab[1:], start=6):
        notas = [f[idx[h]] for h in columnas[2:-1]]
        nums = [n for n in notas if isinstance(n, (int, float))]
        prom = round(sum(nums) / len(nums), 1) if nums else ""
        valores = [f[idx["Estudiante"]], str(f[idx["Código"]])] + notas + [prom]
        for j, v in enumerate(valores, start=1):
            c = ws.cell(row=i, column=j, value=v if v != "" else None)
            c.border = borde
            if j > 2:
                c.alignment = Alignment(horizontal="center")
                if isinstance(v, (int, float)):
                    c.number_format = "0.0"
                    c.fill = relleno(COLOR_CONCEPTO[concepto(v)])
                elif v == "—":
                    c.font = Font(color="808080")
            if j == len(valores):
                c.font = Font(bold=True)
    ws.column_dimensions["A"].width = 38
    ws.column_dimensions["B"].width = 11
    for j in range(3, len(columnas) + 1):
        ws.column_dimensions[ws.cell(row=5, column=j).column_letter].width = 13
    ws.freeze_panes = "A6"
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True


def hoja_taller(wb, t: dict, enc: list[str], filas: list[dict], calif: dict, prop: dict,
                nombres: dict, D: dict):
    titulo = f"{t['clave']} · {t['nombre']}"
    ws = wb.create_sheet(titulo)
    ws.column_dimensions["A"].width = 8
    ws.column_dimensions["B"].width = ANCHO_B
    ws.sheet_view.showGridLines = False
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True

    campos = [c for c in enc if c not in s.META]
    detalle = s.detalle_preguntas(t["app"], campos)
    r = 1

    def poner(texto, fila=None, col=2, fuente=None, fondo=None, h=None, alin=ENVUELTO):
        nonlocal r
        fila = fila or r
        c = ws.cell(row=fila, column=col, value=texto)
        c.alignment = alin
        if fuente:
            c.font = fuente
        if fondo:
            c.fill = relleno(fondo)
        ws.row_dimensions[fila].height = h or alto(str(texto))
        return c

    poner(TITULOS.get(t["clave"], titulo), col=1, fuente=Font(bold=True, size=15, color=AZUL),
          h=24, alin=Alignment(vertical="center"))
    r += 1
    pesos = prop.get("pesos", {})
    if pesos:
        txt = "Peso de cada parte en la nota: " + " · ".join(
            f"{k} {round(v * 100) if v <= 1 else v} %" for k, v in pesos.items())
        poner(txt, fuente=Font(italic=True, color="595959"))
        r += 1
    poner("Escala: 4,5–5 Excelente · 4,0–4,4 Muy bueno · 3,0–3,9 Aceptable · 2,0–2,9 "
          "Insuficiente · 1,0–1,9 Deficiente", fuente=Font(italic=True, color="595959"))
    r += 2
    if prop.get("clave"):
        poner("Clave usada para calificar", fuente=Font(bold=True, color=AZUL), h=18)
        r += 1
        for linea in prop["clave"]:
            poner(f"• {legible(linea, t['clave'], D)}", fuente=Font(size=10))
            r += 1
        r += 1

    # Orden alfabético; el índice se llena después, cuando se sabe dónde cae cada bloque.
    filas = sorted(filas, key=lambda f: (nombres.get(s.norm_codigo(f["codigo"]))
                                         or f.get("nombre", "")).strip().lower())
    poner("Entregas", fuente=Font(bold=True, color=AZUL), h=18)
    r += 1
    fila_indice = r
    r += len(filas) + 1
    desgloses = {s.norm_codigo(e["codigo"]): e.get("desglose", {}) for e in prop.get("entregas", [])}

    destinos = []
    for f in filas:
        cod = s.norm_codigo(f["codigo"])
        cal = calif.get(cod, {})
        nota = cal.get("nota")
        nota = nota if isinstance(nota, (int, float)) else None
        ws.row_breaks.append(Break(id=r - 1))
        inicio = r
        nombre = nombres.get(cod) or f.get("nombre", "").strip()
        pareja = [p for p in cal.get("pareja", "").split() if p]
        poner(f"{nombre} · {cod}", col=1, fuente=Font(bold=True, size=13, color="FFFFFF"),
              fondo=AZUL, h=22, alin=Alignment(vertical="center"))
        ws.cell(row=r, column=2).fill = relleno(AZUL)
        r += 1
        if pareja:
            quien = ", ".join(f"{nombres.get(p, '?')} ({p})" for p in pareja)
            poner(f"En pareja con {quien}: la nota vale para los dos.", fuente=Font(italic=True))
            r += 1
        contexto = [f"{CONTEXTO[c]}: {renderizar(c, f.get(c, ''), f, D)}" for c in campos
                    if CONTEXTO.get(c) and f.get(c, "").strip()]
        enviado = s.hora_col(f.get("timestamp", ""))
        poner(" · ".join(contexto + [f"Enviado: {enviado}"]), fuente=Font(color="595959"))
        r += 1
        # Nota grande a la izquierda; concepto y desglose al lado.
        c = ws.cell(row=r, column=1, value=nota)
        c.font = Font(bold=True, size=16)
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.number_format = "0.0"
        if nota is not None:
            c.fill = relleno(COLOR_CONCEPTO[concepto(nota)])
        des = desgloses.get(cod, {})
        linea = (concepto(nota) or "Sin calificar") + (
            "  ·  " + " · ".join(f"{k} {coma(v)}" for k, v in des.items()) if des else "")
        poner(linea, fuente=Font(bold=True, size=12), h=26, alin=Alignment(vertical="center"))
        r += 1
        if cal.get("comentario"):
            poner(cal["comentario"], fuente=Font(italic=True), fondo=AMARILLO)
            r += 1
        r += 1

        grupo_actual, bloque = None, None
        for c_ in campos:
            if c_ in OMITIR or c_ in CONTEXTO:
                continue
            m = re.match(r"[ap](\d)_", c_)
            grupo = f"{t['grupo']} {m.group(1)}" if m else None
            if grupo and grupo != grupo_actual:
                celda = poner(grupo.upper(), fuente=Font(bold=True, color=AZUL), h=20,
                              alin=Alignment(vertical="bottom"))
                celda.border = Border(bottom=Side(style="medium", color=AZUL))
                ws.cell(row=r, column=1).border = Border(bottom=Side(style="medium", color=AZUL))
                grupo_actual = grupo
                r += 1
            num, preg, ayuda, bloque = enunciado(c_, detalle.get(c_, {}), bloque)
            ws.cell(row=r, column=1, value=num).font = Font(bold=True)
            ws.cell(row=r, column=1).alignment = Alignment(vertical="top")
            texto = CellRichText([TextBlock(InlineFont(b=True), preg)]
                                 + ([TextBlock(InlineFont(i=True, color="7F7F7F"), "\n" + ayuda)]
                                    if ayuda else []))
            c = ws.cell(row=r, column=2, value=texto)
            c.alignment = ENVUELTO
            c.fill = relleno(GRIS)
            ws.row_dimensions[r].height = alto(preg + ("\n" + ayuda if ayuda else ""))
            r += 1
            resp = renderizar(c_, f.get(c_, ""), f, D)
            if resp.strip():
                poner(resp, fuente=MANO)
            else:
                poner("(en blanco)", fuente=Font(italic=True, color="C00000"), h=18)
            r += 1
        r += 1
        destinos.append((nombre, cod, nota, inicio))

    for k, (nombre, cod, nota, fila) in enumerate(destinos):
        fi = fila_indice + k
        c = ws.cell(row=fi, column=1, value=nota)
        c.number_format = "0.0"
        c.alignment = Alignment(horizontal="center")
        if nota is not None:
            c.fill = relleno(COLOR_CONCEPTO[concepto(nota)])
        c = ws.cell(row=fi, column=2, value=f"{nombre} ({cod}) — {concepto(nota) or 'sin calificar'}")
        c.hyperlink = f"#'{titulo}'!A{fila}"
        c.font = Font(color="0563C1", underline="single")


def main():
    creds = Credentials.from_service_account_file(
        s.SA_KEY, scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"])
    sh = gspread.authorize(creds).open_by_key(s.SHEET_ID)
    hojas = {w.title: w for w in sh.worksheets()}
    D = diccionarios()

    notas_tab = hojas[s.RESUMEN].get_all_values(value_render_option="UNFORMATTED_VALUE")
    nombres = {s.norm_codigo(f[1]): f[0] for f in notas_tab[1:]}

    claves = []
    wb = Workbook()
    for t in s.TALLERES:
        cal_titulo = f"Calificar {t['clave']} · {t['nombre']}"
        if cal_titulo not in hojas or t["hoja"] not in hojas:
            continue
        enc, filas, _ = s.entregas(hojas[t["hoja"]])
        calif = {}
        for f in hojas[cal_titulo].get_all_values(value_render_option="UNFORMATTED_VALUE")[2:]:
            calif[s.norm_codigo(f[4])] = dict(nota=f[1], comentario=str(f[3]).strip(),
                                              pareja=str(f[5]))
        ruta = os.path.join(PROPUESTAS, f"{t['clave']}_notas.json")
        prop = json.load(open(ruta, encoding="utf-8")) if os.path.exists(ruta) else {}
        claves.append(t["clave"])
        hoja_taller(wb, t, enc, filas, calif, prop, nombres, D)
        print(f"  {t['clave']}: {len(filas)} entregas")

    hoja_resumen(wb, notas_tab, claves)
    wb.move_sheet("Resumen", offset=-len(wb.sheetnames) + 1)
    rango = f"{claves[0][1:]}-{claves[-1][1:]}" if len(claves) > 1 else claves[0][1:]
    salida = os.path.join(AQUI, f"Notas_2026-II_talleres_{rango}.xlsx")
    wb.save(salida)
    print(f"Listo: {salida}")


if __name__ == "__main__":
    main()
