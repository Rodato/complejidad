# Taller 3 · Lo que la red cuenta

App web del tercer taller de **Introducción a la Complejidad 2026-II** (Universidad del
Valle). El objetivo es que los estudiantes **aprendan a armar relatos a partir de datos**.
Primero lo hacen con algo conocido, las ocho temporadas de Juego de tronos, donde pueden
contrastar con lo que vieron. Después repiten el ejercicio con la red de compraventas de la
Notaría Segunda de Cali (1938–1944), donde no hay serie con qué comparar.

Igual que los talleres 1 y 2, está pensada para **celular** (clases virtuales tras el
terremoto del 10 de agosto). Misma base técnica y mismo almacenamiento del Taller 2.

## Los cuatro actos

| Acto | Título | Qué produce el estudiante |
|---|---|---|
| 1 | Poniente, temporada a temporada | Recorre las 8 redes · en qué temporada hay menos personajes (T8) · qué le pasa a la red al final · la curva de **su personaje** (puesto en grado por temporada, con Tyrion de referencia) · por qué Ned sigue conectado en la T6 · **relato de Poniente, 150–250 palabras** |
| 2 | De una escritura a una red | Las seis escrituras de Francisco Caicedo B. (la reserva del Taller 2) · ¿acumula o reparte? → grado de entrada vs. salida · qué se pierde al pasar de escritura a flecha |
| 3 | Cali, año por año | Recorre 1938→1944, solo el año o acumulado · el año con más escrituras · **¿creció Cali o creció el archivo?** · el bazar (7,2 % en el grupo más grande) · quién acumula / quién reparte · las escrituras de **su actor** |
| 4 | El relato de Cali | Cifras a la mano · **relato de 250–400 palabras** con cinco piezas (lista de chequeo) · comparación entre los dos relatos |

El hilo es la definición del Acto 1: un relato con datos tiene **patrón, quiebre,
protagonistas con cifras y un límite del dato**. Hay dos límites que el taller hace tropezar
a propósito:

- **Ned Stark**: muere en la T1 y en la T6 queda 6.º en grado (23 vínculos). La razón es
  que el vínculo de Beveridge incluye «A habla de B». El dato no está mal; mide otra cosa.
- **1943**: tiene 424 de las 703 escrituras. Pero es el único año transcrito completo:
  en la base vieja tenía 66 (ver `data/consolidar.py`). Se pide no leerlo como auge.

## Cifras que estructuran el taller

Verificadas con igraph (`Rscript scripts/preparar_datos.R` las imprime). La app las
recalcula en el navegador (`src/lib/red.ts`, `src/lib/notaria.ts`).

**Juego de tronos**

| T | Personajes | Vínculos | Densidad | 1.º en grado |
|---|---:|---:|---:|---|
| 1 | 126 | 549 | 0,070 | Ned (57) |
| 2 | 129 | 486 | 0,059 | Joffrey (36) |
| 3 | 124 | 504 | 0,066 | Robb (31) |
| 4 | 172 | 667 | 0,045 | Joffrey (40) |
| 5 | 119 | 396 | 0,057 | Cersei (30) |
| 6 | 142 | 541 | 0,054 | Sansa (40) |
| 7 | 81 | 412 | 0,127 | Jon (43) |
| 8 | 74 | 553 | 0,205 | Sam (42) |

La T8 tiene la mitad de personajes y la misma cantidad de vínculos que la T1: la historia
se cierra sobre un núcleo. Daenerys es puesto 16–27 hasta la T4 (trama aislada) y 2.ª en
T7–T8. Cersei cae al 27 en la T8.

**Notaría 2** (red curada, dirigida vendedor → comprador)

- 1.235 actores, 916 flechas, 703 escrituras, 381 componentes; el más grande tiene 89
  actores (**7,2 %**). En la T8 de Poniente el grupo más grande tiene 72 de 74 personajes (97 %).
- Escrituras por año: 1938: 39 · 1939: 72 · 1940: 62 · 1941: 18 · 1942: 39 · **1943: 424** · 1944: 49.
- Más compran: Sebastián Caicedo 14 (1939: 2 · 1940: 6 · 1942: 4 · 1943: 2), Daniel Caicedo Gutiérrez 12,
  Herederos Burrowes 12. Más venden: **Municipio de Cali 42**, Colombian Holding 20,
  Susana Caicedo de Vaccari 18.

