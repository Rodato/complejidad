// Lo que el taller toma de la carta y de las otras fuentes. Transcrito a mano del PDF
// escaneado (12-nov-2026, radicado el 13-nov) y cotejado contra la imagen. Las páginas
// son las del PDF que reciben los estudiantes: 1–6 la carta, 7–9 el certificado.
//
// Aquí no van las respuestas esperadas: están en el README, no en el navegador.

/** Ficha de la carta, para la portada y el encabezado de la parte 1. */
export const CARTA = {
  codigo: "CV-066",
  fecha: "12 de noviembre de 2026",
  radicado: "13 de noviembre de 2026",
  remite: "Camacol Valle (Cámara Colombiana de la Construcción, regional Valle)",
  destino: "Nicolás Gómez Arenas, alcalde ad hoc del Distrito de Santiago de Cali",
  asunto: "Propuesta de Camacol Valle alrededor del trámite de ajuste del POT de Cali",
};

/** Actores para las preguntas de casillas de la parte 2. El orden no delata respuestas. */
export const ACTORES = [
  { clave: "cvc", nombre: "CVC" },
  { clave: "alcalde", nombre: "Despacho del alcalde ad hoc" },
  { clave: "concejo", nombre: "Concejo de Cali" },
  { clave: "emcali", nombre: "EMCALI" },
  { clave: "dagma", nombre: "DAGMA" },
  { clave: "gobierno", nombre: "Secretaría de Gobierno" },
  { clave: "camacol", nombre: "Camacol Valle" },
  { clave: "amso", nombre: "Área Metropolitana del Suroccidente (AMSO)" },
  { clave: "ctp", nombre: "Consejo Territorial de Planeación" },
  { clave: "dapd", nombre: "Planeación (DAPD)" },
  { clave: "ministerios", nombre: "Ministerios de Vivienda y de Ambiente" },
  { clave: "comunidades", nombre: "Juntas de acción comunal o comunidades" },
] as const;

/** Quién aportó los estudios de la «expansión oriental» (parte 3). */
export const QUIEN_ESTUDIOS = [
  { clave: "cvc", nombre: "La CVC" },
  { clave: "dapd", nombre: "El DAPD, que los contrató" },
  { clave: "interesados", nombre: "«Los interesados»" },
  { clave: "emcali", nombre: "EMCALI, por su cuenta" },
  { clave: "igac", nombre: "El IGAC, de oficio" },
] as const;

/** Cuadro de la pág. 4: cómo atender la necesidad de vivienda (338.038 según el DAPD). */
export const CUADRO_VIVIENDA = {
  total: 338038,
  filas: [
    {
      suelo: "Suelo urbano (vacíos y renovación urbana)",
      acuerdo: { pct: 50, viviendas: 169019 },
      camacol: { pct: 40, viviendas: 135215 },
    },
    {
      suelo: "Suelo de expansión urbana",
      acuerdo: { pct: 32, viviendas: 108172 },
      camacol: { pct: 50, viviendas: 169019 },
    },
    {
      suelo: "Área de influencia o metropolitana",
      acuerdo: { pct: 18, viviendas: 60847 },
      camacol: { pct: 10, viviendas: 33804 },
    },
  ],
};

/**
 * Cifras de la carta, con su página. Quién produjo cada una es justo lo que pregunta la
 * parte 5, así que eso no va aquí: está en el README.
 */
export const CIFRAS = [
  { cifra: "37 %", que: "del modelo del POT de 2014 se cumplió en doce años", pag: "1" },
  { cifra: "147 mil hogares", que: "(421 mil personas) localizados irregularmente; más de 63 mil en suelo protegido y más de 10 mil en ecoparques", pag: "3" },
  { cifra: "105 mil predios", que: "marcados para la densificación", pag: "3" },
  { cifra: "17 ha al año", que: "habilitadas en la última década en renovación urbana y suelo urbano", pag: "3" },
  { cifra: "65 ha al año", que: "que supondría habilitar el modelo propuesto, «un incremento superior al 280 %»", pag: "3" },
  { cifra: "19 % y 5 %", que: "de pérdida en el peor y en el mejor escenario de los tratamientos urbanísticos", pag: "3–4" },
  { cifra: "338.038 viviendas", que: "de necesidad habitacional", pag: "4" },
  { cifra: "1.600 ha y 622 ha", que: "de suelo de expansión: propuestas y disponibles", pag: "4" },
  { cifra: "3,8 → 12,6 m²", que: "de espacio público verde por habitante, con el parque del río Cauca", pag: "4" },
  { cifra: "71 y 23", que: "decisiones que el borrador deja pendientes, y cuántas son indispensables", pag: "5" },
];

/** Cifras oficiales del terremoto que usó el Taller 1 (Alcaldía, corte 8-sep-2026). */
export const TERREMOTO = {
  fecha: "10 de agosto de 2026",
  fallecidos: "154",
  colapsos: "24",
  corte: "8 de septiembre de 2026",
};

/** Población del TREQ (pág. 15) para la cuenta del parque. */
export const POBLACION_TREQ = "2,46 millones de habitantes en 2020 (TREQ, pág. 15)";
