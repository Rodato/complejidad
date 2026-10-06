

**Universidad del Valle**  
**Departamento de Economía**  
**Introducción a la Complejidad  2026-I**

**Boris Salazar, Docente**  
**Daniel Otero, Asistente** 

**1\. Descripción del curso**

La ciudad es la más compleja de las invenciones de las sociedades humanas. Más de un 70 % de la población de los países en desarrollo, y un 40 % de la población de los países desarrollados, vive en ciudades. La tendencia irreversible hacia la urbanización del mundo está basada en transformaciones incesantes en la economía política, la organización social, la tecnología, la producción del espacio, el poder político, la naturaleza y el comportamiento humano. Todas ellas parecen haber *ocurrido en el espacio*. En realidad, ha ocurrido lo contrario:  el espacio urbano *es* la síntesis de las interacciones entre todas esas fuerzas: *emerge* de las interacciones incesantes entre todos los elementos que lo componen. Es, en otras palabras, la red de sus interacciones. 

Por eso, en este curso estudiaremos las ciudades “como constelaciones de interacciones, comunicaciones, relaciones, flujos, y redes” (Batty 2013, 13). En particular, vamos a estudiar la *emergencia* de Cali como espacio urbano. Lo vamos a hacer como un Laboratorio de Investigación Basado en Proyectos (PBL), en el que se accede al conocimiento mediante al aprendizaje de *cómo* funcionan las cosas en el mundo real.  A diferencia de los enfoques tradicionales que estudian la complejidad de manera abstracta o puramente simulada, este curso propone un enfoque empírico basado en el aprendizaje activo  de la ciudad como un Sistema Complejo Adaptativo que emerge de las interacciones incesantes entre agentes, fenómenos y procesos reales.

El curso se centra en la reconstrucción de las redes de poder, capital, relaciones sociales y territorio que configuraron la expansión urbana de Cali entre 1900 y 1980\. Los estudiantes abandonarán el rol pasivo de receptores de conocimiento para convertirse en investigadores que construyen a partir de datos inéditos que ellas y ellos descubren. Utilizando herramientas de la Ciencia de Redes (Network Science) y de las Humanidades Digitales, los y las estudiantes rastrearán cómo las relaciones sociales entre las familias de la élite, las transacciones inmobiliarias, la circulación de capital y la construcción pública y privada de la infraestructura dieron forma física y social a la ciudad que habitamos hoy.

Desde el punto de vista metodológico el curso transita de la modelación basada en agentes hacia el Análisis de Redes Sociales (SNA) y la visualización de datos, utilizando R (paquete igraph) para el cálculo de métricas y Gephi para la representación visual de las estructuras de poder. El análisis de Redes Sociales es la bisagra que une los elementos físicos, económicos, territoriales y políticos que, en sus interacciones, conforman el espacio urbano de Cali. Los vínculos matrimoniales entre las familias de la élite caleña generaron las interacciones entre elementos físicos (el suelo), económicos (la circulación del capital y la especulación), políticos (el estado), y desencadenaron los bucles de retroalimentación positiva que han conducido a la producción de la ciudad.


**2\.  Objetivos de aprendizaje**

**Objetivo General:** Analizar y entender la emergencia de la estructura urbana de Cali y la concentración del poder económico mediante la reconstrucción y análisis de redes complejas (sociales, inmobiliarias y espaciales), utilizando herramientas computacionales y fuentes primarias de archivo.

**Objetivos Específicos:**

1. **Teóricos**: Comprender los fundamentos de la teoría de redes (nodos, aristas, centralidad, modularidad, “mundos pequeños”, leyes de escala) y su aplicación a la producción del espacio urbano. 

2. **Técnicos:** Alcanzar competencias básicas en ciencia de datos: estructuración de bases de datos relacionales, manejo del paquete igraph en R para métricas de red, y uso de Gephi para visualización.

3. **Investigativos:** Desarrollar habilidades de búsqueda en archivos históricos (notarías, cámaras de comercio, prensa) para transformar documentos cualitativos en datos cuantitativos procesables.

4. **Analíticos:** Interpretar cómo la posición de ciertos actores en una red (capital social) se traduce en captura de rentas urbanas y configuración del territorio (capital físico).

