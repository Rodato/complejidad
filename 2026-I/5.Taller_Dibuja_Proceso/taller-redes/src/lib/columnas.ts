// Orden de columnas de la hoja de respuestas. Módulo client-safe (sin googleapis)
// para que tanto sheets.ts (servidor) como el dashboard (cliente) lo compartan.

export const COLUMNAS = [
  "timestamp",
  "nombre",
  "codigo",
  "companeros",
  "n_nodos",
  "n_aristas",
  "grado_max",
  "grado_promedio",
  "regimen",
  "regimen_clave",
  "secuencia_construccion",
  "grafo",
  "narrativa",
] as const;

export type Columna = (typeof COLUMNAS)[number];
