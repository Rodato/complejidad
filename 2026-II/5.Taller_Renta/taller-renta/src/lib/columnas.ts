// Orden de columnas de la hoja de respuestas. Módulo client-safe (sin googleapis)
// para que tanto sheets.ts (servidor) como el cliente lo compartan.

import type { Respuestas } from "./tipos";

/** Cuántas partes tiene el taller (lo usa el servidor para validar borradores). */
export const N_PARTES = 7;

/** Columnas de respuesta, en el mismo orden en que aparecen en el taller. */
export const COLUMNAS_RESPUESTA = [
  // Parte 1 — Un metro de Cali en 1943
  "p1_m2_plaza",
  "p1_m2_ejido",
  "p1_evolucion",
  // Parte 2 — El cono
  "p2_razon",
  "p2_cono",
  // Parte 3 — Tierra y casa
  "p3_razon_centro",
  "p3_razon_afuera",
  "p3_casa",
  // Parte 4 — Quién vendía la tierra
  "p4_porcentaje",
  "p4_municipio",
  // Parte 5 — El cono roto
  "p5_donde",
  "p5_brecha",
  "p5_barrio",
  "p5_barrio_relato",
  // Parte 6 — ¿Subieron los precios?
  "p6_salto",
  "p6_composicion",
  "p6_real",
  "p6_avisos",
  // Parte 7 — La tierra como capital ficticio
  "p7_precio_alto",
  "p7_precio_bajo",
  "p7_ficticio",
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
