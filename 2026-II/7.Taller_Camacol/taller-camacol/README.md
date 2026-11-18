# Taller 6 · Quién ordena Cali

App web del sexto taller de **Introducción a la Complejidad 2026-II** (Universidad del
Valle), armado el 18-nov-2026. Es un **control de lectura** de una sola fuente: la carta
CV-066 de Camacol Valle al alcalde ad hoc Nicolás Gómez Arenas, «Propuesta de Camacol Valle
alrededor del trámite de ajuste del POT de Cali» (12-nov-2026, radicada en Planeación el
13-nov). Boris Salazar la recibió y propuso el taller y sus ejes: desde dónde se hace la carta,
quién toma la iniciativa, qué instituciones quedan por fuera (la CVC), qué pasa con el agua
al urbanizar hacia el río Cauca, el olvido del terremoto y la repetición en el oriente de lo
que pasó en el suroeste con el Cañaveralejo. Las preguntas son un borrador para que Boris las
ajuste. Como los talleres anteriores, está pensado para **celular**.

## La carta

Los estudiantes leen el PDF aparte. La app cita pasajes con su página, pero **no
reproduce la carta completa**: la carta llegó por un concejal, no está publicada y el repo es
público. El PDF vive en `2026-II/0.Insumos/camacol/`, que está gitignoreado:

- `Carta_Camacol_POT_2026-11-12.pdf` — la versión para repartir. Son 9 páginas: la carta
  (1–6) y el certificado de DocuSign (7–9). En el certificado se tacharon los nombres de
  terceros (quien creó el sobre), las direcciones, las IP, los teléfonos y la parte local de
  los correos. Los dominios quedan a la vista porque la pregunta 1.2 pide leerlos.
- `original_sin_tachar.pdf` — el que mandó Boris. No se reparte.

El tachado se hizo sobre las imágenes de 300 dpi del PDF escaneado, ubicando las cajas con
Tesseract y revisándolas a ojo.

## Las seis partes y lo que se espera

Sin retroalimentación antes de enviar, como el Taller 4 y el quiz. Las respuestas esperadas
viven aquí y no en el navegador.

