// Claves de localStorage atadas al código del estudiante, para que en computadores
// o celulares compartidos cada quien tenga su propio borrador y nadie herede el
// del anterior. Misma decisión que en los talleres anteriores.

export const CLAVE_REGISTRO = "taller5-renta-registro";

function slug(codigo: string): string {
  return (
    codigo.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    "anon"
  );
}

export const claveRespuestas = (codigo: string) => `taller5-renta-respuestas:${slug(codigo)}`;
/** En qué parte iba, para que al volver retome donde estaba y no en la 1. */
export const clavePartes = (codigo: string) => `taller5-renta-parte:${slug(codigo)}`;

export function limpiarBorrador(codigo: string) {
  try {
    localStorage.removeItem(claveRespuestas(codigo));
    localStorage.removeItem(clavePartes(codigo));
  } catch {}
}
