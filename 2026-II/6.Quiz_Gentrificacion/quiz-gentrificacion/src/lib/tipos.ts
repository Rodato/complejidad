// Tipos compartidos del quiz.

export type Registro = { nombre: string; codigo: string; pareja: string };

/** Respuestas del estudiante, tal como viven en el estado y en localStorage. */
export type Respuestas = {
  p1_esquina: string;
  p1_curva: string;

  p2_falta: string;
  p2_ruta: string;

  p3_caida: string;
  p3_desclase: string;

  p4_prediccion: string;

  p5_brecha: string;
};

export const RESPUESTAS_VACIAS: Respuestas = {
  p1_esquina: "",
  p1_curva: "",
  p2_falta: "",
  p2_ruta: "",
  p3_caida: "",
  p3_desclase: "",
  p4_prediccion: "",
  p5_brecha: "",
};

/** Lo que se envía a guardar (Sheets). */
export type PayloadGuardar = Registro & { respuestas: Respuestas };

/** Borrador en curso que viaja con el código, para retomar en otro dispositivo. */
export type PayloadBorrador = Registro & {
  parte: number;
  respuestas: Respuestas;
};

/** Lo que devuelve el servidor al recuperar un borrador. */
export type BorradorGuardado = {
  nombre: string;
  pareja: string;
  parte: number;
  actualizado: string;
  respuestas: Respuestas;
};
