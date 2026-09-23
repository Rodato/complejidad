// Orden de columnas de la hoja de respuestas. Módulo client-safe (sin googleapis)
// para que tanto sheets.ts (servidor) como el cliente lo compartan.

import type { Respuestas } from "./tipos";

/** Columnas de respuesta, en el mismo orden en que aparecen en el taller. */
export const COLUMNAS_RESPUESTA = [
  // Acto 1
  "a1_n_nodos",
  "a1_n_vinculos",
  "a1_falta_a",
  "a1_falta_b",
  "a1_direccion",
  "a1_otra_relacion",
  // Acto 2
  "a2_grado_medici",
  "a2_grado_strozzi",
  "a2_grado_familia",
  "a2_grado_basta",
  // Acto 3
  "a3_camino",
  "a3_n_caminos",
  "a3_comp_sin_medici",
  "a3_comp_sin_strozzi",
  "a3_comp_sin_familia",
  "a3_vinculos_medici",
  "a3_vinculos_strozzi",
  "a3_huecos",
  // Acto 4
  "a4_caminos_bg",
  "a4_por_medici",
  "a4_por_albizzi",
  "a4_strozzi_medida",
  "a4_familia_lectura",
  "a4_argumento",
  // Acto 5
  "a5_numero_uno",
  "a5_puente",
  "a5_puente_porque",
  "a5_cali",
] as const satisfies readonly (keyof Respuestas)[];

export const COLUMNAS = [
  "timestamp",
  "nombre",
  "codigo",
  "pareja",
  "familia",
  "a1_aciertos",
  ...COLUMNAS_RESPUESTA,
] as const;

export type Columna = (typeof COLUMNAS)[number];

// Pestaña aparte para los borradores en curso: una fila por código, que se sobrescribe.
// No se mezcla con las entregas finales, que son inmutables y se califican.
export const COLUMNAS_BORRADOR = [
  "codigo",
  "actualizado",
  "nombre",
  "pareja",
  "acto",
  "respuestas",
] as const;
