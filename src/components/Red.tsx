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
              markerWidth={densa ? 9 : 5}
              markerHeight={densa ? 9 : 5}
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
        const conEtiqueta = etiquetas === "todas" || e === "foco" || e === "vecino";
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
            {conEtiqueta && (
              <text
                x={p.x}
                y={p.y + r + 3.2}
                // Cerca de los bordes la etiqueta crece hacia adentro, para que no se corte.
                textAnchor={p.x < 15 ? "start" : p.x > W - 15 ? "end" : "middle"}
                className={`${COLOR_TEXTO[e]} pointer-events-none`}
                style={{ fontSize: e === "foco" ? 3.4 : 3, fontWeight: e === "foco" ? 700 : 500 }}
                paintOrder="stroke"
                stroke="white"
                strokeWidth={0.9}
              >
                {n.etiqueta.length > 26 ? `${n.etiqueta.slice(0, 24)}…` : n.etiqueta}
              </text>
            )}
          </g>
        );
      })}
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
