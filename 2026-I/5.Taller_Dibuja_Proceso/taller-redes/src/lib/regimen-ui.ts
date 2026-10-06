// Paleta compartida del "régimen" entre el panel del estudiante y el dashboard
// docente, para que ambos hablen el mismo idioma visual.

import type { ClaveRegimen } from "./tipos";

/** Clases Tailwind para badges/chips. */
export const COLOR_REGIMEN: Record<ClaveRegimen, string> = {
  vacio: "bg-slate-100 text-slate-600 border-slate-300",
  campana: "bg-sky-100 text-sky-800 border-sky-300",
  intermedio: "bg-amber-100 text-amber-800 border-amber-300",
  "cola-larga": "bg-rose-100 text-rose-800 border-rose-300",
};

/** Hex para colorear gráficas (Recharts <Cell/>, etc.). */
export const HEX_REGIMEN: Record<ClaveRegimen, string> = {
  vacio: "#94a3b8",
  campana: "#0ea5e9",
  intermedio: "#f59e0b",
  "cola-larga": "#e11d48",
};

/** Etiqueta → clave (para datos viejos que solo guardaron la etiqueta). */
export function claveDesdeEtiqueta(etiqueta: string): ClaveRegimen {
  const t = (etiqueta || "").toLowerCase();
  if (t.includes("campana")) return "campana";
  if (t.includes("cola")) return "cola-larga";
  if (t.includes("intermedio")) return "intermedio";
  return "vacio";
}
