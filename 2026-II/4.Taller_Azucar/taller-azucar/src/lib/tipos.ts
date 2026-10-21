// Tipos compartidos del taller.

export type Registro = { nombre: string; codigo: string; pareja: string };

/** Un matrimonio que el grupo encontró con ayuda de la IA (parte 3). */
export type Enlace = {
  persona1: string;
  persona2: string;
  anio: string;
  fuente: string;
  /** Qué pasó cuando abrieron la fuente. */
  verificado: "" | "confirma" | "no_confirma" | "no_abre";
};

/** Respuestas del estudiante, tal como viven en el estado y en localStorage. */
export type Respuestas = {
  p1_grado: string;
  p1_intermediacion: string;
  p1_contraste: string;
  p1_salcedo: string;

  p2_clusters: string;
  p2_cruces: string;
  p2_tray_a: string;
  p2_tray_c: string;
  p2_tray_f: string;
  p2_tray_b: string;
  p2_tray_lectura: string;
  p2_obras: string;
  p2_cali: string;

  p3_pregunta_ia: string;
  p3_enlaces: Enlace[];
  p3_fallas_ia: string;

  p4_valle: string;

  p5_caicedo: string;
  p5_produccion: string;
  p5_importaciones: string;

  p6_clases: string;
};

export const ENLACE_VACIO: Enlace = { persona1: "", persona2: "", anio: "", fuente: "", verificado: "" };

export const RESPUESTAS_VACIAS: Respuestas = {
  p1_grado: "",
  p1_intermediacion: "",
  p1_contraste: "",
  p1_salcedo: "",
  p2_clusters: "",
  p2_cruces: "",
  p2_tray_a: "",
  p2_tray_c: "",
  p2_tray_f: "",
  p2_tray_b: "",
  p2_tray_lectura: "",
  p2_obras: "",
  p2_cali: "",
  p3_pregunta_ia: "",
  p3_enlaces: [ENLACE_VACIO],
  p3_fallas_ia: "",
  p4_valle: "",
  p5_caicedo: "",
  p5_produccion: "",
  p5_importaciones: "",
  p6_clases: "",
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
