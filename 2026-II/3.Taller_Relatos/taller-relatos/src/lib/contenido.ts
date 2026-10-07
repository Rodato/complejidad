// Datos y enunciados del taller. Separado de los componentes para poder editar
// contenido sin tocar la interfaz.

import got from "@/data/got.json";
import notaria from "@/data/notaria.json";
import type { Arista } from "./red";

/** Asignación estable: mismo código → mismo elemento, en cualquier dispositivo. */
function hashCodigo(codigo: string, sal: number): number {
  const limpio = codigo.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  let h = sal;
  for (let i = 0; i < limpio.length; i++) {
    h = (h * 31 + limpio.charCodeAt(i)) % 1000003;
  }
  return h;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTO 1 — Juego de tronos, temporadas 1 a 8 (Beveridge, serie de HBO)
// ─────────────────────────────────────────────────────────────────────────────

export type Personaje = { id: string; etiqueta: string };

export const PERSONAJES: Personaje[] = got.personajes;
export const ETIQUETA_PERSONAJE: Record<string, string> = Object.fromEntries(
  PERSONAJES.map((p) => [p.id, p.etiqueta]),
);

/** Vínculos de cada temporada: [personaje, personaje, interacciones]. */
export const TEMPORADAS: [string, string, number][][] = got.temporadas as [
  string,
  string,
  number,
][][];
export const N_TEMPORADAS = TEMPORADAS.length;

/** Años de emisión, para que el estudiante ubique cada temporada. */
export const ANIO_TEMPORADA = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2019];

/** El de referencia, el que todo el mundo compara (como los Medici en el Taller 2). */
export const REFERENCIA_GOT = "TYRION";

/**
 * Cada pareja sigue a un personaje. Son trece que están en casi todas las temporadas
 * y cuya curva cuenta algo. Tyrion no se asigna: es la referencia de todos.
 */
export const PERSONAJES_ASIGNABLES = [
  "JON",
  "DAENERYS",
  "CERSEI",
  "JAIME",
  "SANSA",
  "ARYA",
  "BRAN",
  "SAM",
  "THEON",
  "DAVOS",
  "BRIENNE",
  "VARYS",
  "JORAH",
];

export function personajePara(codigo: string): string {
  return PERSONAJES_ASIGNABLES[hashCodigo(codigo, 0) % PERSONAJES_ASIGNABLES.length];
}

export const FUENTE_GOT =
  "Beveridge, A. (2016–2019). «Network of Thrones». Redes de interacción de la serie de HBO, construidas con los guiones de los fans. Datos: github.com/mathbeveridge/gameofthrones (CC BY-NC-SA 4.0).";

// ─────────────────────────────────────────────────────────────────────────────
// ACTO 2 — Seis escrituras reales de la Notaría 2 de Cali (1938 y 1943)
//
// Salen de data/consolidado_notaria2.csv. Es un componente conectado de la red real:
// todo gira alrededor de Francisco Caicedo B. Los resúmenes están simplificados de
// la transcripción; cifras, fechas y predios son los del documento. Vienen del primer
// acto que tuvo el Taller 2 (ver 2.Taller_Redes/reserva_taller3/).
// ─────────────────────────────────────────────────────────────────────────────

export type Actor = { id: string; nombre: string; x: number; y: number };

// Posiciones fijas (0–1) para dibujar la red que el estudiante va armando.
export const ACTORES_FICHAS: Actor[] = [
  { id: "fcaicedo", nombre: "Francisco Caicedo B.", x: 0.5, y: 0.45 },
  { id: "hoyos", nombre: "Víctor M. Hoyos F.", x: 0.15, y: 0.1 },
  { id: "fernando", nombre: "Fernando Caicedo", x: 0.85, y: 0.1 },
  { id: "rebolledo", nombre: "Hernando Rebolledo C.", x: 0.42, y: 0.85 },
  { id: "gaseosas", nombre: "Cía. de Gaseosas", x: 0.88, y: 0.85 },
  { id: "pcaicedo", nombre: "Pedro P. Caicedo B.", x: 0.1, y: 0.62 },
];