| # | Pregunta | Lo que se espera |
|---|---|---|
| 1.1 | El origen de la propuesta | La reunión del **10-nov en el Club Colombia**, un club social privado, con el DAPD y «representantes del sector privado» (pág. 1). No aparecen la CVC, el DAGMA, el Concejo, el Consejo Territorial de Planeación ni las comunidades. |
| 1.2 | El certificado de firma electrónica | El sobre se creó desde una cuenta de **jaramillomora.com**, y el primer firmante (primer vicepresidente de la junta) aparece como «Jaramillo Mora Constructora». Los otros firmantes de la junta usan **solanillas.com** (presidenta) y **marval.com.co** (segundo vicepresidente). Solo la gerente usa camacolvalle.org.co. Es decir, la junta del gremio son directivos de constructoras y la carta se movió desde una de ellas. Otro dato que pueden notar: la carta está fechada el 12-nov, pero se firmó el 13-nov entre las 12:19 y las 13:38, y se radicó ese mismo día a las 14:22. |
| 1.3 | La iniciativa | La tiene el gremio: «nos permitimos presentar… las propuestas del gremio», «sugerimos como opciones concretas», «el gremio considera indispensable eliminar», «Proponemos instalar una mesa… con un horizonte de trabajo de 30 días», «Nuestro llamado estaría dirigido a que el Alcalde Ad hoc lidere…». El gremio fija la agenda, quién participa y el plazo. |
| 2.1 | La mesa técnica y jurídica (cerrada) | **alcalde, dapd, emcali, camacol**. |
| 2.2 | Los destinatarios de copia (cerrada) | **gobierno, dapd** (el secretario de Gobierno y la directora del DAPD, pág. 6). |
| 2.3 | El lugar de la CVC | No está en la mesa. Aparece como la contraparte ante la que hay que llegar con delegados de los ministerios «con capacidad suficiente de interlocución», o sea, como un obstáculo que se presiona desde Bogotá. También aparece como la que ya concertó un área de expansión a la que se le suman 500 ha (pág. 4). En la red que propone la carta, el camino del alcalde a la CVC pasa por la mesa con el gremio y por el gobierno nacional: Camacol queda como intermediario. |
| 2.4 | Dos criterios de participación | En el punto 1 la publicidad y la presencia del AMSO sirven como **vicios de procedimiento** para reabrir el trámite («preferible prevenir ahora y no discutir después ante la justicia»). En el punto 2, para decidir, propone una mesa de cuatro sin autoridades ambientales, sin Concejo y sin ciudadanía. La participación se usa como argumento jurídico, no como forma de decidir. Matiz que vale reconocer: la Ley 388 (art. 24) sí manda pedir la opinión de los gremios. Lo discutible es la forma. |
| 3.1 | El origen de los estudios técnicos (cerrada) | **interesados** («ya fueron aportados por los interesados al DAPD», pág. 4). |
| 3.2 | La reclasificación a clase IV | Las clases I–III son categoría de protección del suelo rural (Decreto 3600/2007, art. 4; Decreto 1077/2015, art. 2.2.2.2.1.3). Que el IGAC reclasifique el suelo como **clase IV le quita esa protección y permite urbanizarlo**. Y el estudio lo aportan quienes se benefician de la reclasificación: la evidencia técnica de la decisión la producen los interesados. |
| 3.3 | El abastecimiento de agua | Que averigüen que buena parte del agua de Cali se toma del río Cauca (plantas de Puerto Mallarino y Río Cauca de EMCALI) y lo citen. **Verificar** la cifra y la fuente que traigan. Implicaciones: urbanizar la llanura del Cauca, cerca de donde se toma el agua, y sin las «coronas» (es decir, antes de que estén las redes de acueducto y alcantarillado), con el riesgo de vertimientos, pérdida de zonas de inundación y de humedales. La fuente va en `p3_fuente`. |
| 4.1 | Frecuencia de términos (cerrada) | «Terremoto» o «sismo»: **0**. «Riesgo sísmico»: **1**, en la pág. 5, en el párrafo de cierre: «sin dejar a un lado la sostenibilidad ambiental y la mitigación y atención del riesgo sísmico». Si alguien cuenta «sísmico» como 1 en la primera, no penalizar fuerte. |
| 4.2 | Dos lecturas de la «lección aprendida» | Camacol: el POT de 2014 tenía problemas de financiación y viabilidad normativa y solo se cumplió el 37 %, así que hace falta más suelo de expansión y menos restricciones. Castañeda: la ciudad produjo conocimiento (microzonificación de 2005, RAC, TREQ) y no lo convirtió en intervención de las edificaciones vulnerables (art. 233 del POT de 2000, reiterado en 2014), así que los seis meses son para microzonificación y vulnerabilidad. Además, el plazo que la carta «aprovecha» lo pidió la Alcaldía **por el terremoto**. |
| 4.3 | La responsabilidad del sector constructor | Una buena respuesta separa lo que se puede afirmar de lo que no. Hay 154 fallecidos en 24 colapsos totales, más de seis por estructura, lo que apunta a edificios de alta ocupación (Acto 4 del Taller 1), y Castañeda nombra edificios de apartamentos (Ana Pilar, María Elvira Lloreda, Cantabria, Torres del Limonar). Pero el TREQ ubica el riesgo modelado en vivienda de 1–2 pisos e informal, y Castañeda le atribuye la falla al Municipio. Para sostener la tesis faltaría saber, de los edificios que fallaron, quién los construyó (y si era afiliado), en qué año, con qué norma (antes de 1984 no había código; CCCSR-84, NSR-98, NSR-10), qué curaduría los licenció, quién hizo la supervisión técnica y si se modificaron después. Se penaliza afirmar la culpa sin evidencia, y también descartarla sin mirar los edificios. |
| 5.1 | La distribución de la necesidad habitacional | **+60.847** en suelo de expansión (de 108.172 a 169.019, +56 %). Salen del suelo urbano y de renovación (−33.804) y del área metropolitana (−27.043). |
| 5.2 | El Master Plan del Oriente | **Lo central de la propuesta** (corrección de Boris, 18-nov): +500 ha sumadas al área de expansión ya concertada con la CVC, en el oriente, hacia el río Cauca, sobre suelo con la reclasificación agrológica a clase IV que aportaron los interesados (3.1–3.2), más 80 ha de control de borde en las laderas y el parque de 2.000 ha del río. La carta **no dice quién diseñaría el Master Plan ni quién lo aprobaría**, ni dónde quedan exactamente las 500 ha. Llevar la urbanización hacia el Cauca es ocupar la llanura de inundación, cerca de donde EMCALI toma el agua (3.3), y antes de que estén las redes. No se encontró en línea ningún documento público llamado «Master Plan del Oriente» (búsqueda del 18-nov). |
| 5.2 | El parque del río | 2.000 ha = 20.000.000 m² ÷ 2.460.000 hab. = **8,1 m²** (8,7 si usan 2,3 millones). El salto de la carta es de 8,8 m², así que el parque solo explica cerca del **92 %**. El parque del río es la compensación verde que acompaña la expansión: leído junto al Master Plan, hace presentable la urbanización del oriente; leído por separado, el Master Plan son 500 ha más de vivienda hacia el río. Vale preguntar si el parque es suelo que de todos modos no se puede urbanizar (ronda del río, zona inundable). |
| 5.3 | La procedencia de las cifras | **DAPD**: 37 %, 338.038 viviendas. **El gremio**: pérdidas del 19 % y el 5 % («evaluados por el gremio»), 17 ha al año («la experiencia») y 65 ha al año (su lectura del modelo). **El borrador**: 105 mil predios, 71 y 23 decisiones. **Sin fuente**: 147 mil hogares, 63 mil y 10 mil; 1.600 y 622 ha; 3,8 → 12,6 m². Lo que se puede verificar: la aritmética del cuadro y del parque, y las cifras del DAPD contra sus documentos. Los **147 mil hogares** irregulares se usan para pedir que se compense a los propietarios y se flexibilice la protección: el asentamiento informal aparece como argumento a favor del dueño del suelo. |
| 6.1 | ¿Una repetición del proceso? | Suroeste: el abanico de Cañaveralejo, urbanizado, es la microzona 4C (amplificación) y ahí se concentró el daño. Lo que averigüen sobre el río (canalización) hay que **verificarlo** contra la fuente. Oriente: el TREQ dice que los depósitos blandos son más gruesos hacia el este («cientos de metros») y que la ribera del Cauca concentra asentamientos expuestos a inundación. Lo que tendría que repetirse: expansión empujada por propietarios y promotores, estudios aportados por los interesados y el riesgo sísmico del suelo fuera de la discusión. La carta no menciona microzonificación del oriente. |
| 6.2 | La secuencia de decisiones | Ejemplo: reunión en el club → carta → retorno a concertación con presión ministerial sobre la CVC → reclasificación a clase IV → +500 ha → se eliminan las coronas (urbanizar antes de las redes) → vivienda en suelo blando e inundable. Vale más si nombran actores y no solo eventos. |

