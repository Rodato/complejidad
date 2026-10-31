# Taller 5 · La renta del suelo en Cali

App web del quinto taller de **Introducción a la Complejidad 2026-II** (Universidad del
Valle), para la clase remota del 4-nov-2026. Nace del correo de Boris del 26-oct («renta del
suelo y datos»): aproximar la evolución del precio del m² de tierra y de espacio construido
en Cali con nuestra base de transacciones, sumando los datos de Johan Torres. Las preguntas
son un borrador para que Boris las ajuste. Como los talleres anteriores, está pensada para
**celular**.

Lecturas:

- David Harvey, *The Limits to Capital* (Basil Blackwell, 1982), cap. 11 «The Theory of
  Rent», págs. 330–372. El taller cita la sección VI, «The land market and fictitious
  capital» (págs. 367–369). En el PDF de 499 págs., el capítulo va de la 350 a la 392.
- Neil Smith, «Toward a Theory of Gentrification: A Back to the City Movement by Capital,
  not People», *Journal of the American Planning Association* 45(4), 1979, págs. 538–548.
- José Ignacio Uribe G. y Edgar Vásquez, «La expansión urbana y la actividad constructora en
  Cali (1970–1980)». **Solo tenemos las págs. 42–44** (introducción y tabla 1).
- Breiger (1974), «The Duality of Persons and Groups», venía en el mismo envío pero el taller
  no lo usa: ya se trabajó en el Taller 4.

Las citas en inglés están traducidas por nosotros y así se dice en cada una.

## Las siete partes

| Parte | Qué hay | Qué responde el estudiante |
|---|---|---|
| 1 | Las 269 compraventas de 1941–44, precio del m² por año | Calcular el m² de dos escrituras · ¿la mediana anual es la evolución de la renta? (Harvey, pág. 367) |
| 2 | El cono: precio contra distancia a la Plaza de Caicedo | Cuántas veces más caro el primer km · ¿hay cono? (Smith fig. 1, Harvey pág. 369) |
| 3 | Lotes contra casas por anillo | Razón casa/lote en el centro y afuera · separar suelo y casa (Smith pág. 543) |
| 4 | Quién vendía: el Municipio y sus ejidos frente a las urbanizadoras | % de ventas del Municipio · ¿quién se quedó con la renta? (Harvey pág. 368) |
| 5 | Mapa de las dos épocas y perfil de hoy por sectores | ¿Sigue el cono? · ¿dónde está la brecha de renta? (Smith pág. 545) · historia de un barrio |
| 6 | Mediana ingenua contra índice dentro de barrio, composición de 2026, IPC | El salto de 2026 · ¿se duplicó? · cambio real 2020–24 · avisos contra ventas |
| 7 | Precio = renta ÷ tasa, tabla 1 de Uribe y Vásquez | Precio del lote al 25,6 % y al 6 % · ¿renta o expectativa? |

Cada parte cierra con un recuadro «Lo que estos datos no dicen».

## Cifras que estructuran el taller

Las genera `scripts/preparar_datos.py`. La app las recalcula de `src/lib/datos.json`, así
que si se regeneran los datos, el texto y las respuestas esperadas se mueven solos.

**1941–1944** (pesos corrientes por m² de terreno)

- 269 compraventas con precio y área: 222 lotes y 47 casas con su lote; 210 ubicables.
- Mediana de los lotes: $1,26 (1941, 22 lotes) · $1,30 (1942, 95) · $1,82 (1943, 87) ·
  $2,25 (1944, 18).
- El cono, lotes: $8,05 a menos de 1 km de la plaza (26) · $1,45 de 1 a 2 km (81) · $1,20
  de 2 a 3 km (61). Razón primer/segundo anillo: 5,6.
- Casas: $16,09 a menos de 1 km (13) · $12,29 de 1 a 2 km (16). Razón casa/lote: 2,0 en
  el centro, 8,5 de 1 a 2 km.
- La casa de la Plaza de Caicedo (14-feb-1944): $129.019 por 586,45 m² = **$220 por m²**,
  la más cara. El lote ejido de Octavio Rico en el barrio Obrero (14-ene-1942): $1,80.
