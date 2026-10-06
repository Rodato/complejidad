"use client";

import { useId } from "react";

// Dibujo de una red en SVG. Sin librerías: las posiciones vienen calculadas (fijas,
// iguales para todos los estudiantes) y aquí solo se pinta y se responde al toque.

export type NodoVis = { id: string; etiqueta: string; x: number; y: number };

type Props = {
  nodos: NodoVis[];
  aristas: [string, string][];
  dirigida?: boolean;
  /** Alto / ancho. 1 = cuadrado. */
  proporcion?: number;
  /** Nodo tocado: se resaltan él, sus vecinos y sus vínculos; el resto se apaga. */
  seleccionado?: string | null;
  /** Secuencia de nodos que forma un camino; se resaltan nodos y tramos. */
  camino?: string[];
  /** Nodos quitados de la red (no se dibujan, ni sus vínculos). */
  ocultos?: string[];
  /** Nodos que se marcan con el color de acento, sin apagar a los demás. */
  marcados?: string[];
  /** Tamaño relativo 0–1 por nodo. Sin esto, todos iguales. */
  tamanos?: Record<string, number>;
  /** Qué etiquetas se escriben. «marcados» = solo las de nodos resaltados. */
  etiquetas?: "todas" | "marcados";
  radioBase?: number;
  /** Red densa (cientos de vínculos): líneas más finas y claras para que se vean los nodos. */
  densa?: boolean;
  onToque?: (id: string) => void;
  /** Texto accesible que describe la red. */
  titulo: string;
};

