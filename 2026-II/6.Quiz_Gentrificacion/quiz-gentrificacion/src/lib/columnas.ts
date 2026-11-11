// Orden de columnas de la hoja de respuestas. Módulo client-safe (sin googleapis)
// para que tanto sheets.ts (servidor) como el cliente lo compartan.

import type { Respuestas } from "./tipos";

/** Cuántas partes tiene el quiz (lo usa el servidor para validar borradores). */
export const N_PARTES = 5;

/** Columnas de respuesta, en el mismo orden en que aparecen en el quiz. */
export const COLUMNAS_RESPUESTA = [
  // Pregunta 1 — La doble curva
  "p1_esquina",
  "p1_curva",
  // Pregunta 2 — La ruta de la fuga
  "p2_falta",
  "p2_ruta",
  // Pregunta 3 — El desclasamiento
  "p3_caida",
  "p3_desclase",
  // Pregunta 4 — Ciudad Jardín, 1980 y hoy
  "p4_prediccion",
  // Pregunta 5 — San Antonio
  "p5_brecha",
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
