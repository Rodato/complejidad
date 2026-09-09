// Los 13 perfiles de riesgo sísmico del estudio TREQ/GEM (2022) para Cali.
// Cada pareja recibe uno distinto; la asignación es determinista a partir del código
// del estudiante que registra, para que sea estable entre sesiones y entre dispositivos.

export type Escenario = {
  id: string;
  titulo: string;
  origen: string;
  magnitud: number;
  profundidadKm: number;
  tipo: "hipotético" | "histórico";
  imagen: string;
};

export const ESCENARIOS: Escenario[] = [
  {
    id: "dagua-calima",
    titulo: "Falla Dagua–Calima",
    origen: "Sismo hipotético, corteza superficial cerca de la ciudad",
    magnitud: 6.5,
    profundidadKm: 10,
    tipo: "hipotético",
    imagen: "/perfiles/01_escenario_dagua_calima_M6.5_10km.png",
  },
  {
    id: "placa-nazca",
    titulo: "Placa de Nazca",
    origen: "Sismo hipotético de subducción en el océano Pacífico",
    magnitud: 8.8,
    profundidadKm: 22,
    tipo: "hipotético",
    imagen: "/perfiles/02_escenario_placa_nazca_M8.8_22km.png",
  },
  {
    id: "saliente-buga-este",
    titulo: "Saliente de Buga (este)",
    origen: "Sismo hipotético al este de la ciudad",
    magnitud: 6.5,
    profundidadKm: 10,
    tipo: "hipotético",
    imagen: "/perfiles/03_escenario_saliente_buga_este_M6.5_10km.png",
  },
  {
    id: "cucuana",
    titulo: "Falla Cucuana",
    origen: "Sismo hipotético, falla dextral",
    magnitud: 6.5,
    profundidadKm: 10,
    tipo: "hipotético",
    imagen: "/perfiles/04_escenario_cucuana_M6.5_10km.png",
  },
  {
    id: "saliente-buga-noreste",
    titulo: "Saliente de Buga (noreste)",
    origen: "Sismo hipotético al noreste de la ciudad",
    magnitud: 6.5,
    profundidadKm: 10,
    tipo: "hipotético",
    imagen: "/perfiles/05_escenario_saliente_buga_noreste_M6.5_10km.png",
  },
  {
    id: "1994",
    titulo: "Terremoto de 1994",
    origen: "Evento histórico reconstruido con datos del USGS",
    magnitud: 6.8,
    profundidadKm: 12,
    tipo: "histórico",
    imagen: "/perfiles/06_historico_1994_M6.8_12km.png",
  },
  {
    id: "2004",
    titulo: "Terremoto de 2004 (Pizarro)",
    origen: "Evento histórico reconstruido con datos del USGS",
    magnitud: 7.2,
    profundidadKm: 15,
    tipo: "histórico",
    imagen: "/perfiles/07_historico_2004_M7.2_15km.png",
  },
  {
    id: "1957",
    titulo: "Terremoto de 1957",
    origen: "Evento histórico reconstruido con datos del USGS",
    magnitud: 6.1,
    profundidadKm: 15,
    tipo: "histórico",
    imagen: "/perfiles/08_historico_1957_M6.1_15km.png",
  },
  {
    id: "1995",
    titulo: "Terremoto de 1995",
    origen: "Evento histórico profundo reconstruido con datos del USGS",
    magnitud: 6.4,
    profundidadKm: 73,
    tipo: "histórico",
    imagen: "/perfiles/09_historico_1995_M6.4_73km.png",
  },
  {
    id: "1991",
    titulo: "Terremoto de 1991",
    origen: "Evento histórico reconstruido con datos del USGS",
    magnitud: 7.2,
    profundidadKm: 12,
    tipo: "histórico",
    imagen: "/perfiles/10_historico_1991_M7.2_12km.png",
  },
  {
    id: "1906",
    titulo: "Terremoto de 1906",
    origen: "Evento histórico de subducción reconstruido con datos del USGS",
    magnitud: 8.8,
    profundidadKm: 21,
    tipo: "histórico",
    imagen: "/perfiles/11_historico_1906_M8.8_21km.png",
  },
  {
    id: "1925",
    titulo: "Terremoto de 1925",
    origen: "Evento histórico reconstruido con datos del USGS",
    magnitud: 6.3,
    profundidadKm: 20,
    tipo: "histórico",
    imagen: "/perfiles/12_historico_1925_M6.3_20km.png",
  },
  {
    id: "1999",
    titulo: "Terremoto de 1999",
    origen: "Evento histórico reconstruido con datos del USGS",
    magnitud: 6.1,
    profundidadKm: 15,
    tipo: "histórico",
    imagen: "/perfiles/13_historico_1999_M6.1_15km.png",
  },
];

export const PERFIL_MITIGACION = "/perfiles/00_perfil_mitigacion_gestion_riesgo.png";

/** Asignación estable: mismo código → mismo escenario, siempre. */
export function escenarioPara(codigo: string): Escenario {
  const limpio = codigo.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  let h = 0;
  for (let i = 0; i < limpio.length; i++) {
    h = (h * 31 + limpio.charCodeAt(i)) % 1000003;
  }
  return ESCENARIOS[h % ESCENARIOS.length];
}

/** Filas que el estudiante compara en el ejercicio de no linealidad (leídas de los perfiles). */
export const COMPARACION = [
  { escenario: "Falla Dagua–Calima (hipotético)", mw: "6.5", prof: "10 km", indice: "0,52 %", colapsos: "1.800", fallecidos: "1.200" },
  { escenario: "Placa de Nazca (hipotético)", mw: "8.8", prof: "22 km", indice: "0,39 %", colapsos: "1.400", fallecidos: "1.000" },
  { escenario: "Saliente de Buga, este (hipotético)", mw: "6.5", prof: "10 km", indice: "0,21 %", colapsos: "700", fallecidos: "475" },
  { escenario: "Terremoto de 1994", mw: "6.8", prof: "12 km", indice: "0,031 %", colapsos: "108", fallecidos: "74" },
  { escenario: "Terremoto de 1906", mw: "8.8", prof: "21 km", indice: "0,004 %", colapsos: "14", fallecidos: "12" },
];

/**
 * El sismo del 10 de agosto de 2026 y el escenario del TREQ que más se le parece.
 * El estudio es de 2022, así que no pudo incluirlo; pero sí modeló el terremoto de
 * Pizarro de 2004 (Bajo Baudó, Chocó), del mismo origen tectónico y magnitud muy
 * cercana. Cifras leídas del perfil 13 del informe.
 */
export const SISMO_REAL = {
  fecha: "10 de agosto de 2026",
  magnitud: "7.4",
  origen:
    "Chocó, donde convergen las placas de Nazca, Suramérica y Panamá: una de las zonas de mayor actividad sísmica del Pacífico latinoamericano.",
};

export const ANALOGO_2004 = {
  nombre: "Terremoto de Pizarro (Bajo Baudó, Chocó)",
  anio: "2004",
  magnitud: "7.2",
  profundidad: "15 km",
  indiceColapsos: "0,023 %",
  colapsos: "81",
  colapsosRango: "21 – 268",
  fallecidos: "53",
  fallecidosRango: "13 – 172",
  desplazados: "10.500",
};
