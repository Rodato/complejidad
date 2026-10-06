# Introducción a la Complejidad · 2026-II

Universidad del Valle · Daniel Otero, con Boris Salazar.

Semestre marcado por el **terremoto del 10 de agosto de 2026**: las clases pasaron a ser
virtuales y no todos los estudiantes tienen computador en casa ni se conectan desde el
mismo lugar. Todo el material de este semestre se diseña **mobile-first** y para poder
trabajarse de forma asincrónica.

## Hilo conductor

Investigar la complejidad de Cali a partir del terremoto y de las fallas de la planificación
urbana entre 2000 y 2026. La entrada es un caso donde se ve, con documentos y cifras, que un
desastre no lo produce un evento natural sino la interacción lenta de decisiones humanas.

## Contenido

- `0.Insumos/` — Fuentes primarias del semestre.
  - `TREQ_D262_Riesgo_Sismico_Cali_v1.00.pdf` — Evaluación de riesgo sísmico para Santiago de
    Cali, GEM/USAID/SGC/Alcaldía, junio 2022. 79 páginas.
  - `Cali ante el espejo del terremoto.docx` (+ `.txt`) — Nota crítica de **Sergio Castañeda**
    sobre la gestión del riesgo sísmico del POT de 2000 al terremoto.
  - `perfiles_treq/` — Las 14 infografías de una página extraídas del PDF: los 13 escenarios
    sísmicos (págs. 60–72) y el perfil de mitigación y gestión del riesgo (pág. 76),
    cuantizadas para web (~390 KB cada una).
- `1.Taller_Terremoto/taller-sismo/` — **Taller 1**, app Next.js. Ver su `README.md`.
- `2.Taller_Redes/taller-redes/` — **Taller 2**, «Nodos, vínculos y poder». Redes básicas
  para las lecturas de Jackson (2010 cap. 1; 2019 cap. 2): familias florentinas → Juego de
  tronos. Misma base técnica del Taller 1. Ver su `README.md`.
- `3.Taller_Relatos/taller-relatos/` — **Taller 3**, «Lo que la red cuenta». Armar relatos a
  partir de datos: las 8 temporadas de Juego de tronos (Beveridge) → la Notaría 2 año por año,
  1938–1944. Usa el acto de las escrituras que estaba en `2.Taller_Redes/reserva_taller3/`.
  Repo `Rodato/complejidad-taller3-relatos`. Ver su `README.md`.

## Cifras de referencia (verificadas contra las fuentes)

Del **TREQ (2022)**:

- Exposición modelada: 348.000 edificaciones, 2,3 millones de habitantes, $220 billones COP.
- Más del **48 %** de los habitantes vive en estructuras de 1–2 pisos con provisiones
  sísmicas bajas.
- Riesgo anualizado de la ciudad: **8 fallecidos** y **$168 mil millones COP** por año.
- El riesgo anualizado se concentra en los **estratos 2 y 3**.
- Barrios de mayor riesgo anual: Bretaña, El Nacional, Marco Fidel Suárez, San Antonio, La Isla.

Comparación de escenarios (promedios de 2.000 simulaciones cada uno):

| Escenario | Mw | Prof. | Índice colapsos | Colapsos | Fallecidos |
|---|---:|---:|---:|---:|---:|
| Dagua–Calima (hipotético) | 6.5 | 10 km | 0,52 % | 1.800 | 1.200 |
| Placa de Nazca (hipotético) | 8.8 | 22 km | 0,39 % | 1.400 | 1.000 |
| Saliente de Buga este (hipotético) | 6.5 | 10 km | 0,21 % | 700 | 475 |
| Terremoto de 1994 | 6.8 | 12 km | 0,031 % | 108 | 74 |
| Terremoto de 1906 | 8.8 | 21 km | 0,004 % | 14 | 12 |

**La magnitud no predice el impacto.** Un Mw 6.5 cercano y superficial produce cien veces más
muertos que un Mw 8.8 lejano. Es el ejemplo de no linealidad que estructura el Taller 1.

De **Castañeda**: 2000 (POT, art. 233 §2, ordena el estudio de patología de las viviendas
antiguas «inmediatamente» después de la microzonificación) · 2002 (Convenio 02) · 2003 (se
instala la Red de Acelerógrafos) · 2004 (registra el sismo de Pizarro) · ≈2005 (se agotan los
recursos de operación de la RAC) · dic-2005 (se entrega la microzonificación; la 4C es el
abanico de Cañaveralejo) · 2014 (nuevo POT, art. 54) · 2015 («estudios *preliminares*») ·
2020-22 (TREQ) · 10-ago-2026 (terremoto; daño concentrado en Los Cámbulos, Cuarto de Legua,
Nueva Tequendama, Olímpico y sectores del Limonar).

## Convenciones

- Todo el contenido en español de Colombia.
- El texto de Castañeda se trabaja **como argumento**, no como hecho: el taller pide
  distinguir qué respalda con documentos y qué reconoce que no puede demostrar. Sin eso el
  ejercicio se vuelve político en vez de analítico.
- Anclaje empírico obligatorio en las respuestas largas (una fecha del texto y una cifra del
  TREQ). Se penaliza fuerte la respuesta genérica, como en los talleres de 2026-I.
