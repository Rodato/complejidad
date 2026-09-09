// Orden de columnas de la hoja de respuestas. Módulo client-safe (sin googleapis)
// para que tanto sheets.ts (servidor) como el cliente lo compartan.

export const COLUMNAS = [
  "timestamp",
  "nombre",
  "codigo",
  "pareja",
  "escenario_id",
  "escenario_titulo",
  // Acto 1
  "a1_clasificacion",
  "a1_aciertos",
  "a1_puede_cambiar",
  // Acto 2
  "a2_cronologia",
  "a2_n_conocer",
  "a2_n_actuar",
  "a2_patron",
  "a2_demuestra",
  "a2_problema",
  // Acto 3
  "a3_indice_colapsos",
  "a3_comunas_top",
  "a3_fallecidos_prom",
  "a3_fallecidos_rango",
  "a3_comuna_perdidas",
  "a3_comuna_fallecidos",
  "a3_desacople",
  "a3_rango_significa",
  "a3_no_linealidad",
  // Acto 4
  "a4_lazo",
  "a4_donde_rompe",
  "a4_argumento",
  "a4_modelo_vs_dano",
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