5. **Narrativos:** Descubrir y aprender a construir los relatos correspondientes a las interacciones entre agentes sociales, capitales, propiedad de la tierra, ideologías y organización estatal. 

**3\. Metodología: Aprendizaje basado en proyectos (PBL)**

El curso elimina los exámenes tradicionales. Todo el semestre gira en torno a un Gran Proyecto de Investigación dividido en tres grupos de trabajo (tracks), que operarán como equipos de consultoría histórica.

**Las Tres Trayectorias (“tracks”) de Investigación:**

* **Grupo A \- Red Social y de Élites:** Mapeo de apellidos, matrimonios, juntas directivas de organizaciones (formación de sociedades, compañías, empresas) e instituciones (Club Colombia, Club Campestre). *Objetivo: Visualizar el Capital Social.*

* **Grupo B \- Red Inmobiliaria y Financiera:** Rastreo de la propiedad de la tierra urbana y rural, contratos de compra-venta de propiedad inmueble, empresas urbanizadoras y flujo de crédito bancario. *Objetivo: Visualizar  la circulación del capital requerido para producir el espacio urbano .*

* **Grupo C \- Red Urbana y Espacial:** Evolución de la infraestructura básica (vías, acueducto, electricidad, teléfonos, internet, ferrocarriles), aparición de barrios, trazado de vías y morfología de la malla urbana. *Objetivo: Visualizar el Territorio.*

Las sesiones de clase combinarán tres modalidades:

1. **Seminarios Teóricos:** Discusión de lecturas sobre complejidad y economía urbana en la perspectiva de la emergencia del espacio urbano de Cali. 

2. **Talleres Técnicos (Tech Labs):** Instrucción guiada en R y Gephi para procesar los datos que los y las estudiantes recolectan.

3. **Salidas de Campo y Archivo:** Visitas al Archivo Histórico de Cali, Notarías y recorridos urbanos para levantamiento de información y para conocer conflictos reales por la propiedad de la tierra y por la vivienda.

**4\. Contenido  programático y  cronograma** 

El curso se estructura en cuatro fases entregables:

**Fase 1: Fundamentos y diseño (Semanas 1-4)**

* **Semana 1:** Introducción a la Complejidad y los Sistemas Urbanos. ¿Por qué Cali es un sistema complejo? Presentación del problema 1900-1980.

* Alexander (1965), Batty 2003, 2013 cap. 1\. 

* **Semana 2:** Teoría de Grafos Básica. Nodos, vínculos, dirección, peso, leyes de escala urbanas. ¿Cómo se representan la sociedad, el territorio y el capital mediante matrices? ¿Quién está relacionado con quién? ¿Quiénes hacen negocios con quiénes? ¿Quiénes están en conflicto? 

* Jackson 2010, cap. 1; Breiger 1974; Bettencourt 2007; Bettencourt 2021, cap. 3\.  

* **Semana 3:** Historia Urbana de Cali (1900-1950). De la “aldea” o “burgo” a la metrópoli. Asignación de grupos.

* Aprile-Gniset 2012; Bonilla 2012; Jacobs 1969 caps. 2 y 4; 

* **Semana 4 (Tech Lab):** Introducción a la estructura de datos. Creación de las Listas de Nodos (*Node Lists)* y Listas de vínculos (*Edge Lists*) en CSV. Primeros pasos en R.

* **Hito 1:** Definición de las preguntas de investigación por grupo y diseño de la base de datos.

**FASE 2: Arqueología de datos (Semanas 5-9)**

* **Semana 5 (Salida de Campo):** “La huella física de la élite caleña”. Recorrido por el Centro Histórico, Granada y San Fernando. Identificación de nodos espaciales.

* Aprile-Gniset 2012; Arroyo 2014, capítulo 6; Bonilla 2012\.  

* **Semana 6:** Economía Política de la Urbanización. Renta del suelo, circulación del capital y especulación.

* Sing & Moscoso 2025; Harvey 2012 cap. 2\.  

* **Semana 7 (Salida de campo)**: “El conflicto por la tierra urbana”. Visita a territorios en conflicto: Alto Menga, El Piloto, Obrero. 

