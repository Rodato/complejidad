// Tipos compartidos del taller.

import type { Direccion } from "./contenido";
import type { Medida } from "./red";

export type Registro = { nombre: string; codigo: string; pareja: string };

/** Respuestas del estudiante, tal como viven en el estado y en localStorage. */
export type Respuestas = {
  a1_n_nodos: string;
  a1_n_vinculos: string;
  a1_falta_a: string;
  a1_falta_b: string;
  a1_direccion: Record<string, Direccion | "">;
  a1_otra_relacion: string;

  a2_grado_medici: string;
  a2_grado_strozzi: string;
  a2_grado_familia: string;
  a2_grado_basta: string;

  a3_camino: string[];
  a3_n_caminos: string;
  a3_comp_sin_medici: string;
  a3_comp_sin_strozzi: string;
  a3_comp_sin_familia: string;
  a3_vinculos_medici: string;
  a3_vinculos_strozzi: string;
  a3_huecos: string;

  a4_caminos_bg: string;
  a4_por_medici: string;
  a4_por_albizzi: string;
  a4_strozzi_medida: Medida | "";
  a4_familia_lectura: string;
  a4_argumento: string;

  a5_numero_uno: string;
  a5_puente: string;
  a5_puente_porque: string;
  a5_cali: string;
};

export const RESPUESTAS_VACIAS: Respuestas = {
  a1_n_nodos: "",
  a1_n_vinculos: "",
  a1_falta_a: "",
  a1_falta_b: "",
  a1_direccion: {},
  a1_otra_relacion: "",
  a2_grado_medici: "",
  a2_grado_strozzi: "",
  a2_grado_familia: "",
  a2_grado_basta: "",
  a3_camino: [],
  a3_n_caminos: "",
  a3_comp_sin_medici: "",
  a3_comp_sin_strozzi: "",
  a3_comp_sin_familia: "",
  a3_vinculos_medici: "",
  a3_vinculos_strozzi: "",
  a3_huecos: "",
  a4_caminos_bg: "",
  a4_por_medici: "",
  a4_por_albizzi: "",
  a4_strozzi_medida: "",
  a4_familia_lectura: "",
  a4_argumento: "",
  a5_numero_uno: "",
  a5_puente: "",
  a5_puente_porque: "",
  a5_cali: "",
};

/** Lo que se envía a guardar (Sheets). */
export type PayloadGuardar = Registro & {
  familia: string;
  a1_aciertos: number;
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