export default function Red({
  nodos,
  aristas,
  dirigida = false,
  proporcion = 1,
  seleccionado = null,
  camino = [],
  ocultos = [],
  marcados = [],
  tamanos,
  etiquetas = "todas",
  radioBase = 3.2,
  densa = false,
  onToque,
  titulo,
}: Props) {
  const idMarca = useId().replace(/:/g, "");
  const W = 100;
  const H = 100 * proporcion;
  // Margen alrededor del dibujo para que las etiquetas de los bordes no se corten.
  const M = densa ? 2 : 6;
  const fuera = new Set(ocultos);
  const pos = new Map(nodos.map((n) => [n.id, { x: n.x * W, y: n.y * H }]));
  const visibles = nodos.filter((n) => !fuera.has(n.id));
  const aristasVis = aristas.filter(([a, b]) => !fuera.has(a) && !fuera.has(b));

  const vecinos = new Set<string>();
  if (seleccionado) {
    for (const [a, b] of aristasVis) {
      if (a === seleccionado) vecinos.add(b);
      if (b === seleccionado) vecinos.add(a);
    }
  }
  const enCamino = new Set(camino);
  const tramos = new Set<string>();
  for (let i = 0; i + 1 < camino.length; i++) {
    tramos.add(`${camino[i]}|${camino[i + 1]}`);
    tramos.add(`${camino[i + 1]}|${camino[i]}`);
  }
  const marca = new Set(marcados);
  const hayFoco = Boolean(seleccionado) || camino.length > 0;

  const radio = (id: string) =>
    tamanos ? radioBase * (0.45 + 1.6 * Math.sqrt(tamanos[id] ?? 0)) : radioBase;

  const pares = new Set(aristasVis.map(([a, b]) => `${a}|${b}`));

  function estadoNodo(id: string): "foco" | "vecino" | "normal" | "apagado" {
    if (id === seleccionado || enCamino.has(id)) return "foco";
    if (vecinos.has(id)) return "vecino";
    if (marca.has(id)) return "foco";
    return hayFoco ? "apagado" : "normal";
  }

  function estadoArista(a: string, b: string): "foco" | "normal" | "apagado" {
    if (tramos.has(`${a}|${b}`)) return "foco";
    if (seleccionado && (a === seleccionado || b === seleccionado)) return "foco";
    return hayFoco ? "apagado" : "normal";
  }

  const rotulos = colocarEtiquetas();

  /**
   * Dónde va cada etiqueta, sin que se pisen. Se reparten por prioridad (el nodo tocado,
   * el camino, los marcados en su orden, los vecinos, el resto) y cada una prueba cuatro
   * lugares alrededor de su nodo: abajo, arriba, a la derecha, a la izquierda. Si no cabe
   * en ninguno se omite, salvo las dos primeras, que siempre se escriben.
   */
  function colocarEtiquetas() {
    const conEtiqueta = (id: string) => {
      const e = estadoNodo(id);
      return etiquetas === "todas" || e === "foco" || e === "vecino";
    };
    const vivos = new Set(visibles.map((n) => n.id));
    const orden = [
      ...(seleccionado ? [seleccionado] : []),
      ...camino,
      ...marcados,
      ...vecinos,
      ...visibles.map((n) => n.id),
    ].filter((id, i, xs) => vivos.has(id) && conEtiqueta(id) && xs.indexOf(id) === i);

    const cajas: { x0: number; y0: number; x1: number; y1: number }[] = [];
    const res = new Map<string, { x: number; y: number; anclaje: "start" | "middle" | "end"; texto: string; foco: boolean }>();
    const etiquetaDe = new Map(visibles.map((n) => [n.id, n.etiqueta]));
    orden.forEach((id, k) => {
      const p = pos.get(id)!;
      const r = radio(id);
      const foco = estadoNodo(id) === "foco";
      const f = foco ? 3.4 : 3;
      const crudo = etiquetaDe.get(id)!;
      const texto = crudo.length > 26 ? `${crudo.slice(0, 24)}…` : crudo;
      const ancho = texto.length * f * 0.56;
      // Cerca de los bordes la etiqueta crece hacia adentro, para que no se corte.
      const centrada: "start" | "middle" | "end" = p.x < 15 ? "start" : p.x > W - 15 ? "end" : "middle";
      const candidatos: { x: number; y: number; anclaje: "start" | "middle" | "end" }[] = [
        { x: p.x, y: p.y + r + f * 0.95, anclaje: centrada },
        { x: p.x, y: p.y - r - f * 0.3, anclaje: centrada },
        { x: p.x + r + 0.8, y: p.y + f * 0.35, anclaje: "start" },
        { x: p.x - r - 0.8, y: p.y + f * 0.35, anclaje: "end" },
      ];
      const caja = (c: (typeof candidatos)[number]) => {
        const x0 = c.anclaje === "start" ? c.x : c.anclaje === "end" ? c.x - ancho : c.x - ancho / 2;
        return { x0, y0: c.y - f * 0.85, x1: x0 + ancho, y1: c.y + f * 0.2 };
      };
      const choca = (b: ReturnType<typeof caja>) =>
        b.x0 < -M ||
        b.x1 > W + M ||
        cajas.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
      const libre = candidatos.find((c) => !choca(caja(c)));
      // Las dos primeras siempre se escriben: si no hay hueco, abajo y hacia adentro.
      const elegido =
        libre ?? (k < 2 ? { ...candidatos[0], anclaje: p.x < W / 2 ? "start" : "end" } : null);
      if (!elegido) return;
      cajas.push(caja(elegido));
      res.set(id, { ...elegido, texto, foco });
    });
    return res;
  }

  return (
    <svg
      viewBox={`${-M} ${-M / 2} ${W + 2 * M} ${H + 2 * M}`}
      role="img"
      aria-label={titulo}
      className="block h-auto w-full touch-manipulation select-none"
    >
      <title>{titulo}</title>
      {dirigida && (
        <defs>
          {(["normal", "foco", "apagado"] as const).map((e) => (
            <marker
              key={e}
              id={`${idMarca}-${e}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              // En la red densa la punta va en unidades del dibujo: con el trazo tan
              // fino, una punta proporcional al trazo no se ve, y una fija en
              // múltiplos del trazo tapa a los nodos chicos.
              markerUnits={densa ? "userSpaceOnUse" : "strokeWidth"}
              markerWidth={densa ? 1.1 : 5}
              markerHeight={densa ? 1.1 : 5}
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" className={COLOR_FLECHA[e]} />
            </marker>
          ))}
        </defs>
      )}

      {aristasVis.map(([a, b], i) => {
        const p = pos.get(a);
        const q = pos.get(b);
        if (!p || !q) return null;
        const e = estadoArista(a, b);
        const clase = COLOR_ARISTA[e];
        if (!dirigida) {
          return (
            <line
              key={i}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              className={clase}
              strokeWidth={e === "foco" ? 0.9 : densa ? 0.15 : 0.45}
              strokeOpacity={densa && e !== "foco" ? 0.55 : 1}
            />
          );
        }
        // Dirigida: la flecha termina en el borde del nodo destino, y si hay vínculo
        // en los dos sentidos se curvan para que se vean las dos.
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        const ux = dx / d;
        const uy = dy / d;
        const doble = pares.has(`${b}|${a}`);
        const curva = doble ? (densa ? 1.2 : 5) : 0;
        const x1 = p.x + ux * radio(a);
        const y1 = p.y + uy * radio(a);
        const hueco = densa ? 0.3 : 0.8;
        const x2 = q.x - ux * (radio(b) + hueco);
        const y2 = q.y - uy * (radio(b) + hueco);
        const cx = (x1 + x2) / 2 - uy * curva;
        const cy = (y1 + y2) / 2 + ux * curva;
        return (
          <path
            key={i}
            d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`}
            fill="none"
            className={clase}
            strokeWidth={densa ? (e === "foco" ? 0.35 : 0.18) : e === "foco" ? 0.9 : 0.6}
            markerEnd={`url(#${idMarca}-${e})`}
          />
        );
      })}

      {visibles.map((n) => {
        const p = pos.get(n.id)!;
        const e = estadoNodo(n.id);
        const r = radio(n.id);
        return (
          <g
            key={n.id}
            onClick={onToque ? () => onToque(n.id) : undefined}
            className={onToque ? "cursor-pointer" : undefined}
          >
            {/* Zona de toque más grande que el círculo: en un celular, un nodo de 3
                unidades es menos que la yema de un dedo. */}
            {onToque && (
              <circle cx={p.x} cy={p.y} r={Math.max(r, densa ? 2.2 : 5)} fill="transparent" />
            )}
            <circle cx={p.x} cy={p.y} r={r} className={COLOR_NODO[e]} strokeWidth={densa ? 0.25 : 0.5} />
          </g>
        );
      })}

      {/* Las etiquetas van en una capa propia, encima de todos los nodos. */}
      {[...rotulos].map(([id, t]) => (
        <text
          key={`t-${id}`}
          x={t.x}
          y={t.y}
          textAnchor={t.anclaje}
          className={`${COLOR_TEXTO[estadoNodo(id)]} pointer-events-none`}
          style={{ fontSize: t.foco ? 3.4 : 3, fontWeight: t.foco ? 700 : 500 }}
          paintOrder="stroke"
          stroke="white"
          strokeWidth={0.9}
        >
          {t.texto}
        </text>
      ))}
    </svg>
  );
}

const COLOR_NODO = {
  foco: "fill-brand-500 stroke-brand-700",
  vecino: "fill-brand-200 stroke-brand-500",
  normal: "fill-stone-300 stroke-stone-500",
  apagado: "fill-stone-200 stroke-stone-300",
};
const COLOR_ARISTA = {
  foco: "stroke-brand-600",
  normal: "stroke-stone-400",
  apagado: "stroke-stone-200",
};
const COLOR_FLECHA = {
  foco: "fill-brand-600",
  normal: "fill-stone-400",
  apagado: "fill-stone-200",
};
const COLOR_TEXTO = {
  foco: "fill-stone-900",
  vecino: "fill-stone-800",
  normal: "fill-stone-700",
  apagado: "fill-stone-300",
};
