# Taller 4 · La burguesía azucarera en red

App web del cuarto taller de **Introducción a la Complejidad 2026-II** (Universidad del
Valle). Es un **control de lectura** en clase (21-oct-2026) sobre dos textos:

- Charles David Collins, «Formación de un sector de clase social. La burguesía azucarera en
  el Valle del Cauca durante los años treinta y cuarenta», en *Pensar el suroccidente*,
  tomo III (Icesi, 2019), págs. 575–630. Antes en *Historia y Espacio* 3(9), 1983.
  Acceso abierto: https://doi.org/10.18046/EUI/ee.4.2019
- Philip Wright, «El papel del Estado y las políticas de acumulación de capital en
  Colombia», *Cuadernos de Economía*, págs. 41–67. Traducción de *Development and Change*
  11 (1980): 229–255.

Las preguntas son las de Boris Salazar. La 2 aclara qué red se usa, la 4 corrige la
atribución de la cita de Wright, la 5 extiende la lectura hasta la pág. 617 y la 6 (que
Boris agregó el 21-oct) pregunta por la clase que no aparece en Collins. Igual que los
talleres anteriores, está pensada para **celular**.

## Las seis partes

| Parte | Qué hay | Qué responde el estudiante |
|---|---|---|
| 1 | Esquema 1 (pág. 583) como red bipartita: 4 grupos, 11 ingenios | Grupo de mayor grado · de mayor intermediación · por qué no coinciden · quiénes son los Salcedo |
| 2 | Cuadro 7 (pág. 585) como matriz tocable + tres redes (grupos, grupos y empresas, personas) | Clusters y los «15 cruces» · trayectorias por A, C, F y B · obras públicas · Cali |
| 3 | Matrimonios con IA | Pregunta hecha a la IA · lista de matrimonios con fuente y verificación · qué inventó la IA |
| 4 | Wright (págs. 59–60) y cómo lo cita Collins (pág. 598) | ¿Pasó lo mismo con los azucareros del Valle? |
| 5 | Caicedo en 1933 (págs. 611–613) y en 1945 (pág. 617) · cuadros 13 (pág. 619) y 15 (pág. 622) | ¿Son coherentes sus análisis? · ¿muestra el cuadro 13 baja rentabilidad, si la producción se triplicó? · ¿por qué tantas importaciones en 1958 y 1960? |
| 6 | La cita de «lucha de clases» (pág. 627) | ¿Con qué clase se enfrentó la burguesía azucarera? · contraste con Aprile-Gniset, «Cuatro pistas para el estudio del espacio urbano caleño» |

## El cuadro 7 es una matriz de afiliación

Observación de Boris: no es una matriz de adyacencia. Las filas son 25 accionistas o
directivos (A1–H2, agrupados por la letra del ingenio) y las columnas son 21 empresas de
**fuera** del azúcar (A–U). La misma letra significa cosas distintas en filas y columnas
(fila A = Manuelita, columna A = navegación por el río Cauca). Para medir hay que proyectar
(Breiger 1974): la app ofrece las tres redes y en las preguntas «grupo» es siempre la fila.

## Cifras que estructuran el taller

Verificadas con igraph (`betweenness(normalized = FALSE, weights = NA)`). La app las recalcula
en el navegador (`src/lib/red.ts`). «Caminos» = caminos más cortos entre otros pares que pasan
por el nodo, contados enteros. La intermediación los reparte cuando hay empates.

**Esquema 1** (15 nodos, 16 vínculos)

| Nodo | Grado | Intermediación | Caminos |
|---|---:|---:|---:|
| Ingenio Providencia | 4 | 65 | 83 |
| Eder | 4 | 36 | 42 |
| Caicedo | 4 | 36 | 42 |
| Salcedo | **5** | 34,5 | 48 |
| Cabal-Becerra | 3 | 9,5 | 19 |

El de mayor grado (Salcedo) no es el de mayor intermediación (Eder y Caicedo, empatados).
Con el conteo entero, Salcedo sí supera a Eder y Caicedo.

**Cuadro 7, red de grupos** (8 nodos, 12 vínculos, 28 pares, 33 caminos más cortos):
B (Providencia) grado 7, intermediación 13,5, **16 caminos** · C 5 · 2,5 · **5** ·
A 3 · 0 · **0** · F 1 · 0 · **0**. El resto, 0.

**Grupos y empresas** (29 nodos, 39 vínculos): B 265,1 · C 78,0 · A 67,6 · empresa J
(Galerías de Palmira) 52 · empresa U (carretera al mar) 49,5 · P y Q 35,2 · F 27.

**Personas** (25 nodos, 53 vínculos): C1 Hernando Caicedo 132,3 · B3 Alfonso Cabal
Madriñán 101 · C4 Jaime H. Caicedo 95 · B6 Gustavo Lloreda 47,7.

Los cruces que Collins llama «15» (pág. 591): contando las ✕ de cada uno de los tres bloques
(Manuelita en A–F, Cabal-Becerra en G–O, Caicedo en P–U) fuera de su bloque salen **14**.
Darían 15 si se marcara a Gustavo Lloreda en la carretera al mar, como dice el texto.

## Errores del capítulo de Collins (útiles al calificar)

- La bibliografía atribuye el artículo de 1980 a Erik Olin Wright; es de Philip Wright.
- La cita de las asociaciones aparece como «Wright 1980: 255», pero en la traducción está en
  la página siguiente a la de la cita «244».
- Dice «cuadro 8» por el 7, y «cuadro 14» por el 15 (producción).
- Dice que el cuadro 7 va «entre 1980 y 1961»; el título dice 1890–1961.
- Pichichí: «1914» en el texto, 1941 en el cuadro 1.
- Los Cabal «con cuatro ingenios» (pág. 595); el esquema 1 les pone tres.
- La matriz pone las empresas B y C en la fila de Harold H. Eder (A5); el texto nombra a Henry.
- Cita el cuadro 13 como prueba de la «poca rentabilidad» (pág. 617). El cuadro no la muestra
  con claridad: la utilidad sobre patrimonio va de 4,5 % a 7,9 % y el número de sociedades
  que reportan cambia cada año (de 16 en 1950 a 6 en 1955), así que los totales no se
  comparan entre años.
- Los trabajadores sí aparecen, pero solo como «inseguridad social» vista por los dueños y
  las autoridades (págs. 606–609: sindicatos de 1934, conflictos en la Manuelita, incendios
  de caña de 1946). La pregunta 6 lo dice así y no «no aparecen».

## Datos

Todo está en `src/lib/collins.ts`, transcrito a mano y cotejado celda por celda contra el
PDF: el esquema 1, las 25 filas del cuadro 7 con sus marcas (60 ✕), la ficha de cada
empresa (págs. 587–591) y los cuadros 13 y 15 (este último solo producción e importación,
1946–1961).

## Almacenamiento

Igual que los talleres 2 y 3: mismo spreadsheet y mismo service account, pestaña
**`taller4_azucar`** (una fila por envío) y **`taller4_azucar_borradores`**. En
desarrollo, `.env.local` apunta a `taller4_azucar_pruebas`. No hay campos obligatorios:
si faltan respuestas principales, la app avisa antes de enviar. `p3_enlaces` es JSON (los
matrimonios, cada uno con fuente y resultado de la verificación).

Pegar texto está bloqueado en las respuestas, salvo la pregunta a la IA y las fuentes de
la parte 3.

⚠️ Para probar en el celular por la red local no sirve `npm run dev`: usar
`npm run build && npx next start -H 0.0.0.0`.
