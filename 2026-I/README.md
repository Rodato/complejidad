# Introducción a la Complejidad · 2026-I

**Semestre terminado** (feb–jul 2026). Universidad del Valle · Daniel Otero, con Boris Salazar.

Tema: la emergencia de Cali como espacio urbano (1900–1980) mediante análisis de redes,
con los estudiantes como "detectives históricos" sobre los protocolos de la Notaría 2.
Tres grupos: **A** (red social), **B** (red inmobiliaria), **C** (red espacial).

Esta carpeta es archivo. Las cinco apps siguen desplegadas y sus repos están en GitHub;
lo que se rompió después de terminar el semestre está anotado abajo en *Estado*.

## Contenido

| Carpeta | Qué es | Repo |
|---|---|---|
| `1.Intro_Redes/` | Clase introductoria. `intro_redes.Rmd` (HTML, theme flatly, TOC flotante) + edge list y node list de ejemplo (familias caleñas) | — |
| `2.Ejercicio_Notaria2/` | `notaria2.Rmd` (demostración del profesor) + `taller_notaria2.Rmd` (taller guiado) | — |
| `3.Taller_Inmobiliario/` | **Taller 3.** App Streamlit del Grupo B: 4 actos, comparan ER/BA/WS/Configuration | `Rodato/complejidad-taller-redes` |
| `4.Taller_Conceptos/` | **Taller 4.** 9 ejercicios técnico-conceptuales (⟨k⟩, p_k, centralidad, betweenness, clustering, vinculación preferencial). Diseño de Boris | `Rodato/complejidad-taller4-conceptos` |
| `5.Taller_Dibuja_Proceso/` | **Taller 5** "Dibuja el proceso". Next.js, **no** Streamlit | `Rodato/complejidad-taller5-redes` (privado) |
| `6.Parcial_Final/` | **Parcial final.** App Streamlit, presencial en parejas, sobre la red real completa | `Rodato/complejidad-parcial-final` |
| `programa_2026-I.md` | Programa del curso | — |

## Notas por taller

### 3.Taller_Inmobiliario — Streamlit

`streamlit_app.py` (estudiantes) + `dashboard.py` (docente, para proyectar en clase).
`lib/`: `data.py`, `network.py`, `null_models.py`, `metrics.py`, `viz.py`, `storage.py`
(Google Sheets con fallback a CSV). Dos apps en Streamlit Cloud desde el mismo repo, con
entry points distintos.

Aquí vive `complejidad-496215-c245601f03a8.json`, la llave del service account
`detective-redes@complejidad-496215` que usan **todos** los talleres. Está gitignoreada.

### 4.Taller_Conceptos — Streamlit

App en `app/` (ver su propio `CLAUDE.md`). URL: https://complejidad-taller4-conceptos.streamlit.app

**Usa una red simulada, NO la real** (`app/lib/simulacion.py:generar_red(seed=42, n_total=500)`;
el dataset del Grupo B no estaba listo). Para verificar cualquier cifra hay que ejecutar
la simulación con `seed=42` — es la verdad-base que vieron los estudiantes.

Salida esperada: N=500, L=1062, ⟨k⟩≈4.24, γ≈1.11, 23 componentes (gigante 478 = 96%),
22 aislados, C_global≈0.0373 (vs ER≈0.0087, 4.3×), broker = Banco Agrario Hipotecario
(betw. 0.2096 > Caja 0.2046 pese a menor grado, 70 vs 76).

Calificación: `Notas_Taller4.xlsx` + `build_notas.py`. Una fila por estudiante
(los compañeros heredan la nota de la entrega en equipo).

### 5.Taller_Dibuja_Proceso — Next.js

**Stack**: Next.js 16 (App Router, TS, Turbopack) + React Flow (`@xyflow/react` v12) +
D3 (`d3-force`/`d3-zoom`/`d3-selection`) + Recharts + `googleapis`.
⚠️ Next 16 tiene breaking changes — el `AGENTS.md` del repo dice leer
`node_modules/next/dist/docs/` antes de tocar. APIs de request async, route handlers sin caché.

Flujo de 3 actos en una página, tras registro con nombre/código:

1. **Explora la red real** — Notaría 2 acumulada por año, slider 1938→1944. Render: D3
   force-directed en **canvas** (`RedRealCanvas.tsx`), animado, zoom/pan/hover, flechas.
2. **Construye tu red** — editor drag-and-draw (`EditorRed.tsx`, React Flow) con
   plantillas de topología, deshacer/rehacer, renombrar. **Nodos y vínculos van
   separados**: los nodos se crean con click en el lienzo o "+Actor" (arrastrar al vacío
   ya NO crea nada); los vínculos se dibujan arrastrando de un actor a otro y la flecha
   sigue el sentido del arrastre (inicio→fin = vendedor→comprador). Implementado con
   `connectionMode={ConnectionMode.Loose}` + ambos handles `type="source"`, así el
   `fromType` es siempre `source` y la dirección nunca se invierte.
3. **Narrativa** → Google Sheets. Dashboard docente en `/docente`.

