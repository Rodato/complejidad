// Métricas de red, calculadas en el navegador. Sin librerías: las redes del taller son
// pequeñas (como mucho 172 personajes por temporada, 1.235 actores en Cali) y así cada
// fórmula queda a la vista. Viene del Taller 2.
//
// Las métricas de abajo son para redes NO dirigidas (las interacciones de Juego de
// tronos). Para la Notaría, que es dirigida, están gradoEntrada y gradoSalida al final;
// los componentes de la Notaría se calculan ignorando la dirección (componentes débiles).
//
// Los valores se verificaron contra igraph (scripts/preparar_datos.R imprime la tabla):
// misma normalización que betweenness(normalized = TRUE).

export type Arista = [string, string];

export type Red = {
  nodos: string[];
  vecinos: Map<string, Set<string>>;
};

export function crearRed(nodos: string[], aristas: Arista[], quitar: string[] = []): Red {
  const fuera = new Set(quitar);
  const vivos = nodos.filter((n) => !fuera.has(n));
  const vecinos = new Map<string, Set<string>>(vivos.map((n) => [n, new Set<string>()]));
  for (const [a, b] of aristas) {
    if (fuera.has(a) || fuera.has(b) || a === b) continue;
    vecinos.get(a)?.add(b);
    vecinos.get(b)?.add(a);
  }
  return { nodos: vivos, vecinos };
}

export function grado(red: Red): Record<string, number> {
  return Object.fromEntries(red.nodos.map((n) => [n, red.vecinos.get(n)!.size]));
}

/** Distancias (en número de vínculos) desde un nodo a todos los que alcanza. */
export function distanciasDesde(red: Red, origen: string): Map<string, number> {
  const dist = new Map<string, number>([[origen, 0]]);
  const cola = [origen];
  for (let i = 0; i < cola.length; i++) {
    const u = cola[i];
    for (const v of red.vecinos.get(u) ?? []) {
      if (!dist.has(v)) {
        dist.set(v, dist.get(u)! + 1);
        cola.push(v);
      }
    }
  }
  return dist;
}

/** Componentes: grupos de nodos conectados entre sí por algún camino. */
export function componentes(red: Red): string[][] {
  const visto = new Set<string>();
  const grupos: string[][] = [];
  for (const n of red.nodos) {
    if (visto.has(n)) continue;
    const grupo = [...distanciasDesde(red, n).keys()];
    grupo.forEach((m) => visto.add(m));
    grupos.push(grupo);
  }
  return grupos.sort((a, b) => b.length - a.length);
}

/** Vínculos que hay entre los vecinos de un nodo, y cuántos podría haber. */
export function triangulos(red: Red, n: string): { entreVecinos: number; posibles: number } {
  const vs = [...(red.vecinos.get(n) ?? [])];
  let entreVecinos = 0;
  for (let i = 0; i < vs.length; i++)
    for (let j = i + 1; j < vs.length; j++) if (red.vecinos.get(vs[i])!.has(vs[j])) entreVecinos++;
  return { entreVecinos, posibles: (vs.length * (vs.length - 1)) / 2 };
}

/** Coeficiente de agrupamiento local. null si el nodo tiene menos de dos vecinos. */
export function agrupamiento(red: Red): Record<string, number | null> {
  return Object.fromEntries(
    red.nodos.map((n) => {
      const t = triangulos(red, n);
      return [n, t.posibles === 0 ? null : t.entreVecinos / t.posibles];
    }),
  );
}

/**
 * Intermediación (Freeman), con el algoritmo de Brandes. Normalizada como la fórmula
 * (1.1) de Jackson: la fracción promedio de caminos más cortos entre OTROS pares que
 * pasan por el nodo, dividida por (n−1)(n−2)/2.
 */
export function intermediacion(red: Red): Record<string, number> {
  const cb = new Map<string, number>(red.nodos.map((n) => [n, 0]));
  for (const s of red.nodos) {
    const pila: string[] = [];
    const pred = new Map<string, string[]>(red.nodos.map((n) => [n, []]));
    const sigma = new Map<string, number>(red.nodos.map((n) => [n, 0]));
    const dist = new Map<string, number>([[s, 0]]);
    sigma.set(s, 1);
    const cola = [s];
    for (let i = 0; i < cola.length; i++) {
      const v = cola[i];
      pila.push(v);
      for (const w of red.vecinos.get(v)!) {
        if (!dist.has(w)) {
          dist.set(w, dist.get(v)! + 1);
          cola.push(w);
        }
        if (dist.get(w) === dist.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          pred.get(w)!.push(v);
        }
      }
    }
    const delta = new Map<string, number>(red.nodos.map((n) => [n, 0]));
    while (pila.length) {
      const w = pila.pop()!;
      for (const v of pred.get(w)!) {
        delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
      }
      if (w !== s) cb.set(w, cb.get(w)! + delta.get(w)!);
    }
  }
  const n = red.nodos.length;
  // Cada par se cuenta dos veces (de s a t y de t a s) en una red no dirigida.
  const norma = n > 2 ? ((n - 1) * (n - 2)) / 2 : 1;
  return Object.fromEntries(red.nodos.map((k) => [k, cb.get(k)! / 2 / norma]));
}

