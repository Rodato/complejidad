// Claves de localStorage atadas al código del estudiante, para que en computadores
// o celulares compartidos cada quien tenga su propio borrador y nadie herede el
// del anterior. Misma decisión que en el Taller 5.

export const CLAVE_REGISTRO = "taller-redes-registro";

function slug(codigo: string): string {
  return (
    codigo.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    "anon"
  );
}

export const claveRespuestas = (codigo: string) => `taller-redes-respuestas:${slug(codigo)}`;
/** En qué acto iba, para que al volver otro día retome donde estaba y no en el 1. */
export const claveActo = (codigo: string) => `taller-redes-acto:${slug(codigo)}`;

export function limpiarBorrador(codigo: string) {
  try {
    localStorage.removeItem(claveRespuestas(codigo));
    localStorage.removeItem(claveActo(codigo));
  } catch {}
}
