# Calificación 2026-II

Las notas viven en el spreadsheet del curso (el mismo donde las apps guardan las respuestas):

- «Calificar T1 · Sismo» … «Calificar T5 · Renta»: una fila por entrega, con las
  respuestas y las columnas Nota, Concepto (fórmula) y Comentario.
- «Notas 2026-II»: una fila por estudiante. La pareja hereda la nota de la entrega
  conjunta y «—» (no entregó) no cuenta en el promedio.

Las notas se corrigen ahí. El Excel se regenera desde esa hoja.

## Scripts

Todos corren con el venv de esta carpeta:
`/opt/homebrew/bin/python3.11 -m venv .venv && .venv/bin/pip install gspread google-auth openpyxl`.

- `sincronizar_notas.py`: crea o actualiza las pestañas de calificar y el resumen. Se
  puede volver a correr sin perder las notas puestas, y suma un taller apenas su pestaña
  de respuestas tiene filas.
- `volcar_respuestas.py` y `escribir_notas.py`: entrada y salida del calificador (ver abajo).
- `armar_excel.py`: genera `Notas_2026-II_talleres_<n>.xlsx`, el Excel para Boris en
  formato de examen (pregunta, respuesta, nota, desglose y comentario). Saca el desglose,
  los pesos y la clave de `propuestas/T?_notas.json`.

`propuestas/` y los `.xlsx` tienen datos de estudiantes: están en `.gitignore` y nunca se
commitean.

## Para sumar un taller (p. ej. el T5)

1. `.venv/bin/python sincronizar_notas.py`: crea «Calificar T5 · Renta».
2. `.venv/bin/python volcar_respuestas.py T5`: deja `propuestas/T5.md` con el texto
   completo de cada pregunta, los pares parecidos entre quienes no son pareja y cada
   entrega.
3. Calificar con la rúbrica de abajo. El calificador lee `propuestas/T5.md` y la app del
   taller (README, componentes con los `<Revelable>` y datos), y escribe
   `propuestas/T5_notas.json`.
4. `.venv/bin/python escribir_notas.py T5`: pasa nota y comentario a la hoja solo donde
   la Nota está vacía. Las notas puestas a mano no se pisan.
5. `.venv/bin/python armar_excel.py`.
6. Daniel sube el `.xlsx` como **nueva versión** del archivo que ya compartió en su Drive
   de Univalle (en Drive: clic derecho → Información del archivo → Administrar versiones →
   Subir nueva versión), para que el enlace no cambie. Si alguien editó notas en ese
   archivo, hay que pasarlas primero a la hoja del curso, porque la nueva versión las pisa.

## Rúbrica del calificador

Es la misma con la que se calificaron los talleres 1–4 el 2026-11-03. Así la escala queda
pareja entre talleres.

- Escala del curso: 4,5–5 Excelente · 4,0–4,4 Muy bueno · 3,0–3,9 Aceptable · 2,0–2,9
  Insuficiente · 1,0–1,9 Deficiente.
- Cada parte se califica de 0 a 5, y la nota es el promedio ponderado con 1 decimal. Los
  pesos siguen el peso que el propio taller le da a cada parte (la entrega principal pesa
  más) y son iguales para todos. En el límite entre dos conceptos se usa el valor sin
  redondear.
- Las respuestas cerradas se verifican **calculándolas** sobre los datos de la app. No se
  suponen. Cada error descuenta.
- Anclaje: una respuesta larga sin datos concretos del material, que se podría haber
  escrito sin hacer el taller, vale como máximo 2,5/5. Contradecir los datos que mostró la
  app se penaliza fuerte.
- Las respuestas parciales bajan y las que están en blanco valen 0 en ese ítem.
- Sobre-afirmar se penaliza: afirmaciones causales que el material no sostiene.
- La extensión y la fluidez no son mérito. «Posible texto generado por IA» solo se
  menciona con señales fuertes, y no baja la nota por sí solo.
- La copia entre quienes no son pareja se reporta, no se penaliza: lo decide Daniel.
- No hay cuota: 4,5 o más solo para trabajo excepcional.
- Comentario: máximo 350 caracteres, en español de Colombia, para los profesores. Dice
  qué está bien, cuál es la falla principal y en qué pregunta.
- Salida: `{"taller","pesos","clave":[…],"entregas":[{"codigo","nombre","nota","desglose","comentario"}],"alertas":[…]}`.
