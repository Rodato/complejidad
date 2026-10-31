// Datos del taller, ya resumidos por scripts/preparar_datos.py. No se editan a mano:
// se regeneran con el script.

import crudo from "./datos.json";

export type Tipo = "lote" | "casa";

export type Escritura = {
  id: number;
  fuente: string;
  anio: number;
  fecha: string | null;
  vendedor: string;
  comprador: string;
  valor: number;
  area: number;
  pm2: number;
  tipo: Tipo;
  /** Vende el Municipio: un ejido. Cuenta como lote aunque tenga casa (es del arrendatario). */
  municipio: boolean;
  /** La escritura dice que el comprador ocupaba el lote como arrendatario. */
  arrendatario: boolean;
  barrio: string | null;
  km: number | null;
  lugar: string;
};

export type Barrio40 = {
  barrio: string;
  hoy: string;
  lat: number;
  lon: number;
  km: number;
  n_lotes: number;
  n_casas: number;
  lote_mediana: number | null;
  indice_40: number | null;
  n_hoy: number;
  mediana_hoy: number | null;
  indice_hoy: number | null;
};

export type Anillo = { desde: number; hasta: number; n: number; mediana: number };
export type Sector = "sur" | "oriente" | "norte" | "occidente";

type Datos = {
  plaza: { lat: number; lon: number };
  cuarenta: {
    n: number;
    n_lotes: number;
    n_casas: number;
    n_ubicadas: number;
    mediana_lotes: number;
    resumen_anual: { anio: number; tipo: Tipo; n: number; mediana: number }[];
    perfil: (Anillo & { tipo: Tipo })[];
    barrios: Barrio40[];
    vendedores: { vendedor: string; n: number; n_lotes: number; mediana: number | null; barrios: (string | null)[] }[];
    municipio: {
      n: number;
      mediana: number;
      a_arrendatarios: number;
      mediana_particulares: number;
      n_particulares: number;
    };
    escrituras: Escritura[];
  };
  hoy: {
    n_crudo: number;
    n: number;
    n_ref: number;
    mediana: number;
    perfil: (Anillo & { sector: Sector })[];
    celdas: { lat: number; lon: number; n: number; indice: number }[];
    rotulos: { nombre: string; lat: number; lon: number }[];
    ingenuas: { anio: number; tipo: string; n: number; mediana: number }[];
    indice: { anio: number; indice: number }[];
    composicion: { comuna: number; ref: number; y2026: number; mediana: number | null }[];
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

/** Pesos de hoy en millones: «$2,46 millones». */
export function millones(v: number | null | undefined, dec = 2): string {
  if (v === null || v === undefined) return "—";
  return `$${(v / 1e6).toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec })} millones`;
}

export function num(v: number | null | undefined, dec = 0): string {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
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

/** Mediana simple. */
export function mediana(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** «1944-02-14» → «14 de febrero de 1944». Si no hay fecha completa, el año. */
export function fechaLarga(fecha: string | null, anio?: number): string {
  const m = fecha?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return anio ? String(anio) : "";
  return `${Number(m[3])} de ${MESES[Number(m[2]) - 1]} de ${m[1]}`;
}