## Contexto que la app da con fuente

- **Alcalde ad hoc**: Eder se declaró impedido en octubre de 2024 por un posible conflicto de
  intereses (familiares con posibles inversiones en construcción y finca raíz). Gómez Arenas,
  designado por el decreto presidencial 1479 de 2026, se posesionó el 5-oct-2026. Fuente:
  Alcaldía, «¿Por qué Cali tiene un alcalde ad hoc?».
- **Plazo del Tribunal**: el Tribunal extendió hasta el 9-jul-2027 el plazo que difiere los
  efectos de la nulidad del Acuerdo 0373 de 2014 (antes vencía el 9-ene-2027), a pedido de la
  Alcaldía, por el terremoto. Fuente: boletín de la Alcaldía del 28-sep-2026.
- **Ley 388 de 1997, arts. 24–25**: instancias de concertación y consulta del POT.
- **Clases agrológicas**: Decreto 3600 de 2007, art. 4 (Decreto 1077 de 2015, art. 2.2.2.2.1.3).
- **TREQ (2022)**: pág. 11 (48 %), pág. 15 (2,46 millones de habitantes; depósitos más
  gruesos hacia el este), pág. 44 (OSSO 2017 sobre el cumplimiento de la norma), pág. 45
  (ribera del Cauca).
- **Castañeda**: introducción (la ciudad produjo conocimiento científico y no lo convirtió en
  intervención), secciones 2 (microzona 4C) y 9 (daños del terremoto).

## Decisiones

- **El certificado se descubre, no se explica.** La app no nombra las empresas: pide leer los
  dominios en el PDF tachado (decisión de Daniel, 18-nov).
- **La responsabilidad del gremio en el terremoto va como pregunta, no como premisa**, y se
  atribuye a «una lectura crítica de la carta» sin nombrar a nadie. Igual que con Castañeda en
  el Taller 1: hay que distinguir lo que se respalda con documentos de lo que no.
- **No nombra al concejal** que hizo llegar la carta.
- **Casillas de selección múltiple** (2.1 y 2.2): guardan las claves separadas por comas, en
  el orden de la lista (`camacol,dapd`), para que todas las respuestas sigan siendo texto.
- **Correcciones de Boris (18-nov)**: 1.2 dice «quiénes hacen parte de la Junta Directiva»;
  se quitó el recuadro «Lo que no se puede afirmar» de la Parte 1; la 5.2 pasó a ser sobre el
  Master Plan del Oriente (nueva columna `p5_master`) y el parque queda como segunda parte; en
  la Parte 6, el recuadro final se cambió por uno antes de 6.1 que pide leer lo que la carta no
  dice: las advertencias científicas sobre el Cañaveralejo y los estudios del oriente que la
  carta no cita. Los recuadros de las partes 2 a 5 siguen como estaban.
- **Registro académico (18-nov, pedido de Daniel)**: títulos nominales y enunciados formales en
  todas las partes («Dos varas» → «Dos criterios de participación», «La cadena» → «La
  secuencia de decisiones», etc.). El contenido de las preguntas no cambió.
- **Pegar está bloqueado** en las respuestas, salvo en la fuente del agua (3.3).

## Almacenamiento

Mismo spreadsheet y mismo service account de los talleres: pestaña **`taller6_camacol`**
(una fila por envío) y **`taller6_camacol_borradores`**. En desarrollo, `.env.local` apunta a
`taller6_camacol_pruebas`. No hay campos obligatorios: si faltan respuestas abiertas, la app
avisa antes de enviar.

Ojo al probar en local con credenciales: con solo registrarse ya se crea la pestaña
`…_pruebas_borradores`, porque la app busca si hay un borrador guardado. Para probar sin
tocar la hoja: `GOOGLE_PRIVATE_KEY= npx next start`. La prueba del 18-nov se hizo con
credenciales, y las dos pestañas de prueba se borraron después.

⚠️ Para probar en el celular por la red local no sirve `npm run dev`: usar
`npm run build && npx next start -H 0.0.0.0`.
