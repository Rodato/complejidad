// Datos del quiz, ya resumidos por scripts/preparar_datos.py. No se editan a mano:
// se regeneran con el script.

import crudo from "./datos.json";

export type Tipo = "lote" | "casa";

type Venta = {
  fecha: string | null;
  vendedor: string;
  comprador: string;
  pm2: number;
  area: number;
};

type Resumen = {
  n: number;
  pm2: number;
  pos: number;
  apto_pct: number;
  nuevo_pct: number;
  area: number;
};

type Datos = {
  cuarenta: {
    n: number;
    n_lotes: number;
    mediana_lotes: number;
    perfil: { tipo: Tipo; desde: number; hasta: number; n: number; mediana: number }[];
    esquinas: { anio: number; donde: string; pm2: number; area: number }[];
    n_esquina: number;
    mediana_esquina: number;
    n_resto: number;
    mediana_resto: number;
    fuga: (Venta & { anio: number; barrio: string; tipo: Tipo })[];
    posiciones: {
      barrio: string;
      n_40: number;
      pm2_40: number;
      pos_40: number;
      n_hoy: number;
      pm2_hoy: number;
      pos_hoy: number;
    }[];
    san_antonio: Venta[];
  };
  hoy: {
    n: number;
    mediana: number;
    grupos: {
      clave: string;
      titulo: string;
      apto: number;
      n_apto: number;
      anio_real: number;
      real: number;
    }[];
    nuevo: { c22_n: number; c22_nuevo: number; ciudad_n: number; ciudad_nuevo: number };
    ciudad_jardin: Resumen;
    san_antonio: Resumen & { por_anio: Record<string, number>; casas: number; usadas: number };
    centro: (Resumen & { barrio: string })[];
  };
};

export const DATOS = crudo as Datos;
export const CUARENTA = DATOS.cuarenta;
export const HOY = DATOS.hoy;

// ── Formatos ────────────────────────────────────────────────────────────────

/** Pesos de 1940 con centavos: «$1,26». */
export function pesos40(v: number | null | undefined, dec = 2): string {
  if (v === null || v === undefined) return "—";
  return `$${v.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
}

/** Pesos de hoy en millones: «$2,46 M». */
export function millones(v: number | null | undefined, dec = 2): string {
  if (v === null || v === undefined) return "—";
  return `$${(v / 1e6).toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec })} M`;
}

export function num(v: number | null | undefined, dec = 0): string {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

/** Cambio en porcentaje con signo tipográfico: «+11 %», «−19 %». */
export function signo(v: number, dec = 0): string {
  const t = num(Math.abs(v), dec);
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${t} %`;
}

/**
 * Lecturas posibles de una cifra escrita por el estudiante: «1.234,5», «1234.5», «$220»,
 * «-5,2 %». «1.875» es ambiguo (¿mil ochocientos o uno coma ocho?): se devuelven las dos
 * lecturas, con coma decimal y con punto decimal, y quien compara acepta cualquiera.
 */
export function leerCifras(texto: string): number[] {
  const t = texto.replace(/[^\d.,-]/g, "").replace(/(?!^)-/g, "");
  if (!/\d/.test(t)) return [];
  const comaDecimal = Number(t.replace(/\./g, "").replace(",", "."));
  const puntoDecimal = Number(t.replace(/,/g, ""));
  return [comaDecimal, puntoDecimal].filter(Number.isFinite);
}

/** ¿Alguna lectura de la cifra cae dentro de la tolerancia relativa del valor esperado? */
export function cerca(texto: string, esperado: number, tolerancia = 0.05): boolean {
  return leerCifras(texto).some((n) => Math.abs(n - esperado) <= Math.abs(esperado) * tolerancia);
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** «1944-02-14» → «14 feb. 1944». Si no hay fecha completa, el año. */
export function fechaCorta(fecha: string | null, anio?: number): string {
  const m = fecha?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return anio ? String(anio) : "";
  return `${Number(m[3])} ${MESES[Number(m[2]) - 1].slice(0, 3)}. ${m[1]}`;
}