- **El Municipio de Cali hace 85 de las 269 ventas (31,6 %)**, ejidos con mediana de $0,95
  por m², contra $2,25 de los 137 lotes de particulares. En 16 se dice que el comprador
  era arrendatario del lote.

**2020–2024** (avisos de Johan, pesos corrientes por m² construido)

- 5.682 avisos, 5.668 sin duplicados, 4.815 de 2020–24. Mediana: $2,46 millones.
- Por sector y distancia: el **sur** sube de $1,8 M (0–2 km) a $3,4 M (10–14 km); el
  **oriente** se queda entre $1,4 y $2,1 M; el **occidente** cercano está en $3,9 M.
- Índice dentro de barrio y tipo (2020 = 100): 105,7 · 114,8 · 121,6 · **130,2** (2024) ·
  171,1 (2026). IPC dic-2020 a dic-2024: +37,4 % → cambio real **−5,2 %**.
- Mediana tal cual de las casas: 2024 $1,875 M → 2026 $3,80 M, **+103 %**, porque en 2026 el
  68 % de los avisos viene de las comunas 17, 2 y 22.

## Decisiones de datos

- **Fuentes del 40.** La extracción del ACH (`investigacion/ACH/…/transacciones_ach.csv`,
  solo escrituras completas) más las escrituras del consolidado de 1942–44 que el ACH no
  trae. Se cruzan por año + número de escritura y, en 1944 (sin número), por año + precio.
  El ACH no está fusionado en `data/`; este script hace su propio cruce.
- **Qué se excluye.** Retroventas (eran préstamos con la casa en garantía), promesas,
  hipotecas, ventas de una parte del predio (mitades, cuotas, derechos) y áreas de menos
  de 20 m². Ojo: «cuotas» y «%» a secas son plazos e intereses, no ventas parciales.
- **Las ventas del Municipio cuentan como lote** aunque el lote tenga casa: la casa es
  mejora del arrendatario que compra, y el precio no la incluye. Sin esta regla, El
  Cascajero mostraba «casas» a $0,36 por m².
- **Ubicación.** Cada escritura va al centro de su barrio de hoy (mediana de las
  coordenadas de los avisos de Johan en ese barrio). La tabla `PUENTE` del script traduce
  los nombres viejos: El Cascajero → Saavedra Galindo, El Matadero → Belalcázar, El Pueblo
  → Santander, Loma de la Cruz → San Antonio, La Chanca → Navarro - La Chanca (la de la
  comuna 3, no el corregimiento de Navarro). Vilachí y El Sindicato quedan sin ubicar.
- **Johan.** 2025 no viene y 2026 es otra muestra (solo casas y campestres, cargadas al
  sur y al oeste). Por eso 2020–24 es la referencia y 2026 solo aparece en la parte 6.
  El índice dentro de barrio es una regresión con efectos fijos barrio × tipo y dummies de
  año sobre el log del precio por m².
- **No se deflacta entre épocas.** Se compara la posición relativa: cada lugar dividido
  por la mediana de la ciudad en su época.

## Datos de terceros

La base de Johan Torres (`2026-II/0.Insumos/johan_torres/`) **no se versiona**: es de su
trabajo de grado. El repo solo lleva los agregados de `datos.json` (medianas por cuadro de
~550 m, por anillo y por barrio), no los avisos. Para regenerar hace falta tener esa carpeta
y la de `investigacion/ACH` en local:

```bash
/opt/homebrew/bin/python3.11 "2026-II/5.Taller_Renta/taller-renta/scripts/preparar_datos.py"
```

## Almacenamiento

Igual que los talleres anteriores: mismo spreadsheet y mismo service account, pestaña
**`taller5_renta`** (una fila por envío) y **`taller5_renta_borradores`**. En desarrollo,
`.env.local` apunta a `taller5_renta_pruebas`. No hay campos obligatorios: si faltan
respuestas principales, la app avisa antes de enviar. Pegar texto está bloqueado.

⚠️ Para probar en el celular por la red local no sirve `npm run dev`: usar
`npm run build && npx next start -H 0.0.0.0`.