`src/lib/`: `red.ts` (métricas, `gradoEntrada`, `regimen`, plantillas), `layout.ts`
(d3-force para `GrafoMini`), `sheets.ts` (fail-closed en producción), `columnas.ts`,
`regimen-ui.ts`, `claves.ts`, `tipos.ts`.

**Datos**: `scripts/build-red-data.mjs` genera `public/data/red.json` desde
`data/consolidado_notaria2.csv` de la raíz. Re-correr con `npm run data`.
⚠️ Este `red.json` **no se regeneró** tras la ampliación de datos de jul-2026 (decisión
tomada entonces: dejar el Taller 5 como estaba).

**Borrador local**: el editor y la narrativa se autoguardan atados al código del
estudiante (`taller5-grafo:<código>`, `taller5-narrativa:<código>`; identidad en
`taller5-registro`), centralizado en `src/lib/claves.ts`. Antes era una clave global
única, así que en computadores compartidos el siguiente estudiante heredaba la red del
anterior. `EditorRed` purga el legado global al montar; "Salir" llama `limpiarBorrador(codigo)`.

**Deploy**: ⚠️ el proyecto de Vercel `complejidad-taller5-redes` **se borró el 6-oct-2026**
(limpieza del plan Hobby); el código sigue en GitHub. Para revivirlo: `vercel link` +
cargar las env vars de abajo + `vercel deploy --prod`. Antes vivía en
https://complejidad-taller5-redes.vercel.app (`/docente` = dashboard). Env vars **solo en production**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
`GOOGLE_PRIVATE_KEY` (con `\n` literales), `SHEET_ID`, `SHEET_TAB=respuestas_taller5`,
`DASHBOARD_PASSWORD`. Las de *preview* no se cargaron.

**Para calificar**: `leer_respuestas_taller5.py` (en esta carpeta, NO en el repo) jala la
pestaña con gspread y genera `respuestas_taller5.csv` + `respuestas_taller5.md` (ficha
legible por estudiante). Hay una fila "PRUEBA - borrar" del deploy que hay que ignorar.
La nota es calidad de la narrativa y el razonamiento (¿entendió que grado de entrada =
compras = acumulación de tierra? ¿su red refleja cola larga vs campana?), **no**
verificación de cifras contra una simulación.

### 6.Parcial_Final — Streamlit

Los estudiantes analizan la **red real completa** (1938–1944) y responden 11 puntos en 4
partes. Presencial, en parejas (máx. 2), enfoque mixto: cifras dadas + cifras que
obtienen con controles, con anclaje empírico obligatorio. Ver su `CLAUDE.md`.

`construir_datos.py` → `datos/red_parcial.csv` (edge list curada y dirigida). Re-correr
si cambian los datos o `alias_curados.csv`. `parcial_app.py` (estudiantes, incluye
pestaña "🔎 Explorar" con tabla ordenable y descargable) + `dashboard.py` (docente, **no
se despliega**). `lib/`: `red.py`, `viz.py`, `storage.py`, `textos.py`, `canvas.py`.

El examen pregunta **por qué** no hay brokers y por qué la red está desconectada — no
"encontrá el broker". Ver el hallazgo del "bazar fragmentado" en el `CLAUDE.md` de la raíz.

Calificación: rúbrica ponderada (p4 ×1 · p1/p5/p6 ×2 · p2/p3/p7/p8/p9/p11 ×3 · p10 ×4),
en la pestaña `notas_parcial` del Sheet. `build_notas_parcial.py` + `subir_notas_sheet.py`
están gitignoreados: **PII de estudiantes en un repo público**.

## Storage

Todos los talleres comparten **un solo spreadsheet** (`1pquFP4e-SMK1gTYJQNSz8AtV2Ce7V0MDwlPSSQhKW3c`)
y **un solo service account** (`detective-redes@complejidad-496215`), con una pestaña por
taller: `taller4`, `respuestas_taller5`, `parcial_final`, `notas_parcial`. Fue decisión
explícita, para no multiplicar credenciales.

## Estado (sep 2026)

Cosas que se rompieron o quedaron pendientes al cerrar el semestre:

- ⚠️ **`3.Taller_Inmobiliario` está roto**: `streamlit_app.py:34` lee `notaria_2.csv` de
  su propia carpeta y ese archivo se borró del repo en jul-2026 (commit `fa6ea4a`). Para
  revivirlo: copiar `data/Base de datos notaria 2.csv` de la raíz como `notaria_2.csv`, o
  apuntar `DATA_PATH` al consolidado.
- ⚠️ **Los dos `.Rmd` de `2.Ejercicio_Notaria2` no compilan**: leen
  `"Base de datos notaria 2.csv"` desde su carpeta y el archivo vive en `data/` de la
  raíz. Los `.html` ya renderizados sí están completos.
- Los repos `5.Taller_Dibuja_Proceso/taller-redes` y `6.Parcial_Final` tienen una rama
  `reorganizacion-carpetas` con el ajuste de rutas de esta reorganización, sin mergear.
- Los venvs locales se borraron para liberar disco. Recrear con
  `/opt/homebrew/bin/python3.11 -m venv .venv && .venv/bin/pip install -r requirements.txt`.
