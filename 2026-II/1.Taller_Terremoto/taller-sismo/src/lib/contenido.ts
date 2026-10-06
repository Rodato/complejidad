// Todo el texto del taller vive aquí: definiciones, lectura y enunciados.
// Separado de los componentes para que el profesor pueda editar contenido sin tocar UI.

// ─────────────────────────────────────────────────────────────────────────────
// ACTO 1 — Riesgo = Amenaza × Exposición × Vulnerabilidad
// ─────────────────────────────────────────────────────────────────────────────

export type Factor = "amenaza" | "exposicion" | "vulnerabilidad";

export const FACTORES: { clave: Factor; nombre: string; def: string }[] = [
  {
    clave: "amenaza",
    nombre: "Amenaza",
    def: "La probabilidad de que ocurra el fenómeno y con qué intensidad llega al sitio. Incluye el suelo: un mismo sismo se siente distinto según lo que hay debajo.",
  },
  {
    clave: "exposicion",
    nombre: "Exposición",
    def: "Qué hay allí. Cuántos edificios, cuánta gente, cuánto valor económico está en el camino del fenómeno.",
  },
  {
    clave: "vulnerabilidad",
    nombre: "Vulnerabilidad",
    def: "Qué tan frágil es lo que hay. Una casa de mampostería sin refuerzo y un edificio diseñado con la norma NSR-10 responden distinto al mismo movimiento.",
  },
];

export const ENUNCIADOS_FACTOR: {
  id: string;
  texto: string;
  correcta: Factor;
  porque: string;
}[] = [
  {
    id: "f1",
    texto:
      "«Desde 1566 ha habido más de 20 terremotos que han causado importantes daños a la ciudad.»",
    correcta: "amenaza",
    porque:
      "Describe con qué frecuencia e intensidad ocurre el fenómeno. Es la parte del riesgo que no decide nadie.",
  },
  {
    id: "f2",
    texto:
      "«El modelo de exposición de Cali tiene más de 348.000 estructuras y 2 millones de ocupantes.»",
    correcta: "exposicion",
    porque: "Es el inventario de lo que está en el camino: cuánto hay y cuánta gente lo habita.",
  },
  {
    id: "f3",
    texto:
      "«Más del 48 % de los habitantes vive en estructuras de 1 a 2 pisos con un nivel de provisiones sísmicas bajas.»",
    correcta: "vulnerabilidad",
    porque:
      "No dice cuánto hay ni qué tan fuerte tiembla: dice qué tan frágil es lo construido. Ese 48 % es el resultado de décadas de decisiones.",
  },
  {
    id: "f4",
    texto:
      "«El abanico de Cañaveralejo (microzona 4C) tiene condiciones de amplificación local y parámetros de diseño particularmente exigentes.»",
    correcta: "amenaza",
    porque:
      "Ojo con esta: el suelo NO es vulnerabilidad. El mismo sismo llega con más fuerza al abanico de Cañaveralejo que a la ladera rocosa. Eso se llama efecto de sitio y forma parte de la amenaza. Por eso Cali hizo una microzonificación: para saber cómo cambia la amenaza barrio por barrio.",
  },
  {
    id: "f5",
    texto:
      "«Las comunas 19, 2, 17 y 3 concentran la mayor cantidad del valor económico expuesto de la ciudad.»",
    correcta: "exposicion",
    porque: "Es dónde está la plata: inventario, no fragilidad.",
  },
  {
    id: "f6",
    texto:
      "«Una parte importante de la ciudad se construyó antes de que existiera norma sismorresistente en Colombia.»",
    correcta: "vulnerabilidad",
    porque:
      "El año de construcción es un indicador de fragilidad: define bajo qué reglas (o sin ninguna) se levantó la estructura.",
  },
];

