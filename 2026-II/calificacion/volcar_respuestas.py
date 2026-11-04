"""Vuelca las respuestas de cada taller a propuestas/T?.md para el calificador: el texto
completo de cada pregunta, la lista de pares muy parecidos entre quienes NO son pareja y
cada entrega. Tiene datos de estudiantes: propuestas/ está en .gitignore.
Uso: .venv/bin/python volcar_respuestas.py T5   (sin argumentos: todos los que tengan pestaña)"""
import sys, os, re, json, difflib, itertools
import sincronizar_notas as s, gspread
from google.oauth2.service_account import Credentials
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "propuestas")
os.makedirs(OUT, exist_ok=True)
PEDIDOS = set(sys.argv[1:])
sh = gspread.authorize(Credentials.from_service_account_file(s.SA_KEY, scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"])).open_by_key(s.SHEET_ID)
hojas = {w.title: w for w in sh.worksheets()}
def norm(t): return re.sub(r"\s+", " ", t.lower()).strip()
for t in s.TALLERES:
    cal_t = f"Calificar {t['clave']} · {t['nombre']}"
    if (PEDIDOS and t["clave"] not in PEDIDOS) or t["hoja"] not in hojas or cal_t not in hojas:
        continue
    enc, filas, envios = s.entregas(hojas[t["hoja"]])
    cal = hojas[cal_t].get_all_values()[2:]
    pares = {r[4]: r[5].split() for r in cal}
    campos = [c for c in enc if c not in s.META]
    pregs = s.preguntas(t["app"], campos)
    L = [f"# {t['clave']} · {t['nombre']} — {len(filas)} entregas\n",
         "## Preguntas (id → texto completo)\n"]
    for c in campos:
        L.append(f"- `{c}`: {pregs[c][0]}  \n  {pregs[c][1].split(chr(10)+chr(10),1)[-1]}")
    # similitud entre no-parejas
    sim = []
    for a, b in itertools.combinations(filas, 2):
        ca, cb = s.norm_codigo(a["codigo"]), s.norm_codigo(b["codigo"])
        if cb in pares.get(ca, []) or ca in pares.get(cb, []):
            continue
        for c in campos:
            x, y = norm(a.get(c, "")), norm(b.get(c, ""))
            if c in {"a2_fichas","p3_enlaces","a1_clasificacion","a2_cronologia"} or min(len(x), len(y)) < 150: continue
            r = difflib.SequenceMatcher(None, x, y, autojunk=False).ratio()
            if r > 0.55:
                sim.append((c, ca, a["nombre"], cb, b["nombre"], round(r, 2)))
    L.append("\n## Similitud alta entre entregas que NO son pareja (difflib > 0,55, respuestas ≥150 caracteres)\n")
    L += [f"- `{c}`: {ca} ({na}) ↔ {cb} ({nb}) — {r}" for c, ca, na, cb, nb, r in sim] or ["- ninguna"]
    L.append("\n## Entregas\n")
    for f in filas:
        cod = s.norm_codigo(f["codigo"])
        L.append(f"\n---\n\n### Entrega {cod} — {f['nombre'].strip()}")
        L.append(f"Pareja declarada: {f.get('pareja','').strip() or '—'} · Enviado: {s.hora_col(f['timestamp'])}\n")
        for c in campos:
            v = f.get(c, "").strip()
            L.append(f"**`{c}`**: {v if v else '_(en blanco)_'}\n")
    open(f"{OUT}/{t['clave']}.md", "w").write("\n".join(L))
    print(t["clave"], len(filas), "entregas,", sum(len(x) for x in L)//1000, "k chars, similitudes:", len(sim))
    for x in sim: print("   ", x)
