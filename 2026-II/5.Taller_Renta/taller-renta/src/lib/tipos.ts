// Tipos compartidos del taller.

export type Registro = { nombre: string; codigo: string; pareja: string };

/** Respuestas del estudiante, tal como viven en el estado y en localStorage. */
export type Respuestas = {
  p1_m2_plaza: string;
  p1_m2_ejido: string;
  p1_evolucion: string;

  p2_razon: string;
  p2_cono: string;

  p3_razon_centro: string;
  p3_razon_afuera: string;
  p3_casa: string;

  p4_porcentaje: string;
  p4_municipio: string;

  p5_donde: string;
  p5_brecha: string;
  p5_barrio: string;
  p5_barrio_relato: string;

  p6_salto: string;
  p6_composicion: string;
  p6_real: string;
  p6_avisos: string;

  p7_precio_alto: string;
  p7_precio_bajo: string;
  p7_ficticio: string;
};

export const RESPUESTAS_VACIAS: Respuestas = {
  p1_m2_plaza: "",
  p1_m2_ejido: "",
  p1_evolucion: "",
  p2_razon: "",
  p2_cono: "",
  p3_razon_centro: "",
  p3_razon_afuera: "",
  p3_casa: "",
  p4_porcentaje: "",
  p4_municipio: "",
  p5_donde: "",
  p5_brecha: "",
  p5_barrio: "",
  p5_barrio_relato: "",
  p6_salto: "",
  p6_composicion: "",
  p6_real: "",
  p6_avisos: "",
  p7_precio_alto: "",
  p7_precio_bajo: "",
  p7_ficticio: "",
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
