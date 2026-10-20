// Medidas de red, calculadas en el navegador. Sin librerías: las redes del taller tienen
// a lo sumo 29 nodos y así cada fórmula queda a la vista. Viene del Taller 3.
//
// Las redes son NO dirigidas y se miden SIN pesos: compartir tres empresas cuenta como
// un vínculo, igual que compartir una. (En igraph hay que pasar weights = NA a
// betweenness(); si no, toma el número de empresas compartidas como distancia.)
//
// Valores verificados contra igraph: betweenness(normalized = FALSE).

export type Red = {
  nodos: string[];
  vecinos: Map<string, Set<string>>;
};

export function crearRed(nodos: string[], aristas: { a: string; b: string }[]): Red {
  const vecinos = new Map<string, Set<string>>(nodos.map((n) => [n, new Set<string>()]));
  for (const { a, b } of aristas) {
    if (a === b) continue;
    vecinos.get(a)?.add(b);
    vecinos.get(b)?.add(a);
  }
  return { nodos, vecinos };
}

export function grado(red: Red): Record<string, number> {
  return Object.fromEntries(red.nodos.map((n) => [n, red.vecinos.get(n)!.size]));
}

/** Búsqueda en anchura: distancia, número de caminos más cortos y predecesores. */
function anchura(red: Red, s: string) {
  const dist = new Map<string, number>([[s, 0]]);
  const sigma = new Map<string, number>([[s, 1]]);
  const pred = new Map<string, string[]>([[s, []]]);
  const orden = [s];
  for (let i = 0; i < orden.length; i++) {
    const v = orden[i];
    for (const w of red.vecinos.get(v)!) {
      if (!dist.has(w)) {
        dist.set(w, dist.get(v)! + 1);
        sigma.set(w, 0);
        pred.set(w, []);
        orden.push(w);
      }
      if (dist.get(w) === dist.get(v)! + 1) {
        sigma.set(w, sigma.get(w)! + sigma.get(v)!);
        pred.get(w)!.push(v);
      }
    }
  }
  return { dist, sigma, pred, orden };
}

/**
 * Intermediación de Freeman, algoritmo de Brandes, SIN normalizar: para cada par de
 * OTROS nodos, la fracción de sus caminos más cortos que pasa por el nodo, sumada sobre
 * todos los pares. Si entre dos nodos hay dos caminos igual de cortos y solo uno pasa por
 * v, ese par le suma 1/2 a v.
 */
export function intermediacion(red: Red): Record<string, number> {
  const cb = new Map<string, number>(red.nodos.map((n) => [n, 0]));
  for (const s of red.nodos) {
    const { sigma, pred, orden } = anchura(red, s);
    const delta = new Map<string, number>(orden.map((n) => [n, 0]));
    for (let i = orden.length - 1; i >= 0; i--) {
      const w = orden[i];
      for (const v of pred.get(w)!) {
        delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
      }
      if (w !== s) cb.set(w, cb.get(w)! + delta.get(w)!);
    }
  }
  // En una red no dirigida cada par se recorre dos veces (de s a t y de t a s).
  return Object.fromEntries(red.nodos.map((k) => [k, cb.get(k)! / 2]));
}

/**
 * Conteo literal: cuántos caminos más cortos entre pares de OTROS nodos pasan por cada
 * nodo. A diferencia de la intermediación, aquí no se reparte: si un par tiene dos
 * caminos igual de cortos y los dos pasan por v, v suma 2.
 */
export function caminosQuePasan(red: Red): { porNodo: Record<string, number>; pares: number; caminos: number } {
  const bfs = new Map(red.nodos.map((s) => [s, anchura(red, s)]));
  const cuenta = new Map<string, number>(red.nodos.map((n) => [n, 0]));
  let pares = 0;
  let caminos = 0;
  const ns = red.nodos;
  for (let i = 0; i < ns.length; i++) {
    const di = bfs.get(ns[i])!;
    for (let j = i + 1; j < ns.length; j++) {
      const dst = di.dist.get(ns[j]);
      if (dst === undefined) continue; // no se alcanzan: no hay camino
      pares++;
      caminos += di.sigma.get(ns[j])!;
      const dj = bfs.get(ns[j])!;
      for (const v of ns) {
        if (v === ns[i] || v === ns[j]) continue;
        const a = di.dist.get(v);
        const b = dj.dist.get(v);
        if (a !== undefined && b !== undefined && a + b === dst) {
          cuenta.set(v, cuenta.get(v)! + di.sigma.get(v)! * dj.sigma.get(v)!);
        }
      }
    }
  }
  return { porNodo: Object.fromEntries(cuenta), pares, caminos };
}

/** Todos los caminos más cortos de s a t (hasta `tope`), como listas de nodos. */
export function caminosMasCortos(red: Red, s: string, t: string, tope = 40): string[][] {
  if (s === t) return [];
  const { dist, pred } = anchura(red, s);
  if (!dist.has(t)) return [];
  const res: string[][] = [];
  const armar = (v: string, cola: string[]) => {
    if (res.length >= tope) return;
    if (v === s) {
      res.push([s, ...cola]);
      return;
    }
    for (const u of pred.get(v)!) armar(u, [v, ...cola]);
  };
  armar(t, []);
  return res;
}

/** Componentes: grupos de nodos conectados entre sí por algún camino. */
export function componentes(red: Red): string[][] {
  const visto = new Set<string>();
  const grupos: string[][] = [];
  for (const n of red.nodos) {
    if (visto.has(n)) continue;
    const grupo = anchura(red, n).orden;
    grupo.forEach((m) => visto.add(m));
    grupos.push(grupo);
  }
  return grupos.sort((a, b) => b.length - a.length);
}

/** Número con coma decimal y sin ceros sobrantes: 34,5 · 36 · 67,58. */
export function fmt(v: number, decimales = 2): string {
  const r = Number(v.toFixed(decimales));
  return r.toLocaleString("es-CO", { maximumFractionDigits: decimales });
}