* Aprile-Gniset 2017 caps. 10 y 11; Agrawall et al. 2020\.

* **Semana 8 (Investigación):** Trabajo de archivo y recolección de fuentes primarias (Notarías, Libros de registro, Estudios históricos previos).

* **Semana 9 (Tech Lab):** Limpieza de datos (Data Wrangling) en R. Cómo manejar datos faltantes y errores de digitación. Revisión de avance de las Bases de Datos (Datasets)

* **Hito 2:** Entrega de la Base de Datos Cruda (preliminar).


**FASE 3: COMPUTACIÓN Y VISUALIZACIÓN (Semanas 10-13)**

* **Semana 10 (Tech Lab):** Visualización en Gephi. Algoritmos de distribución (Force Atlas, Yifan Hu). Detectando las “formas” del poder.

* **Semana 11 (Tech Lab):** Métricas en R (igraph). Cálculo de Centralidad de Grado, Intermediación (Betweenness) y Vector Propio (Eigenvector). ¿Quiénes son los “Concentradores (Hubs)” y los “Intermediarios (Brokers)”?

* Padgett & McLean 2006; Jackson 2019, cap. 2; Londoño cap. 4

* **Semana 12:** Detección de Comunidades y Modularidad. Identificando clústeres de poder y clanes familiares corporativos.

* Padgett & McLean 2006; Sáenz 2022 cap. 3; Collins 2019\.  

* **Semana 13:** Interpretación de Resultados. Cruzando las capas: ¿Cómo se conectan los apellidos y grupos familiares (Grupo A) con las redes espaciales y la morfología urbana (Grupo C)?

* Padgett & McLean 2006; Sáenz 2022, cap. 7; Arroyo 2014 cap. 13\.  

**FASE 4: Síntesis e integración (Semanas 14-16)**

* **Semana 14:** Taller de redacción y narrativa basada en datos. Cómo contar una historia económica usando grafos.

* Aprile-Gniset 2012; Batty 2013, cap. 1; Ang 2016 caps. 2 y 3\.  

* **Semana 15:** Integración de los tres informes parciales en un modelo sistémico de la ciudad (Hito 3). 

* **Semana 16:** **Sustentación Final.** Presentación tipo simposio con visualizaciones de gran formato.

**5\. Evaluación** 

El curso valora tanto el proceso de construcción del dato como el análisis final.

* **30% \- Construcción de Base de Datos (Grupal):** Calidad, volumen y limpieza de la información recolectada en la Fase 2 y en los informes relacionados. 

* **30% \- Análisis Computacional (Grupal):** Implementación correcta del código en R y calidad de las visualizaciones en Gephi (Fase 3), informes correspondientes. 

* **40% \- Informe Final Integrado y Sustentación (Grupal \+ Nota Individual):** Documento analítico que responda a la pregunta central del curso, integrando teoría de complejidad, datos históricos, narrativa y análisis de redes

6. **BIBLIOGRAFÍA Y RECURSOS**

Agrawall, N., L. Colini, D. Kerrigan, M. Lin y L. Trujillo. 2020\.  “Con la vista puesta en las finanzas globales: Organizándose contra la especulación de la vivienda a través de estrategia dirigidas por la comunidad”. En Roy, A., R. Rolnik,  T. Graziani, y  H. Malson (eds.), *Metodologías para la Justicia de la Vivienda. Guía de Recursos*. UCLA Luskin Institute on Inequality and Democracy at the University of California, Los Angeles, pp. 116-135. 

Alexander, C. 1965\. La ciudad no es un árbol. *Boletín CF \+ S* 40: 113-129. 

Alexander, C. 1965\. A City is not a Tree. *Architectural Forum* 122(1): 58-62. 

Ang, Y. Y. 2016\. *How China Escaped the Poverty Trap*. Ithaca: Cornell University Press. 

Aprile-Gniset, J. 2012\. Cuatro Pistas para un Estudio del Espacio Urbano Caleño, en Garzón, J. B. et al. (eds.), *Historia de Cali Siglo XX. Tomo I Espacio Urbano*, Cali, Programa Editorial Universidad del Valle, pp. 25-84. 