/** Cercanía: (alcanzados − 1) / suma de distancias. Alta = llega a todos en pocos pasos. */
export function cercania(red: Red): Record<string, number> {
  return Object.fromEntries(
    red.nodos.map((n) => {
      const d = distanciasDesde(red, n);
      let suma = 0;
      d.forEach((v) => (suma += v));
      return [n, suma === 0 ? 0 : (d.size - 1) / suma];
    }),
  );
}

/**
 * Centralidad de vector propio, por iteración de potencias, escalada para que el
 * máximo sea 1. Se itera sobre A + I (mismo vector propio que A) para que converja
 * también en redes casi bipartitas, donde la iteración simple oscila.
 */
export function vectorPropio(red: Red, iteraciones = 1000): Record<string, number> {
  let x = new Map<string, number>(red.nodos.map((n) => [n, 1]));
  for (let it = 0; it < iteraciones; it++) {
    const y = new Map<string, number>();
    let max = 0;
    for (const n of red.nodos) {
      let s = x.get(n)!;
      for (const v of red.vecinos.get(n)!) s += x.get(v)!;
      y.set(n, s);
      if (s > max) max = s;
    }
    let cambio = 0;
    for (const n of red.nodos) {
      const nuevo = y.get(n)! / max;
      cambio += Math.abs(nuevo - x.get(n)!);
      y.set(n, nuevo);
    }
    x = y;
    if (cambio < 1e-10) break;
  }
  return Object.fromEntries(x);
}

export type Medida = "grado" | "intermediacion" | "vectorPropio" | "cercania";

export const MEDIDAS: { clave: Medida; nombre: string; corto: string; idea: string }[] = [
  {
    clave: "grado",
    nombre: "Grado",
    corto: "Popularidad",
    idea: "Cuántos vínculos directos tiene.",
  },
  {
    clave: "vectorPropio",
    nombre: "Vector propio",
    corto: "Conexiones importantes",
    idea: "Cuenta más estar unido a quienes también están bien conectados.",
  },
  {
    clave: "cercania",
    nombre: "Cercanía",
    corto: "Alcance",
    idea: "Qué tan pocos pasos necesita para llegar a todos los demás.",
  },
  {
    clave: "intermediacion",
    nombre: "Intermediación",
    corto: "Puente",
    idea: "Qué fracción de los caminos más cortos entre otros pasa por él.",
  },
];

export type Metricas = Record<Medida, Record<string, number>>;

export function todasLasMetricas(red: Red): Metricas {
  return {
    grado: grado(red),
    intermediacion: intermediacion(red),
    vectorPropio: vectorPropio(red),
    cercania: cercania(red),
  };
}

/** Puesto (1 = el más alto) de cada nodo según una medida. Los empates comparten puesto. */
export function puestos(valores: Record<string, number>): Record<string, number> {
  const orden = Object.entries(valores).sort((a, b) => b[1] - a[1]);
  const res: Record<string, number> = {};
  orden.forEach(([n, v], i) => {
    const previo = i > 0 ? orden[i - 1] : null;
    res[n] = previo && Math.abs(previo[1] - v) < 1e-9 ? res[previo[0]] : i + 1;
  });
  return res;
}

export function ranking(valores: Record<string, number>, k: number): [string, number][] {
  return Object.entries(valores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, k);
}

/** Formato colombiano: coma decimal. */
export function fmt(v: number, decimales = 3): string {
  return v.toFixed(decimales).replace(".", ",");
}

/** Densidad: vínculos que hay sobre los que podría haber. */
export function densidad(red: Red): number {
  const n = red.nodos.length;
  let l = 0;
  red.vecinos.forEach((v) => (l += v.size));
  return n > 1 ? l / 2 / ((n * (n - 1)) / 2) : 0;
}

// ── Redes dirigidas (Notaría): se cuentan flechas, no vecinos ──────────────────
// Si A le vendió dos veces a B, son dos flechas: dos compras de B. Por eso aquí no se
// eliminan repetidos, a diferencia de crearRed.

/** Grado de entrada = flechas que llegan = compras = tierra que se acumula. */
export function gradoEntrada(aristas: Arista[]): Record<string, number> {
  const g: Record<string, number> = {};
  for (const [, b] of aristas) g[b] = (g[b] ?? 0) + 1;
  return g;
}

/** Grado de salida = flechas que salen = ventas = tierra que se reparte. */
export function gradoSalida(aristas: Arista[]): Record<string, number> {
  const g: Record<string, number> = {};
  for (const [a] of aristas) g[a] = (g[a] ?? 0) + 1;
  return g;
}

/** Formato colombiano para enteros: 1.235. */
export function miles(v: number): string {
  return v.toLocaleString("es-CO");
}