export const NOMBRE_ACTOR_FICHA: Record<string, string> = Object.fromEntries(
  ACTORES_FICHAS.map((a) => [a.id, a.nombre]),
);

export type Ficha = {
  id: string;
  fecha: string;
  texto: string;
  /** La respuesta: de quién a quién pasa la tierra, o null si no pasa tierra. */
  correcta: { de: string; a: string } | null;
  porque: string;
};

export const FICHAS: Ficha[] = [
  {
    id: "e1",
    fecha: "5 de junio de 1943",
    texto:
      "Permuta, primera parte. Francisco Caicedo B. transfiere a Víctor M. Hoyos F. dos lotes del sector de Las Nieves, uno de ellos con casa de bahareque y madera. Valor asignado: $20.000.",
    correcta: { de: "fcaicedo", a: "hoyos" },
    porque: "La tierra sale de Caicedo y llega a Hoyos: la flecha va de Caicedo a Hoyos.",
  },
  {
    id: "e2",
    fecha: "5 de junio de 1943",
    texto:
      "Permuta, segunda parte (la misma escritura). A cambio, Víctor M. Hoyos F. transfiere a Francisco Caicedo B. el lote que le queda de un predio en la margen izquierda del río Cali. Valor asignado: $23.000; Caicedo paga en efectivo los $3.000 de diferencia.",
    correcta: { de: "hoyos", a: "fcaicedo" },
    porque:
      "Una permuta es un intercambio: la tierra se mueve en los dos sentidos. Por eso entre Caicedo y Hoyos hay dos flechas, una de ida y otra de vuelta. En una red dirigida, A→B y B→A son vínculos distintos.",
  },
  {
    id: "e3",
    fecha: "2 de agosto de 1943",
    texto:
      "Hernando Rebolledo C. vende a la Compañía Industrial de Gaseosas S. A., con domicilio en Medellín, el lote «El Mango», en la carrera 8.ª entre calles 27 y 28: 3.000 m² por $13.500.",
    correcta: { de: "rebolledo", a: "gaseosas" },
    porque:
      "Vendedor → comprador. Fíjate en que el comprador es una empresa: un nodo no tiene que ser una persona.",
  },
  {
    id: "e4",
    fecha: "26 de octubre de 1943",
    texto:
      "Francisco Caicedo B. vende al doctor Fernando Caicedo un globo de terreno ya urbanizado junto al río Cali, cerca del charco de El Burro: 2.629,80 m² por $24.457,14. La escritura aclara que Francisco lo había recibido en la permuta de junio con Víctor M. Hoyos F.",
    correcta: { de: "fcaicedo", a: "fernando" },
    porque:
      "Vendedor → comprador. Y mira la nota de la escritura: ese lote llegó a Caicedo desde Hoyos en junio, él lo urbanizó y en octubre lo vendió. La tierra recorrió un camino: Hoyos → Caicedo → Fernando Caicedo.",
  },
  {
    id: "e5",
    fecha: "16 de diciembre de 1943",
    texto:
      "Francisco Caicedo B. vende a Hernando Rebolledo C. un inmueble urbano en Cali por $9.600.",
    correcta: { de: "fcaicedo", a: "rebolledo" },
    porque: "Vendedor → comprador.",
  },
  {
    id: "e6",
    fecha: "1938",
    texto:
      "Francisco Caicedo B. y Pedro P. Caicedo B. constituyen una sociedad colectiva de comercio llamada Caicedo Hermanos Ltda. Valor registrado: $8.000.",
    correcta: null,
    porque:
      "Esta era la trampa. Nadie le entrega tierra a nadie: los dos hermanos forman una sociedad juntos. Hay una relación, pero no una flecha de tierra, y además no tiene dirección: si Francisco es socio de Pedro, Pedro es socio de Francisco. Lo que cuenta como vínculo es una decisión de quien investiga, y hay que tomarla antes de dibujar. En la base de datos del curso esta escritura quedó registrada como si fuera una venta: los datos también tienen errores.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ACTOS 3 y 4 — La red de la Notaría 2 de Cali, 1938–1944
// ─────────────────────────────────────────────────────────────────────────────

export type ActorNotaria = { id: string; etiqueta: string };
/** Una flecha: [vendedor, comprador, año, escritura]. */
export type Flecha = [string, string, number, number];

export const ACTORES: ActorNotaria[] = notaria.actores;
export const FLECHAS: Flecha[] = notaria.aristas as Flecha[];
export const NEGOCIOS: Record<string, string> = notaria.negocios;
export const ETIQUETA_ACTOR: Record<string, string> = Object.fromEntries(
  ACTORES.map((a) => [a.id, a.etiqueta]),
);
const ID_ACTOR: Record<string, string> = Object.fromEntries(
  ACTORES.map((a) => [a.etiqueta, a.id]),
);
const idDe = (etiqueta: string) => {
  const id = ID_ACTOR[etiqueta];
  if (!id) throw new Error(`Actor no encontrado en notaria.json: ${etiqueta}`);
  return id;
};

export const ANIOS = [1938, 1939, 1940, 1941, 1942, 1943, 1944];

export const MUNICIPIO = idDe("Municipio de Cali");
export const SEBASTIAN = idDe("Sebastián Caicedo");

/** Candidatos de 3.3: quién acumula y quién reparte. */
export const CANDIDATOS_ROL = [
  MUNICIPIO,
  SEBASTIAN,
  idDe("Colombian Holding Corporation S. A."),
  idDe("Doctor Daniel Caicedo Gutiérrez"),
];

/**
 * Cada pareja sigue a un actor: los trece con más escrituras después del Municipio y
 * de Sebastián Caicedo, que son los dos que compara todo el mundo.
 */
export const ACTORES_ASIGNABLES = [
  "Susana Caicedo de Vaccari",
  "Colombian Holding Corporation S. A.",
  "Sucesión Jesús Lourido",
  "The Royal Bank Of Canadá",
  "Pedro Pablo Scarpetta",
  "Doctor Daniel Caicedo Gutiérrez",
  "Herederos de las Sucesiones Acumuladas Burrowes",
  "Purificación Caicedo Valencia",
  "Compañía Central de Construcciones",
  "Banco Central Hipotecario",
  "Cristina Serrano vda. de Lourido",
  "Departamento del Valle del Cauca",
  "Ana Borrero",
].map(idDe);

export function actorPara(codigo: string): string {
  return ACTORES_ASIGNABLES[hashCodigo(codigo, 7) % ACTORES_ASIGNABLES.length];
}

export const FUENTE_NOTARIA =
  "Protocolos de la Notaría Segunda de Cali, 1938–1944 (Archivo Histórico de Cali). Transcripción del curso; red curada: nombres normalizados, sin apoderados y con alias unificados a mano.";

// ─────────────────────────────────────────────────────────────────────────────
// ACTO 4 — Lo que tiene que tener un relato
// ─────────────────────────────────────────────────────────────────────────────

export const PIEZAS_RELATO: { id: string; texto: string }[] = [
  { id: "patron", texto: "Un patrón: algo que se repite, una estructura que se repite o una forma que tiene la red." },
  { id: "protagonista", texto: "Un protagonista con nombre propio, y su papel en la red." },
  { id: "quiebre", texto: "Un quiebre: un evento que cambia el relato, o un contraste entre dos actores." },
  { id: "cifras", texto: "Al menos dos cifras sacadas del taller." },
  { id: "limite", texto: "Algo que los datos no permiten afirmar, y por qué." },
];

export type { Arista };