Aprile-Gniset, J. 2017\. *Urbanización y Violencia en el Valle del Cauca*. Cali: Programa Editorial Universidad del Valle. 

Arroyo, J. H. 2014\. *Historia de las prácticas empresariales en el Valle del Cauca. Cali 1900-1940.* Cali: Universidad del Valle Programa Editorial. 

Bonilla, R. 2012\. Modelos Urbanísticos de Cali en el Siglo XX. Una visión desde la morfología urbana en Garzón, J. B. et al. (eds.), *Historia de Cali Siglo XX. Tomo I Espacio Urbano*, Cali, Programa Editorial Universidad del Valle, pp. 86-144. 

Barabási, A. L. and R. Albert. 1999\. “Emergence of Scaling in Random Networks”. Science 286: 509-512.\*

Batty, M. 2003\. The Emergence of Cities: Complexity and Urban Dynamics. London, UK: Center for Advanced Spatial Analysis, University College London. 

Batty, M. 2013*. The New Science of Cities.* Cambridge, MA: MIT Press. 

Bearson, D., Kenney, M. and Zysman, J. (2020) “Measuring the Impacts of Labor in the Platform Economy: New Work Created, Old Work Reorganized, and Value Creation Reconfigured”. Industrial and Corporate Change, 1-28\*.

Bettencourt, L. M. A., J. Lobo, D. Helbing, C. Kuhnert and G. B. West. 2007\. Growth, Innovation, scaling, and the pace of life in cities. PNAS 104(17): 7301-7306.

Bettencourt, L. M. A., H. Samaniego, H. Young. 2014\. Professional Diversity and the Productivity of Cities. *Nature Scientific Reports* 4 : 5393 DOI: 10.1038/srep05393. 

Bettencourt, L. M.A. 2015\. Cities as Complex Systems. In Furtado, B., P. A. M. Sakowski and M. Tóvolli (eds.), *Modeling complex systems for public policies*, cap. 10, pp. 217-238

Bettencourt, L. M. A: 2021*. Introduction to Urban Science. Evidence and Theory as Complex Systems*. Cambridge, MA: MIT Press. 

Bier, J. 2018\. “The simple societies of complex models”. Efflux Architecture and Representation. 

Breiger, R. L. 1974\. The Duality of Persons and Groups. *Social Forces* 53(2): 181-190.\*

Castañeda, A. F. 2017\. Encantos y peligros de la ciudad nocturna. Cali 1910-1930. Cali: Programa Editorial Universidad del Valle. 

Collins, C. D. 2019\. Formación de un sector de clase social. La burguesía azucarera en el Valle del Cauca durante los años treinta y cuarenta. En Jaramillo, E. y A. Rojas (eds.), *Pensar el Suroccidente Antropología Hecha en Colombia Tomo III,* Cali, Asociación Latinoamericana de Antropología y Universidad Icesi, pp. 575-598. 

Davis, M. 1993\. Who Killed Los Angeles? Part II: The Verdict is Given. *New Left Review* 199: 29-58. 

Granovetter, M. 1973\. “The Strength of Weak Ties”. American Journal of Sociology 78: 1360-1380\*.

Granovetter, M. (1978). “Threshold Models of Collective Behavior”. American Journal of Sociology 83 (May): 489-515. 

Guerrero, A. 2023\. Capital Financiero-Inmobiliario y urbanización periférica: formación de rentas especulativas en el macro-proyecto Ciudad Verde. *Revista Ciudades, Estados y Política* 10(3): 53-71. 

Harvey, D. 2008\. *París, capital de la modernidad*. Madrid, España: Ediciones Akal. 

Harvey, D. 2012\. Ciudades Rebeldes. Del derecho de la ciudad a la revolución urbana. Madrid, España: Ediciones Akal.

Hausmann, R., C. A. Hidalgo, S. Bustos, M. Coscia and A. Simoes. 2014\. The Atlas of Economic Complexity. Mapping paths to prosperity. Cambridge, MA: MIT Press. 

Hidalgo, C.A. & R. Hausmann. 2009\. “The building blocks of economic complexity”. *PNAS* 106(26): 10570–10575. \*