export const NOMBRE_FACTOR: Record<Factor, string> = {
  amenaza: "Amenaza",
  exposicion: "Exposición",
  vulnerabilidad: "Vulnerabilidad",
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTO 2 — Castañeda
// ─────────────────────────────────────────────────────────────────────────────

export type Bloque = { tipo: "h" | "p" | "cita" | "flecha"; texto: string };

export const LECTURA_CASTANEDA: Bloque[] = [
  {
    tipo: "p",
    texto:
      "La gestión del riesgo sísmico de Santiago de Cali entre el año 2000 y el terremoto del 10 de agosto de 2026 presenta una contradicción difícil de ignorar: la ciudad produjo conocimiento científico suficiente para reconocer el peligro, delimitar los sectores críticos y construir modelos avanzados de pérdidas, pero no ha demostrado haber convertido oportunamente ese conocimiento en una intervención sistemática de las edificaciones privadas más vulnerables.",
  },
  {
    tipo: "p",
    texto:
      "El problema fundamental no parece haber sido la inexistencia de información. Cali conocía su exposición sísmica. El problema fue la distancia entre conocer el riesgo y actuar materialmente sobre él.",
  },
  { tipo: "cita", texto: "El terremoto no creó esa contradicción. La hizo visible." },

  { tipo: "h", texto: "1. El POT de 2000: una obligación concreta, no una declaración retórica" },
  {
    tipo: "p",
    texto:
      "El Acuerdo 069 de 2000 incorporó la gestión del riesgo sísmico dentro del ordenamiento territorial. Su artículo 233 definió la microzonificación como la clasificación del territorio según la respuesta de los suelos a las vibraciones sísmicas y estableció como objetivos: delimitar zonas con comportamiento dinámico semejante; determinar periodos fundamentales y factores de amplificación; definir parámetros de diseño sismorresistente; programar investigaciones sobre vulnerabilidad; modelar escenarios de riesgo.",
  },
  { tipo: "p", texto: "Pero la obligación más importante apareció en el parágrafo segundo:" },
  {
    tipo: "cita",
    texto:
      "«Inmediatamente realizado el estudio de microzonificación sísmica, el alcalde deberá contratar un estudio a las viviendas construidas, antes de la vigencia de la Ley en los sectores considerados de riesgo, para determinar su patología estructural y las recomendaciones para el reforzamiento de las mismas».",
  },
  {
    tipo: "p",
    texto:
      "El mandato no se limitaba a producir otro mapa. Ordenaba pasar del suelo a la edificación; del polígono al predio; de la amenaza general a la patología estructural concreta.",
  },
  { tipo: "p", texto: "La palabra «inmediatamente» expresaba una secuencia administrativa inequívoca:" },
  {
    tipo: "flecha",
    texto: "Microzonificación → viviendas antiguas → patología → recomendaciones de reforzamiento",
  },
  {
    tipo: "p",
    texto:
      "El POT comprendió correctamente que conocer cómo se movería el suelo no salvaría por sí mismo una edificación vulnerable. La reducción del riesgo dependía de examinar aquello que ya estaba construido.",
  },

  { tipo: "h", texto: "2. El avance científico: Convenio 02 de 2002 y microzonificación" },
  {
    tipo: "p",
    texto:
      "El Convenio Interadministrativo 02 de 2002 entre el Municipio, el DAGMA e INGEOMINAS representó un avance institucional considerable. Su ejecución permitió desarrollar el estudio de microzonificación e instalar la Red de Acelerógrafos de Cali.",
  },
  {
    tipo: "p",
    texto:
      "Durante el segundo semestre de 2003 se instalaron los equipos en los lugares definidos por especialistas de INGEOMINAS. También se construyeron las casetas necesarias y se dejaron recursos para aproximadamente dieciocho meses de operación y mantenimiento.",
  },
  {
    tipo: "p",
    texto:
      "La red registró el terremoto de Pizarro de 2004 en nueve de sus estaciones. Esto demostró que Cali poseía una capacidad instrumental real para observar su respuesta sísmica.",
  },
  {
    tipo: "p",
    texto:
      "La microzonificación, terminada y entregada en diciembre de 2005, dividió la ciudad en diez zonas con comportamientos sísmicos diferentes. Entre ellas sobresalió la microzona 4C, correspondiente al abanico de Cañaveralejo, con condiciones de amplificación local y parámetros de diseño particularmente exigentes.",
  },
  {
    tipo: "p",
    texto:
      "Este resultado no significaba que todos los edificios de la 4C fueran inseguros. Significaba algo administrativamente decisivo: allí debía comenzar una evaluación prioritaria de las construcciones antiguas, de alta ocupación y con sistemas estructurales vulnerables.",
  },

  { tipo: "h", texto: "3. El primer quiebre: una red sin continuidad" },
  {
    tipo: "p",
    texto:
      "La Red de Acelerógrafos evidenció una primera debilidad de la gestión municipal: la falta de continuidad entre administraciones.",
  },
  {
    tipo: "p",
    texto:
      "La Administración que culminó en diciembre de 2003 entregó la RAC instalada, funcionando y con recursos temporales para su operación. Cuando esos recursos se agotaron, correspondía a las administraciones siguientes incorporar el mantenimiento dentro del presupuesto ordinario.",
  },
  {
    tipo: "p",
    texto:
      "Si la RAC perdió operatividad por ausencia de apropiaciones, no se trató de una falla científica, sino de una falla de política pública. Se adquirieron equipos, se construyeron casetas, se capacitó personal y se puso en marcha una red que después no habría recibido continuidad presupuestal suficiente.",
  },
  {
    tipo: "p",
    texto:
      "La prevención sísmica no puede depender del entusiasmo temporal de una administración. Una red de observación solo cumple su función cuando: opera permanentemente; recibe mantenimiento; conserva sus registros; transmite información; actualiza sus equipos; permanece articulada con el sistema geofísico nacional.",
  },
  {
    tipo: "p",
    texto:
      "La discontinuidad de la RAC es una manifestación temprana de un problema más amplio: Cali produjo proyectos valiosos, pero no siempre aseguró su sostenibilidad institucional.",
  },

  { tipo: "h", texto: "4. Diciembre de 2005: el momento en que comenzó a correr la obligación" },
  {
    tipo: "p",
    texto:
      "La entrega de la microzonificación activó el parágrafo segundo del artículo 233. Desde ese momento, el alcalde debía contratar inmediatamente el estudio de las viviendas antiguas situadas en los sectores de riesgo.",
  },
  {
    tipo: "p",
    texto:
      "La obligación no comenzó en 2014 ni en 2020. Tampoco dependía de la futura aparición de TREQ. Era exigible desde finales de 2005 o comienzos de 2006.",
  },
  {
    tipo: "p",
    texto:
      "El Municipio podía cruzar: polígonos de microzonificación; barrios y comunas; información catastral; año de construcción; número de pisos; usos; licencias; edificaciones esenciales; inmuebles de alta ocupación.",
  },
  {
    tipo: "p",
    texto:
      "No era necesario estudiar toda la ciudad simultáneamente. Podía establecerse una programación plurianual, comenzando por: construcciones anteriores a 1984; hospitales y centros de salud; colegios; edificios residenciales de alta ocupación; edificaciones con patologías visibles; inmuebles situados en las macrozonas 4C, 4A, 4B y 3; construcciones informales o modificadas.",
  },
  {
    tipo: "p",
    texto:
      "La magnitud de la tarea podía justificar una ejecución progresiva. No justificaba su aplazamiento indefinido.",
  },

  { tipo: "h", texto: "5. Del deber inmediato a los estudios preliminares de 2015" },
  {
    tipo: "p",
    texto:
      "Diez años después de la microzonificación, el Municipio celebró en julio de 2015 un convenio para desarrollar «Estudios preliminares para evaluar la vulnerabilidad y el riesgo por sismos en la zona urbana de Santiago de Cali».",
  },
  {
    tipo: "p",
    texto:
      "El trabajo fue útil: revisó metodologías, examinó información disponible, formuló un marco conceptual y propuso proyectos futuros. Sin embargo, su propia denominación revela el retraso institucional. En 2015 la ciudad todavía estaba organizando metodológicamente una obligación que el POT había ordenado iniciar inmediatamente después de la microzonificación de 2005.",
  },
  {
    tipo: "p",
    texto:
      "Los estudios preliminares no equivalieron a: visitar todas las viviendas antiguas; determinar su patología; expedir diagnósticos individuales; recomendar reforzamientos prediales; ejecutar obras.",
  },
  {
    tipo: "p",
    texto:
      "La planeación metodológica era necesaria, pero llegó tardíamente y no satisfizo por sí sola el mandato original.",
  },

  { tipo: "h", texto: "6. El POT de 2014: reiteración de una deuda pendiente" },
  {
    tipo: "p",
    texto:
      "El POT de 2014 no partió de cero. Recibió una obligación que llevaba aproximadamente nueve años de exigibilidad.",
  },
  {
    tipo: "p",
    texto:
      "Su artículo 54 estableció nuevos plazos para formular estrategias, programas y proyectos, adelantar investigaciones de vulnerabilidad, modelar escenarios y aplicar mecanismos de transferencia del riesgo. La aclaración oficial organizó los términos así: dos años para formular estrategias, programas y proyectos; cuatro años para adelantar análisis, investigaciones y modelaciones.",
  },
  {
    tipo: "p",
    texto:
      "Tomando diciembre de 2014 como referencia, las formulaciones debían estar listas aproximadamente en 2016 y las evaluaciones y modelaciones en 2018.",
  },
  {
    tipo: "p",
    texto:
      "El nuevo POT no borró el deber del artículo 233. Lo reiteró en un marco más amplio. La gestión sísmica dejó de ser solamente un encargo del ordenamiento local y pasó también a estar respaldada por la Ley 1523 de 2012, que hizo del conocimiento y la reducción del riesgo procesos permanentes y atribuyó a los alcaldes responsabilidad directa en su implementación.",
  },

  { tipo: "h", texto: "7. TREQ/GEM: un avance técnico que llegó tarde al territorio" },
  {
    tipo: "p",
    texto:
      "Entre 2020 y 2022, Cali participó en el proyecto TREQ/GEM. Este produjo un modelo avanzado que integró: amenaza sísmica; exposición; tipologías constructivas; funciones de vulnerabilidad; escenarios de daño; pérdidas económicas; población expuesta; amenazas asociadas.",
  },
  {
    tipo: "p",
    texto:
      "El modelo representó aproximadamente 348.000 edificaciones y 2,3 millones de habitantes. Para 2022, la ciudad disponía de una herramienta poderosa para establecer prioridades.",
  },
  {
    tipo: "cita",
    texto:
      "Una edificación incorporada en un modelo de exposición no es una edificación estructuralmente inspeccionada.",
  },
  {
    tipo: "p",
    texto:
      "La clasificación tipológica no determina la patología individual. Una función de fragilidad no reemplaza el análisis de columnas, vigas, muros, cimentaciones, modificaciones y materiales. Un mapa de pérdidas no constituye un diseño de reforzamiento.",
  },
  {
    tipo: "p",
    texto: "TREQ llevó a Cali hasta las puertas del predio. La obligación administrativa consistía en atravesarlas.",
  },

  { tipo: "h", texto: "8. Intervenciones puntuales, pero no cobertura general demostrada" },
  {
    tipo: "p",
    texto:
      "La revisión documental muestra que el Municipio sí contrató estudios y ejecutó reforzamientos en determinados bienes: centros de salud; Torre Alcaldía y Complejo CAM; edificio Bulevar; piscina olímpica; Unidad Ejecutora de Saneamiento Oriente; edificio Coltabaco; algunas sedes comunales; instalaciones administrativas y deportivas y colegios públicos.",
  },
  {
    tipo: "p",
    texto:
      "Estas actuaciones deben reconocerse. Sería incorrecto afirmar que Cali no realizó ningún reforzamiento.",
  },
  {
    tipo: "p",
    texto:
      "No obstante, los casos identificados son predominantemente institucionales y sectoriales. No demuestran la existencia de un programa general, continuo y cuantificado para las viviendas privadas antiguas localizadas en las áreas de riesgo.",
  },
  {
    tipo: "p",
    texto: "La ciudad puede presentar numerosos contratos de consultoría y, aun así, no responder la pregunta esencial:",
  },
  {
    tipo: "cita",
    texto:
      "¿Cuántas viviendas privadas fueron realmente identificadas, inspeccionadas, diagnosticadas y vinculadas a una medida de reducción del riesgo?",
  },

  { tipo: "h", texto: "9. El terremoto como revelación de una brecha" },
  {
    tipo: "p",
    texto:
      "El terremoto del 10 de agosto de 2026 encontró a Cali con abundante conocimiento acumulado, pero sin una prueba consolidada de intervención predial.",
  },
  {
    tipo: "p",
    texto:
      "Los reportes iniciales señalaron una concentración importante de daños en sectores relacionados con el abanico de Cañaveralejo y en barrios como: Los Cámbulos; Cuarto de Legua; Nueva Tequendama; Olímpico; sectores del Limonar; áreas próximas a la calle Quinta y la Autopista Suroriental.",
  },
  {
    tipo: "p",
    texto:
      "Entre las edificaciones reportadas figuraron los edificios Ana Pilar, María Elvira Lloreda y Cantabria, Torres del Limonar y muchas otras estructuras residenciales o comerciales.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ACTO 2 — Cronología: ¿conocer o actuar?
// ─────────────────────────────────────────────────────────────────────────────

export type TipoAccion = "conocer" | "actuar" | "ninguna";

export const OPCIONES_CRONOLOGIA: { clave: TipoAccion; nombre: string }[] = [
  { clave: "conocer", nombre: "Produjo conocimiento" },
  { clave: "actuar", nombre: "Actuó sobre las edificaciones" },
  { clave: "ninguna", nombre: "Ninguna de las dos" },
];

export const CRONOLOGIA: { id: string; anio: string; hecho: string }[] = [
  {
    id: "c1",
    anio: "2000",
    hecho:
      "El POT (Acuerdo 069), artículo 233, ordena la microzonificación sísmica y ordena que, inmediatamente después, el alcalde contrate el estudio de patología estructural de las viviendas antiguas.",
  },
  {
    id: "c2",
    anio: "2002",
    hecho: "Convenio Interadministrativo 02 entre el Municipio, el DAGMA e INGEOMINAS.",
  },
  {
    id: "c3",
    anio: "2003",
    hecho:
      "Se instala la Red de Acelerógrafos de Cali (RAC), con casetas, equipos y recursos para unos 18 meses de operación.",
  },
  {
    id: "c4",
    anio: "2004",
    hecho: "La RAC registra el terremoto de Pizarro en nueve de sus estaciones.",
  },
  {
    id: "c5",
    anio: "≈2005",
    hecho:
      "Se agotan los recursos de operación de la RAC y el mantenimiento no se incorpora al presupuesto ordinario de las administraciones siguientes.",
  },
  {
    id: "c6",
    anio: "dic. 2005",
    hecho:
      "Se entrega la microzonificación sísmica: diez zonas, con la 4C (abanico de Cañaveralejo) como la de condiciones más exigentes.",
  },
  {
    id: "c7",
    anio: "2014",
    hecho:
      "Nuevo POT, artículo 54: fija plazos de dos y cuatro años para formular estrategias y adelantar investigaciones y modelaciones.",
  },
  {
    id: "c8",
    anio: "2015",
    hecho:
      "Convenio para «Estudios preliminares para evaluar la vulnerabilidad y el riesgo por sismos en la zona urbana de Santiago de Cali».",
  },
  {
    id: "c9",
    anio: "2020–2022",
    hecho:
      "Proyecto TREQ/GEM: modelo de riesgo con 348.000 edificaciones, 2,3 millones de habitantes y 13 escenarios sísmicos.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ACTO 4 — El lazo de control
// ─────────────────────────────────────────────────────────────────────────────

export type Cumplimiento = "si" | "parcial" | "no" | "nose";

export const OPCIONES_LAZO: { clave: Cumplimiento; nombre: string }[] = [
  { clave: "si", nombre: "Sí" },
  { clave: "parcial", nombre: "Parcialmente" },
  { clave: "no", nombre: "No" },
  { clave: "nose", nombre: "No sé" },
];

export const ETAPAS_LAZO: { id: string; etapa: string; detalle: string }[] = [
  { id: "l1", etapa: "Medir la amenaza", detalle: "¿Cómo se mueve el suelo en cada parte de la ciudad?" },
  { id: "l2", etapa: "Medir la exposición", detalle: "¿Qué hay construido y quién vive ahí?" },
  {
    id: "l3",
    etapa: "Diagnosticar el predio",
    detalle: "Ir vivienda por vivienda y determinar su patología estructural concreta.",
  },
  { id: "l4", etapa: "Decidir y priorizar", detalle: "¿Cuáles se refuerzan primero y con qué criterio?" },
  { id: "l5", etapa: "Financiar", detalle: "Poner la plata: presupuesto, subsidios, créditos, incentivos." },
  { id: "l6", etapa: "Reforzar", detalle: "Ejecutar las obras sobre las estructuras vulnerables." },
  {
    id: "l7",
    etapa: "Volver a medir",
    detalle: "Comprobar que el riesgo bajó, y usar ese dato para corregir la siguiente ronda.",
  },
];
