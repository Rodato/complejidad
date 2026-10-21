// Orden de columnas de la hoja de respuestas. Módulo client-safe (sin googleapis)
// para que tanto sheets.ts (servidor) como el cliente lo compartan.

import type { Respuestas } from "./tipos";

/** Cuántas partes tiene el taller (lo usa el servidor para validar borradores). */
export const N_PARTES = 6;

/** Columnas de respuesta, en el mismo orden en que aparecen en el taller. */
export const COLUMNAS_RESPUESTA = [
  // Parte 1 — Esquema 1
  "p1_grado",
  "p1_intermediacion",
  "p1_contraste",
  "p1_salcedo",
  // Parte 2 — Cuadro 7
  "p2_clusters",
  "p2_cruces",
  "p2_tray_a",
  "p2_tray_c",
  "p2_tray_f",
  "p2_tray_b",
  "p2_tray_lectura",
  "p2_obras",
  "p2_cali",
  // Parte 3 — Parentescos con IA
  "p3_pregunta_ia",
  "p3_enlaces",
  "p3_fallas_ia",
  // Parte 4 — Wright
  "p4_valle",
  // Parte 5 — Caicedo
  "p5_caicedo",
  "p5_produccion",
  "p5_importaciones",
  // Parte 6 — Lucha de clases
  "p6_clases",
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