Hidalgo, C. A. 2021\. Economic Complexity Theory and Applications. Nature Reviews. Physics. \*  
https://doi.org/10.1038/ s42254-020-00275-1.  

Hidalgo, C. A. 2023\. “The policy implications of economic complexity”. *Research Policy* 52(9), 104863\. \*

Hidalgo, C. A. and  V. Stojkoski. 2025\. The Theory of Economic Complexity. https://arxiv.org/pdf/2506.18829. 

Jackson, M. O. (2010). *Social and Economic Networks*. Princeton: Princeton University Press. 

Jackson, M. O. (2019). *The Human Network. How Your Social Position Determines Your Power, Beliefs and Behaviors*. NY, NY: Pantheon Books. 

Jacobs, J. 1961\. *The Death and Life of Great American Cities*. NY, NY: Vintage Books. 

Jacobs, J. 1969\. *The Economy of Cities*. NY, NY: Vintage Books. 

Jacobs, J. 1985\. *Cities and the Wealth of Nations. Principles of Economic Life*. NY, NY: Vintage Books. 

Lefevbre, H. 1974\. *La producción del espacio*. Madrid: Capitán Swing Libros. 

Lobo, J. et al. 2020\. Urban Science: Integrated Theory from the First Cities to Sustainable Metropolises. NSF Report 113202\. 

Londoño, J. E. 2019\. *Optimismo, tesón y labor. Jorge Garcés Borrero 1899-1944*. Cali: Universidad Icesi Facultad de Derecho y Ciencias Sociales. 

Lora, E. 2020\. “La informalidad laboral con otros ojos”. Ponencia presentada para la Admisión como miembro de la Academia Colombiana de Ciencias Económicas\*.

Mosquera, G. 2012\. Vivienda Popular y Acción Estatal en Cali, Siglo XX. En: Garzón, J. B. et al. (eds.), Historia de Cali Siglo XX. Tomo I Espacio Urbano, Cali, Programa Editorial Universidad del Valle, pp. 235-251.

Padgett, J. F and P. D. McLean. 2006\. Organizational Invention and Elite Transformation: The Birth of Partnership Systems in Renaissance Florence. *American Journal of Sociology* 111(5): 1463-1568.

Sáenz, J. D. 2022\. *Élite, orden y conflicto. Sobre cómo se construyó un orden social en Cali 1910-1953*. Cali: Universidad Icesi. 

Schelling, T.S. 1969\. “Models of Segregation”. *American Economic Review* 59(2): 488-93.

Schelling, T.S. 1971\. “Dynamic Models of Segregation”. *Journal of Mathematical Sociology* 1(2): 143-186. \*

Sing, and Moscoso, A. 2025\. “Pension Funds, Tenants, and Housing Insecurity in Financialized Real Estate”, in Roy, A., T. Graziani and A. Powers (eds.), *Insurgent Ground: Land, Housing, Property.* UCLA Luskin Institute on Inequality and Democracy, pp. 63-74.

Smith, N. 2008\. *Uneven development : nature, capital, and the production of space.* Athens, GA: University of Georgia Press. 

Tooze, A. 2022\. Defining Polycrisis—From Crisis Pictures to the Crisis Matrix. Chartbook 103\. https://adamtooze.com/2022/06/24/chartbook-130-defining-polycrisis-from-crisis-pictures-to-the-crisis-matrix/. 

Tooze, A. 2025\. Conjuncture. Chartbook 384\. https://adamtooze.substack.com/p/chartbook-384-working-the-contradictory. 

Watts, D. J. (2002). “A simple model of global cascades on random networks”. *PNAS*   99(9): 5766-5771. 

Watts, D. J. (2004). *Six Degrees: The Science of a Connected Age*. NY: Norton. 

Wilensky, U. (1997a). NetLogo Segregation model.  
http://ccl.northwestern.edu/netlogo/models/Segregation. Center for Connected Learning and Computer-Based Modeling, Northwestern University, Evanston, IL.

Wilensky, U. and W. Rand (2015). An Introduction to Agent-Based Modeling: Modeling Natural, Social and Engineered Complex Systems with NetLogo. Cambridge, MA: The MIT Press.

