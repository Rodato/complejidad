// Orden de columnas de la hoja de respuestas. Módulo client-safe (sin googleapis)
// para que tanto sheets.ts (servidor) como el cliente lo compartan.

import type { Respuestas } from "./tipos";

/** Cuántas partes tiene el taller (lo usa el servidor para validar borradores). */
export const N_PARTES = 6;

/** Columnas de respuesta, en el mismo orden en que aparecen en el taller. */
export const COLUMNAS_RESPUESTA = [
  // Parte 1 — El lugar de enunciación
  "p1_lugar",
  "p1_sobre",
  "p1_iniciativa",
  // Parte 2 — Actores incluidos y excluidos
  "p2_mesa",
  "p2_copias",
  "p2_cvc",
  "p2_contradiccion",
  // Parte 3 — La expansión oriental y el agua
  "p3_estudios",
  "p3_clase",
  "p3_agua",
  "p3_fuente",
  // Parte 4 — El silencio sobre el terremoto
  "p4_terremoto",
  "p4_sismico",
  "p4_certeza",
  "p4_leccion",
  "p4_responsabilidad",
  // Parte 5 — La evidencia cuantitativa
  "p5_viviendas",
  "p5_master",
  "p5_m2",
  "p5_parque",
  "p5_fuentes",
  // Parte 6 — Del suroeste al oriente
  "p6_falla",
  "p6_comparacion",
  "p6_decisiones",
  "p6_valoracion",
] as const satisfies readonly (keyof Respuestas)[];

export const COLUMNAS = ["timestamp", "nombre", "codigo", "pareja", ...COLUMNAS_RESPUESTA] as const;

export type Columna = (typeof COLUMNAS)[number];

// Pestaña aparte para los borradores en curso: una fila por código, que se sobrescribe.
// No se mezcla con las entregas finales, que son inmutables y se califican.
export const COLUMNAS_BORRADOR = [
  "codigo",
  "actualizado",
  "nombre",
  "pareja",
  "parte",
  "respuestas",
] as const;
