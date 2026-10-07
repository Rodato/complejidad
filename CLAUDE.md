# Introducción a la Complejidad — Universidad del Valle

Carpeta de trabajo de Daniel Otero (con **Boris Salazar**) para el curso y la
investigación asociada. **No es una sola aplicación**: son tres cuerpos de trabajo que
comparten datos. Antes de tocar una subcarpeta, revisar si tiene su propio `CLAUDE.md`,
`AGENTS.md` o `README.md` — mandan sobre este archivo.

```
Complejidad/
├── data/            ← Notaría 2 consolidada. Compartida por todo. NO mover de la raíz.
├── 2026-I/          ← semestre terminado (feb–jul 2026). Archivo.
├── 2026-II/         ← semestre ACTIVO. Ver 2026-II/README.md.
└── investigacion/   ← ACH y Paper_PPE. No son material de curso.
```

## Convenciones generales

- Todo en **español de Colombia**.
- Python: `/opt/homebrew/bin/python3.11`. Nunca venvs con el 3.9 del sistema.
- Código R comentado en español; los nombres de función quedan en inglés (son sintaxis).
- No borrar outputs existentes salvo instrucción explícita.
- Buscar con `rg`.

---

## `data/` — Notaría 2 de Cali (1938–1944)

El dataset que alimenta casi todo. **Vive en la raíz a propósito**: tres scripts en
distintas carpetas lo referencian por ruta relativa (`construir_datos.py` del parcial,
`build-red-data.mjs` del Taller 5, `candidatos_alias.py` del ACH). Moverlo los rompe.

- `consolidado_notaria2.csv` — **724 registros, 1938–1944, serie completa**. Columnas:
  `fuente, anio, fecha, vendedor, comprador, valor_texto, valor_num, area, negocio, escritura`.
- `consolidar.py` — une 1938–41 (CSV viejo, **excluye 1943**) + `1942.xlsx` + `1943.xlsx`
  (tabla completa, ~442 registros, reemplaza los 66 viejos) + `Base de datos 1944.xlsx`,
  en esquema superset. Normaliza `valor_num` (US `$1,795.33` vs europeo `3.360,00`).
  Correr: `python3 consolidar.py`.
- `limpiar_red.py` + `alias_curados.csv` — depuración de la red. Modos
  `raw/moderada/afondo/curada`; `--comparar` imprime la tabla. **Se usa `curada`** =
  moderada (normaliza, quita apoderados, separa co-partes) + la tabla de alias curada a
  mano (~28 merges, bancos separados). La fuzzy automática (`afondo`) se descartó por
  sobre-fusionar. Para agregar un alias: una línea `variante,canonico` en el CSV.
- `Base de datos notaria 2.csv` — transcripción original 1938–43. De aquí ya solo se
  usan 1938–41; la consume `consolidar.py`.

**Concepto que atraviesa todo el curso**: los vínculos son **dirigidos
vendedor→comprador** (la tierra fluye al comprador), y la métrica central es el **grado
de entrada = compras = acumulación de tierra**, no el grado total ni el dinero.

---

## `2026-II/` — semestre activo

Ver `2026-II/README.md`, que está al día y tiene las cifras verificadas contra las
fuentes. En resumen: semestre **virtual tras el terremoto del 10-ago-2026**, material
**mobile-first** y asincrónico porque no todos los estudiantes tienen computador. El
hilo conductor es la complejidad de Cali vista desde las fallas de planificación urbana
2000–2026.

- `0.Insumos/` — TREQ (evaluación de riesgo sísmico, GEM/USAID/SGC, 2022) + nota de
  Sergio Castañeda + las 14 infografías extraídas del PDF.
- `1.Taller_Terremoto/taller-sismo/` — **Taller 1**, Next.js. Desplegado. `node_modules` y `.next` se borraron
  para liberar disco: correr `npm install` antes del próximo `npm run dev`.

---

## `investigacion/` — no es material de curso

### `investigacion/ACH/` — captura del Archivo Histórico de Cali

Ver `investigacion/ACH/README.md`, que está al día. Tomos escaneados del protocolo de
la Notaría 2 (escrituras **manuscritas en cursiva**, 1941–1944) → páginas JPEG
(pdftoppm 150 dpi) → **Claude Opus 5 con visión directa** vía OpenRouter → CSV.