⚠️ **Diferencia con el parcial de 2026-I**: `scripts/notaria_aristas.py` usa la misma
limpieza curada (`data/limpiar_red.py` + `alias_curados.csv`), pero además quita las notas
que la transcripción dejó pegadas al nombre tras «;» y los prefijos «Acreedor:» /
«celebrado con la señora…». Sin eso el mismo actor quedaba partido en dos nodos. Por eso
el Municipio vende 42 (no 41) y hay 1.235 actores (no 1.240).

## Asignación

Cada pareja sigue **un personaje** (13: Jon, Daenerys, Cersei, Jaime, Sansa, Arya, Bran,
Sam, Theon, Davos, Brienne, Varys, Jorah; Tyrion es la referencia común) y **un actor de
Cali** (13 con más escrituras, sin el Municipio ni Sebastián Caicedo, que compara todo el
mundo). Las dos asignaciones salen del hash del código de quien registra
(`personajePara` y `actorPara` en `src/lib/contenido.ts`). No cambian entre dispositivos.

## Datos

```bash
python3 scripts/notaria_aristas.py   # necesita networkx (lo importa data/limpiar_red.py)
Rscript scripts/preparar_datos.R     # igraph, jsonlite, graphlayouts
```

- `datos/got/` — Beveridge, «Network of Thrones», redes de la serie de HBO
  (github.com/mathbeveridge/gameofthrones), **CC BY-NC-SA 4.0**. La atribución está en la app.
- `datos/notaria_aristas.csv` — sale de `data/consolidado_notaria2.csv` de la raíz del
  repo Complejidad (cuarto script que depende de esa ruta: no mover `data/`).
- `src/data/got.json`, `src/data/notaria.json` — generados. Las posiciones se calculan una
  vez (semilla 11) sobre la unión de todas las temporadas o todos los años. Así cada nodo
  está siempre en el mismo sitio y lo que cambia son los vínculos.
  - **Poniente**: stress layout de la unión con una «lupa» (distancia al centro elevada a
    0,55) para que el núcleo no quede amontonado.
  - **Cali**: layout **por bandas**. Cada componente se dibuja por separado y se empaca
    (skyline) de mayor a menor: el de 89 actores arriba y grande, los racimos medianos,
    y al final las 243 parejas sueltas. Un layout de fuerzas sobre todo junto le daba el
    mismo espacio a cada pareja que al núcleo y lo dejaba ilegible.
  - `Red.tsx` reparte las etiquetas para que no se pisen (prueba cuatro posiciones por
    nodo, por prioridad) y en modo denso usa puntas de flecha de tamaño fijo.

## Stack

Next.js 16 + Tailwind 4 + `googleapis`, copiado del Taller 2. `Red.tsx` dibuja en SVG (con
un modo denso dirigido para los 1.235 actores) y `Trayectoria.tsx` es la curva de puestos.

## Almacenamiento

Igual al Taller 2: mismo spreadsheet y mismo service account, pestaña **`taller3_relatos`**
(una fila por entrega) y **`taller3_relatos_borradores`**. Para enviar son obligatorios
`a1_relato` y `a4_relato`.

Columnas que se califican: `a1_final`, `a1_trayectoria`, **`a1_relato`**, `a2_se_pierde`,
`a3_archivo`, `a3_bazar`, `a3_actor_lectura`, **`a4_relato`**, `a4_comparacion`. Las demás
son de respuesta única. `a2_aciertos` = escrituras bien marcadas, de 6. `a4_chequeo` es la
autoevaluación del estudiante, no una nota.

Criterio para los relatos: ¿hay cifras reales del taller? ¿hay un límite del dato
nombrado (y no solo «faltan datos»)? ¿el relato de Cali evita leer 1943 como auge?
¿distingue acumular (entrada) de repartir (salida)?

⚠️ Para probar en el celular por la red local no sirve `npm run dev`: usar
`npm run build && npx next start -H 0.0.0.0`.
