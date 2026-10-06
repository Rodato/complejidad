// Claves de localStorage atadas al estudiante (su código), para que en computadores
// compartidos cada quien tenga su propio borrador y nadie herede la red del anterior.
// Antes había una sola clave global ("taller5-grafo") y el siguiente usuario que entraba
// rehidrataba la red del anterior.

export const CLAVE_REGISTRO = "taller5-registro";

// Claves del formato viejo (globales, sin código). Se purgan para que no reaparezca la
// red de una sesión previa ni queden restos en el navegador.
export const CLAVES_LEGADO = ["taller5-grafo", "taller5-narrativa"] as const;

// Normaliza el código a un sufijo estable de clave (sin espacios, mayúsculas ni símbolos).
function slug(codigo: string): string {
  return codigo.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "anon";
}

export const claveGrafo = (codigo: string) => `taller5-grafo:${slug(codigo)}`;
export const claveNarrativa = (codigo: string) => `taller5-narrativa:${slug(codigo)}`;

// Borra el borrador (grafo + narrativa) de un estudiante y limpia el legado global.
export function limpiarBorrador(codigo: string) {
  try {
    localStorage.removeItem(claveGrafo(codigo));
    localStorage.removeItem(claveNarrativa(codigo));
    for (const k of CLAVES_LEGADO) localStorage.removeItem(k);
  } catch {}
}
