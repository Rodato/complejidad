// Datos y enunciados del taller. Separado de los componentes para poder editar
// contenido sin tocar la interfaz.

import medici from "@/data/medici.json";
import got from "@/data/got.json";
import type { Arista } from "./red";

// ─────────────────────────────────────────────────────────────────────────────
// ACTO 1 — ¿Dirigido o no dirigido?
// ─────────────────────────────────────────────────────────────────────────────

export type Direccion = "dirigido" | "no_dirigido";

export const RELACIONES: { id: string; texto: string; correcta: Direccion; porque: string }[] = [
  {
    id: "r1",
    texto: "Un matrimonio entre dos familias florentinas del siglo XV.",
    correcta: "no_dirigido",
    porque: "Si los Medici están casados con los Albizzi, los Albizzi están casados con los Medici.",
  },
  {
    id: "r2",
    texto: "Una compraventa de un lote en Cali.",
    correcta: "dirigido",
    porque:
      "La tierra va del vendedor al comprador; el dinero, al revés. Hay que elegir qué flujo se dibuja. En este curso seguimos a la tierra: vendedor → comprador. Es la red de la Notaría Segunda que vamos a estudiar la próxima semana.",
  },
  {
    id: "r3",
    texto: "«A sigue a B en Instagram».",
    correcta: "dirigido",
    porque: "Que A siga a B no implica que B siga a A.",
  },
  {
    id: "r4",
    texto: "Dos personajes de una novela que aparecen juntos en la misma página.",
    correcta: "no_dirigido",
    porque: "Aparecer juntos es simétrico. Así se construyó la red de Game of Thrones del Acto 5.",
  },
  {
    id: "r5",
    texto: "Un banco que le presta plata a un urbanizador.",
    correcta: "dirigido",
    porque: "El crédito va del banco al urbanizador; la deuda, del urbanizador al banco.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ACTOS 1 a 4 — Las familias florentinas (Padgett y Ansell, 1993; Jackson, cap. 1)
// ─────────────────────────────────────────────────────────────────────────────

export type Familia = {
  id: string;
  x: number;
  y: number;
  /** Riqueza neta en 1427, en miles de liras. */
  riqueza: number;
  /** Puestos en el concejo (priorías) entre 1282 y 1344. 0 puede ser «sin dato». */
  priorias: number;
};

export const FAMILIAS: Familia[] = medici.nodos;
export const ARISTAS_MEDICI: Arista[] = medici.aristas as Arista[];
export const NOMBRES_FAMILIAS = FAMILIAS.map((f) => f.id).sort((a, b) => a.localeCompare(b));

/**
 * Ejercicio 1.1: el dibujo se muestra sin este matrimonio y el estudiante lo encuentra
 * comparando con la lista de vínculos. Está abajo, en una zona despejada del dibujo.
 */
export const VINCULO_FALTANTE: [string, string] = ["Barbadori", "Castellani"];

/**
 * Cada pareja estudia una familia. No se asignan Medici ni Strozzi, que son las dos
 * que todo el mundo compara. Quedan 13, como los escenarios del Taller 1.
 */
export const FAMILIAS_ASIGNABLES = NOMBRES_FAMILIAS.filter(
  (f) => f !== "Medici" && f !== "Strozzi",
);

/** Asignación estable: mismo código → misma familia, en cualquier dispositivo. */
export function familiaPara(codigo: string): string {
  const limpio = codigo.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  let h = 0;
  for (let i = 0; i < limpio.length; i++) {
    h = (h * 31 + limpio.charCodeAt(i)) % 1000003;
  }
  return FAMILIAS_ASIGNABLES[h % FAMILIAS_ASIGNABLES.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTO 5 — Game of Thrones, libro 1 (Beveridge y Shan, 2016)
// ─────────────────────────────────────────────────────────────────────────────

export type Personaje = { id: string; etiqueta: string; x: number; y: number };

export const PERSONAJES: Personaje[] = got.nodos;
export const ARISTAS_GOT: Arista[] = got.aristas as Arista[];
export const ETIQUETA_PERSONAJE: Record<string, string> = Object.fromEntries(
  PERSONAJES.map((p) => [p.id, p.etiqueta]),
);

/** Candidatos para el ejercicio 5.2: quién es puente sin estar en el núcleo. */
export const CANDIDATOS_PUENTE = [
  "Daenerys-Targaryen",
  "Petyr-Baelish",
  "Cersei-Lannister",
  "Joffrey-Baratheon",
];

export const FUENTE_GOT =
  "Beveridge, A. y Shan, J. (2016). «Network of Thrones». Math Horizons, 23(4). Datos: github.com/mathbeveridge/asoiaf (CC BY-NC-SA 4.0).";
export const FUENTE_MEDICI =
  "Padgett, J. y Ansell, C. (1993). «Robust Action and the Rise of the Medici, 1400–1434». American Journal of Sociology, 98(6). Subconjunto de 16 familias de Wasserman y Faust (1994), el mismo que usa Jackson.";
