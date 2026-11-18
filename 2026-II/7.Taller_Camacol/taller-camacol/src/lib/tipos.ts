// Tipos compartidos del taller.

export type Registro = { nombre: string; codigo: string; pareja: string };

/**
 * Respuestas del estudiante, tal como viven en el estado y en localStorage. Todas son
 * texto: las de casillas guardan las claves elegidas separadas por comas.
 */
export type Respuestas = {
  p1_lugar: string;
  p1_sobre: string;
  p1_iniciativa: string;

  p2_mesa: string;
  p2_copias: string;
  p2_cvc: string;
  p2_contradiccion: string;

  p3_estudios: string;
  p3_clase: string;
  p3_agua: string;
  p3_fuente: string;

  p4_terremoto: string;
  p4_sismico: string;
  p4_leccion: string;
  p4_responsabilidad: string;

  p5_viviendas: string;
  p5_master: string;
  p5_m2: string;
  p5_parque: string;
  p5_fuentes: string;

  p6_comparacion: string;
  p6_decisiones: string;
};

export const RESPUESTAS_VACIAS: Respuestas = {
  p1_lugar: "",
  p1_sobre: "",
  p1_iniciativa: "",
  p2_mesa: "",
  p2_copias: "",
  p2_cvc: "",
  p2_contradiccion: "",
  p3_estudios: "",
  p3_clase: "",
  p3_agua: "",
  p3_fuente: "",
  p4_terremoto: "",
  p4_sismico: "",
  p4_leccion: "",
  p4_responsabilidad: "",
  p5_viviendas: "",
  p5_master: "",
  p5_m2: "",
  p5_parque: "",
  p5_fuentes: "",
  p6_comparacion: "",
  p6_decisiones: "",
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
