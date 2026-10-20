// Claves de localStorage atadas al código del estudiante, para que en computadores
// o celulares compartidos cada quien tenga su propio borrador y nadie herede el
// del anterior. Misma decisión que en los talleres 3 y 5.

export const CLAVE_REGISTRO = "taller4-azucar-registro";

function slug(codigo: string): string {
  return (
    codigo.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    "anon"
  );
}

export const claveRespuestas = (codigo: string) => `taller4-azucar-respuestas:${slug(codigo)}`;
/** En qué parte iba, para que al volver retome donde estaba y no en la 1. */
export const clavePartes = (codigo: string) => `taller4-azucar-parte:${slug(codigo)}`;

export function limpiarBorrador(codigo: string) {
  try {
    localStorage.removeItem(claveRespuestas(codigo));
    localStorage.removeItem(clavePartes(codigo));
  } catch {}
}