- Script principal: `scripts/extraer_transacciones.py` (`--modo imagen` por defecto).
  Idempotente, stdlib puro + `pdftoppm`. Salida: `outputs/transacciones/transacciones_ach.csv`,
  esquema compatible con `data/consolidado_notaria2.csv`.
- **Corrida completa hecha (sep-2026)**: 50 tomos, 3.634 págs. únicas, **US$90.74** en 36
  minutos. 870 filas = 608 escrituras completas + 262 encabezados sin cuerpo (esos
  auditan qué se saltó el escaneo del AHC).
- **`OPENROUTER_API_KEY` se comparte con Paper_PPE**: `ocr_mistral.py` busca
  `ACH/.env` y luego `Paper_PPE/.env`. Si separás las carpetas, hay que separar la key.
- Campo más frágil: **`ubicacion`** (calles y carreras manuscritas). **Pendiente**:
  no es confiable para georreferenciar; requiere verificación contra la imagen.
  Regla general: revisar filas con confianza < 0.85 o con variantes en `observaciones`.
- El chunk (28 págs., traslape 8) es la palanca de costo, **no** el modelo: bajar de
  Opus degrada números de casa y kilómetros en `ubicacion`.

### `investigacion/Paper_PPE/` — paper sobre Planes Parciales de Expansión

Ver `investigacion/Paper_PPE/CLAUDE.md` (detallado y al día) y
`origen_del_proyecto.md` (el correo de Boris que originó el proyecto y el objetivo
analítico).

**Hallazgo central**: los decretos no son actos finales sino **bitácoras cronológicas
del trámite** — cada considerando `Que…` es un evento fechado de negociación entre
propietarios/fiduciarias/constructoras y agencias (DAPM, CVC, DAGMA, EMCALI, curadurías).

Pipeline: OCR Mistral → segmentación por considerando → extracción de eventos con LLM →
**consenso multi-modelo** (flash + minimax, árbitro `claude-sonnet-4.6`) → análisis →
reporte. Cero dependencias externas. Estado: 11 documentos, `outputs/events/eventos_consenso.csv`
con **1.277 eventos, 9 planes, 0 alucinaciones**. Falta el gold set de validación humana.

**Dos reportes que no hay que confundir**: `outputs/memo/informe_hallazgos_negociacion_ppe.{md,docx,tex}`
(narrativa pura, el `.tex` se compila en Overleaf) vs.
`outputs/memo/reconstruccion_negociacion_ppe_consenso.pdf` (narrativa + gráficas, motor
de PDF propio — **este es el que se envía**). El archivo sin el sufijo `_consenso` es un
artefacto viejo de jun-2026 que ya no se regenera.

Tono de los correos a Boris: informal, primera persona singular, **sin negrillas markdown**.

---

## `2026-I/` — semestre archivado

Ver `2026-I/README.md` para el detalle de cada taller, sus repos y sus pendientes.
Lo que importa saber desde aquí:

- Tres grupos de estudiantes: **A** (red social), **B** (red inmobiliaria), **C** (red espacial).
- Ejemplo continuo: familias Garcés, Caicedo, Borrero, Zawadsky, Lloreda.
- **Hallazgo que estructura el parcial — "bazar fragmentado"**: la red real, a diferencia
  de la simulada del Taller 4, tiene clustering≈0, **betweenness≈0 (casi sin brokers)**,
  componente gigante ≤6%, 80% de los actores en un solo trato; pero fuerte concentración
  en la compra (cola larga, CV≈1.28). Protagonistas: Sebastián Caicedo (compra 13/vende 9),
  **Municipio de Cali** (vende 41, compra 8 — la ciudad como gran distribuidor de suelo),
  Sucesión Lourido / Colombian Holding / Royal Bank (liquidadores).
- La heurística de régimen (CV de grados: campana ≈ azar vs cola larga ≈ vinculación
  preferencial) es **intuición visual, NO una prueba estadística** de ley de potencia.
  Cuidado con sobre-afirmar en los textos de cara a estudiantes.
- **Escala de concepto** en las notas: 4.5–5 Excelente · 4.0–4.4 Muy bueno · 3.0–3.9
  Aceptable · 2.0–2.9 Insuficiente · 1.0–1.9 Deficiente. Se penaliza fuerte la falta de
  anclaje empírico (respuestas genéricas que contradicen los datos mostrados).
- **PII de estudiantes**: los scripts y Excel de calificación están gitignoreados en los
  repos públicos. Verificado: nunca entraron a la historia. No commitear notas.
