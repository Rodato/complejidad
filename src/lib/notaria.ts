// Cálculos sobre la red de la Notaría que comparten los actos 3 y 4.

import { ACTORES, ANIOS, FLECHAS, TEMPORADAS, type Flecha } from "./contenido";
import { componentes, crearRed, gradoEntrada, gradoSalida, type Arista } from "./red";

export type Modo = "anio" | "acumulado";

export type Periodo = {
  flechas: Flecha[];
  escrituras: number;
  actores: Set<string>;
  /** Actores del componente (débil) más grande. */
  gigante: number;
  entrada: Record<string, number>;
  salida: Record<string, number>;
};

const TODOS = ACTORES.map((a) => a.id);

function calcular(flechas: Flecha[]): Periodo {
  const aristas: Arista[] = flechas.map(([a, b]) => [a, b]);
  const actores = new Set(aristas.flat());
  const comps = componentes(crearRed([...actores], aristas));
  return {
    flechas,
    escrituras: new Set(flechas.map((f) => f[3])).size,
    actores,
    gigante: comps[0]?.length ?? 0,
    entrada: gradoEntrada(aristas),
    salida: gradoSalida(aristas),
  };
}

const cache = new Map<string, Periodo>();

/** La red de un año, o la acumulada desde 1938 hasta ese año. */
export function periodo(anio: number, modo: Modo): Periodo {
  const k = `${modo}-${anio}`;
  if (!cache.has(k)) {
    cache.set(
      k,
      calcular(FLECHAS.filter((f) => (modo === "anio" ? f[2] === anio : f[2] <= anio))),
    );
  }
  return cache.get(k)!;
}

export const TOTAL = periodo(ANIOS[ANIOS.length - 1], "acumulado");
export const PCT_GIGANTE = (100 * TOTAL.gigante) / TOTAL.actores.size;

export const ESCRITURAS_POR_ANIO = ANIOS.map((y) => periodo(y, "anio").escrituras);
export const ANIO_MAS = ANIOS[ESCRITURAS_POR_ANIO.indexOf(Math.max(...ESCRITURAS_POR_ANIO))];

/** Los que no están activos en el periodo: se esconden del dibujo. */
export function inactivos(p: Periodo): string[] {
  return TODOS.filter((id) => !p.actores.has(id));
}

export function top(valores: Record<string, number>, k: number): [string, number][] {
  return Object.entries(valores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, k);
}

/** Compras y ventas de un actor, año por año. */
export function porAnio(id: string): { anio: number; compras: number; ventas: number }[] {
  return ANIOS.map((anio) => ({
    anio,
    compras: FLECHAS.filter((f) => f[2] === anio && f[1] === id).length,
    ventas: FLECHAS.filter((f) => f[2] === anio && f[0] === id).length,
  }));
}

/** Las flechas en las que participa un actor, en orden cronológico. */
export function flechasDe(id: string): Flecha[] {
  return FLECHAS.filter((f) => f[0] === id || f[1] === id).sort((a, b) => a[2] - b[2] || a[3] - b[3]);
}

/** Para comparar: qué porcentaje de personajes está en el componente más grande de la T8. */
export const PCT_GIGANTE_T8 = (() => {
  const t8: Arista[] = TEMPORADAS[TEMPORADAS.length - 1].map(([a, b]) => [a, b]);
  const nodos = [...new Set(t8.flat())];
  return (100 * componentes(crearRed(nodos, t8))[0].length) / nodos.length;
})();
