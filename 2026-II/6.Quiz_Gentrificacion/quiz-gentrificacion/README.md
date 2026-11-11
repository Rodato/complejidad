# Quiz · Renta, gentrificación y segregación

App web del quiz de **Introducción a la Complejidad 2026-II** (Universidad del Valle),
armado el 11-nov-2026. Son cinco preguntas sencillas que aplican dos lecturas a nuestros
datos: las escrituras de la Notaría 2 (1941–44) y los avisos de venta de 2020–24. Como los
talleres anteriores, está pensado para **celular**. Las preguntas son un borrador para que
Boris las ajuste.

Lecturas:

- Gilma Mosquera Torres y Jacques Aprile-Gniset, «Notas sobre el proceso de segregación
  social en el espacio urbano» (1980), págs. 67–95. El quiz usa las págs. 70–72 (la doble
  curva de precios), 89–91 (el ciclo de atracción y expulsión) y la nota 5, págs. 94–95 (la
  «ley de fuga» de la élite caleña y la predicción sobre Ciudad Jardín).
- Neil Smith, «Toward a Theory of Gentrification: A Back to the City Movement by Capital,
  not People», *Journal of the American Planning Association* 45(4), 1979, págs. 538–548.
  El quiz usa la pág. 540 (producción contra preferencia del consumidor), 545–546 (la brecha
  de renta) y la nota 1 (definición de gentrificación). El Taller 5 ya había usado las
  págs. 541–543 y la figura 1.

Las citas de Smith están traducidas por nosotros y así se dice en cada una.

## Las cinco preguntas y lo que se espera

| # | Texto → dato | Respuesta cerrada | Lo que se espera en la abierta |
|---|---|---|---|
| 1 | La doble curva (M&A 70–72) → lotes por distancia a la plaza y lotes «de esquina» | Esquina/resto: **1,33** ($2,00 contra $1,50) | La curva urbana se sostiene (lote a <1 km: $8,05; de 1 a 2 km: $1,45). La de la esquina no se puede afirmar: son 6 lotes en barrios distintos (El Sindicato, El Cascajero, La Chanca, La Alameda y dos sin barrio), así que la comparación mezcla esquina y ubicación. |
| 2 | Nota 5 (La Merced → El Peñón y Centenario) y el ciclo (89–90) → compraventas en La Merced, Centenario, Granada y Versalles | **El Peñón** no aparece | José Garcés Mercado vende en La Merced (1942, $30/m²); Susana Caicedo de Vaccari compra tres predios en Granada y Versalles (1943); Carlos Caicedo P. y Joaquín Borrero Sinisterra compran en Granada. Los lotes de Centenario y Granada valen $10–12/m², 7–8 veces la mediana: fase 1, el bastión nuevo con exclusividad por precios. Granada y Versalles, vecinos de Centenario, no están en la nota. |
| 3 | Desclasamiento (M&A 91) → posición 1941–44 contra 2020–24 | Granada: 7,12 ÷ 0,72 = **9,9** veces | Centenario, Granada y Versalles caen a la mediana o por debajo; de los que eran caros, Juanambú es el que mejor se sostiene (5,42 → 1,57), y San Fernando, que no era bastión, casi no se mueve (1,33 → 1,10). Ciudad Jardín está hoy en 2,11. La cuenta compara lote (tierra) en 1941–44 con vivienda construida hoy, y pocos lotes por barrio. |
| 4 | Pág. 95 (Ciudad Jardín) + Smith 540 → m² de apartamento por grupo y vivienda nueva | — | En precios no se cumplió: Ciudad Jardín y Pance siguen siendo lo más caro ($4,9 M/m² contra $4,4 M en Normandía), y el que pierde contra la inflación es Normandía (−19 % real 2022–24). Sí se cumplió la densificación: el 21 % de los avisos de la comuna 22 es vivienda nueva, contra el 4 % de la ciudad. La historia de la pág. 95 es de capital: parceladores, lotes de engorde, Planeación y crédito UPAC, justo los actores que Smith pide incluir. |
| 5 | Brecha de renta (Smith 545–546) → San Antonio en 1942 y hoy | — | Encaja en parte: está pegado al centro, pasó de lotes ejidos (posición 0,62) a la mediana de la ciudad (0,99), y sus avisos son casas usadas, no torres nuevas: rehabilitación, como define Smith. Falta la renta potencial (y la renta capitalizada de antes del alza) para medir la brecha, y saber quién compra. |

## Cifras que estructuran el quiz

Las genera `scripts/preparar_datos.py` en `src/lib/datos.json`; la app lee de ahí, así que
si se regeneran, el texto se mueve solo.

- **1941–44**: 268 compraventas (221 lotes) de las 269 del Taller 5. Se quita una escritura
  duplicada: la id 140 (Martínez → Caicedo de Vaccari, 1.233 m², $14.000, 4-feb-1943,
  «Versalles») repite la id 134 (26-ene-1943, «barrio Granada (antiguamente Versalles)»).
  Se cuenta una vez, en Granada. Mediana de los lotes: $1,50.
- **2020–24**: 4.815 avisos de casas y apartamentos (sin duplicados, sin 2026, sin
  campestres). Mediana: $2,46 M por m².
- **Posición** = precio del m² del barrio ÷ mediana de la ciudad en su época. No se
  deflacta entre épocas.
- La pregunta 4 usa los agregados de `2026-II/graficos/segregacion_precios/` (la gráfica que
  pidió Boris el 11-nov): m² de apartamento 2022–23 y cambio real por grupo, con el índice
  ajustado por barrio y tipo. Ciudad Jardín y Pance solo tienen 2022–23.

## Decisiones

- **Sin retroalimentación antes de enviar**, como el Taller 4 (también control de lectura):
  ni veredictos en los cálculos ni «Ver comentario».
- **No nombra a quien aportó la base de avisos**, igual que el Taller 5 (commit 6ac5f9e).
- Las compraventas se muestran en tarjetas y no en tabla: con nombres largos, una tabla de
  cuatro columnas no cabe en el celular.
- Los nombres de las escrituras van sin cédulas ni notas entre paréntesis o corchetes.

## Regenerar los datos

Necesita la base de avisos en `2026-II/0.Insumos/johan_torres/` (no se versiona):

```bash
/opt/homebrew/bin/python3.11 "2026-II/6.Quiz_Gentrificacion/quiz-gentrificacion/scripts/preparar_datos.py"
```

## Almacenamiento

Mismo spreadsheet y mismo service account de los talleres: pestaña **`quiz_gentrificacion`**
(una fila por envío) y **`quiz_gentrificacion_borradores`**. En desarrollo, `.env.local`
apunta a `quiz_gentrificacion_pruebas`. No hay campos obligatorios: si faltan respuestas
abiertas, la app avisa antes de enviar. Pegar texto está bloqueado.

⚠️ Para probar en el celular por la red local no sirve `npm run dev`: usar
`npm run build && npx next start -H 0.0.0.0`.
