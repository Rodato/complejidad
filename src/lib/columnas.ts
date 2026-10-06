// Orden de columnas de la hoja de respuestas. Módulo client-safe (sin googleapis)
// para que tanto sheets.ts (servidor) como el cliente lo compartan.

import type { Respuestas } from "./tipos";

/** Cuántos actos tiene el taller (lo usa el servidor para validar borradores). */
export const N_ACTOS = 4;

/** Columnas de respuesta, en el mismo orden en que aparecen en el taller. */
export const COLUMNAS_RESPUESTA = [
  // Acto 1 — Poniente
  "a1_menos",
  "a1_final",
  "a1_pico",
  "a1_trayectoria",
  "a1_ned",
  "a1_relato",
  // Acto 2 — Escrituras
  "a2_fichas",
  "a2_caicedo",
  "a2_se_pierde",
  // Acto 3 — Cali año por año
  "a3_anio_mas",
  "a3_archivo",
  "a3_gigante",
  "a3_bazar",
  "a3_acumula",
  "a3_reparte",
  "a3_actor_lectura",
  // Acto 4 — El relato de Cali
  "a4_chequeo",
  "a4_relato",
  "a4_comparacion",
] as const satisfies readonly (keyof Respuestas)[];

export const COLUMNAS = [
  "timestamp",
  "nombre",
  "codigo",
  "pareja",
  "personaje",
  "actor",
  "a2_aciertos",
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
