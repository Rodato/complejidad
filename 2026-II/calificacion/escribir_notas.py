"""Pasa las notas propuestas (propuestas/T?_notas.json) a las pestañas «Calificar …».
Solo llena filas cuya Nota está vacía, salvo con --forzar. Uso: escribir_notas.py T5 [--forzar]"""
import sys, json, os
import sincronizar_notas as s, gspread
from google.oauth2.service_account import Credentials
PROP = os.path.join(os.path.dirname(os.path.abspath(__file__)), "propuestas")
forzar = "--forzar" in sys.argv
claves = [a for a in sys.argv[1:] if not a.startswith("--")]
sh = gspread.authorize(Credentials.from_service_account_file(s.SA_KEY, scopes=["https://www.googleapis.com/auth/spreadsheets"])).open_by_key(s.SHEET_ID)
for clave in claves:
    t = next(x for x in s.TALLERES if x["clave"] == clave)
    datos = json.load(open(os.path.join(PROP, f"{clave}_notas.json")))
    props = {s.norm_codigo(e["codigo"]): e for e in datos["entregas"]}
    ws = sh.worksheet(f"Calificar {clave} · {t['nombre']}")
    vals = ws.get_all_values(value_render_option="UNFORMATTED_VALUE")
    updates, faltan, saltadas = [], set(props), 0
    for i, f in enumerate(vals[2:], start=3):
        cod = s.norm_codigo(f[4])
        if cod not in props: continue
        faltan.discard(cod)
        if f[1] not in ("", None) and not forzar:
            saltadas += 1; continue
        e = props[cod]
        updates.append({"range": f"B{i}", "values": [[float(e["nota"])]]})
        updates.append({"range": f"D{i}", "values": [[e["comentario"]]]})
    if updates:
        ws.batch_update(updates, value_input_option="RAW")
    print(f"{clave}: {len(updates)//2} notas escritas, {saltadas} ya tenían nota (no se tocaron), sin fila en la hoja: {sorted(faltan) or '—'}")
