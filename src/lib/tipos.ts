// Tipos compartidos del taller.

export type Registro = { nombre: string; codigo: string; pareja: string };

/** Lo que el estudiante marca en una escritura del Acto 2. */
export type RespuestaFicha = { de: string; a: string; no: boolean };

/** Respuestas del estudiante, tal como viven en el estado y en localStorage. */
export type Respuestas = {
  a1_menos: string;
  a1_final: string;
  a1_pico: string;
  a1_trayectoria: string;
  a1_ned: string;
  a1_relato: string;

  a2_fichas: Record<string, RespuestaFicha>;
  a2_caicedo: string;
  a2_se_pierde: string;

  a3_anio_mas: string;
  a3_archivo: string;
  a3_gigante: string;
  a3_bazar: string;
  a3_acumula: string;
  a3_reparte: string;
  a3_actor_lectura: string;

  a4_chequeo: Record<string, boolean>;
  a4_relato: string;
  a4_comparacion: string;
};

export const RESPUESTAS_VACIAS: Respuestas = {
  a1_menos: "",
  a1_final: "",
  a1_pico: "",
  a1_trayectoria: "",
  a1_ned: "",
  a1_relato: "",
  a2_fichas: {},
  a2_caicedo: "",
  a2_se_pierde: "",
  a3_anio_mas: "",
  a3_archivo: "",
  a3_gigante: "",
  a3_bazar: "",
  a3_acumula: "",
  a3_reparte: "",
  a3_actor_lectura: "",
  a4_chequeo: {},
  a4_relato: "",
  a4_comparacion: "",
};

/** Lo que se envía a guardar (Sheets). */
export type PayloadGuardar = Registro & {
  personaje: string;
  actor: string;
  a2_aciertos: number;
  respuestas: Respuestas;
};

/** Borrador en curso que viaja con el código, para retomar en otro dispositivo. */
export type PayloadBorrador = Registro & {
  acto: number;
  respuestas: Respuestas;
};

/** Lo que devuelve el servidor al recuperar un borrador. */
export type BorradorGuardado = {
  nombre: string;
  pareja: string;
  acto: number;
  actualizado: string;
  respuestas: Respuestas;
};
