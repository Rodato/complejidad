// Tipos compartidos del taller.

import type { Cumplimiento, Factor, TipoAccion } from "./contenido";

export type Registro = { nombre: string; codigo: string; pareja: string };

/** Respuestas del estudiante, tal como viven en el estado y en localStorage. */
export type Respuestas = {
  a1_clasificacion: Record<string, Factor | "">;
  a1_puede_cambiar: string;

  a2_cronologia: Record<string, TipoAccion | "">;
  a2_patron: string;
  a2_demuestra: string;
  a2_problema: string;

  a3_indice_colapsos: string;
  a3_comunas_top: string;
  a3_fallecidos_prom: string;
  a3_fallecidos_rango: string;
  a3_comuna_perdidas: string;
  a3_comuna_fallecidos: string;
  a3_desacople: string;
  a3_rango_significa: string;
  a3_no_linealidad: string;

  a4_lazo: Record<string, Cumplimiento | "">;
  a4_donde_rompe: string;
  a4_argumento: string;
  a4_modelo_vs_dano: string;
};

export const RESPUESTAS_VACIAS: Respuestas = {
  a1_clasificacion: {},
  a1_puede_cambiar: "",
  a2_cronologia: {},
  a2_patron: "",
  a2_demuestra: "",
  a2_problema: "",
  a3_indice_colapsos: "",
  a3_comunas_top: "",
  a3_fallecidos_prom: "",
  a3_fallecidos_rango: "",
  a3_comuna_perdidas: "",
  a3_comuna_fallecidos: "",
  a3_desacople: "",
  a3_rango_significa: "",
  a3_no_linealidad: "",
  a4_lazo: {},
  a4_donde_rompe: "",
  a4_argumento: "",
  a4_modelo_vs_dano: "",
};

/** Lo que se envía a guardar (Sheets). */
export type PayloadGuardar = Registro & {
  escenario_id: string;
  escenario_titulo: string;
  a1_aciertos: number;
  a2_n_conocer: number;
  a2_n_actuar: number;
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
