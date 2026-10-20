"use client";

// Dibujo de una red pequeña en SVG, con posiciones fijas (iguales para todos los
// estudiantes). Viene de Red.tsx del Taller 3, con dos cosas nuevas: dos tipos de nodo
// (círculo para grupos y personas, cuadrado para ingenios y empresas) para las redes
// bipartitas, y el lado de cada etiqueta fijado a mano, porque las redes de Collins se
// dibujan en columnas.

export type NodoGrafo = {
  id: string;
  /** Lo que se escribe junto al nodo. */
  etiqueta: string;
  /** Nombre completo, para la ficha del nodo tocado. */
  nombre: string;
  /** Posición en [0, 1]. */
  x: number;
  y: number;
  tipo: "grupo" | "objeto";
  lado: "izq" | "der" | "arriba" | "abajo";
};

export type AristaGrafo = {
  a: string;
  b: string;
  /** Cuántas cosas comparten los dos extremos (empresas). Solo cambia el grosor. */
  peso?: number;
  /** Qué comparten, para mostrarlo al tocar. */
  nota?: string;
};

type Props = {
  nodos: NodoGrafo[];
  aristas: AristaGrafo[];
  proporcion?: number;
  seleccionado?: string | null;
  /** Caminos a resaltar (listas de nodos). */
  caminos?: string[][];
  /** Tamaño relativo 0–1 por nodo. Sin esto, todos iguales. */
  tamanos?: Record<string, number>;
  mostrarPesos?: boolean;
  fuente?: number;
  onToque?: (id: string) => void;
  titulo: string;
};

export default function Grafo({
  nodos,
  aristas,
  proporcion = 1,
  seleccionado = null,
  caminos = [],
  tamanos,
  mostrarPesos = false,
  fuente = 3.2,
  onToque,
  titulo,
}: Props) {
  const W = 100;
  const H = 100 * proporcion;
  const M = 7;
  const pos = new Map(nodos.map((n) => [n.id, { x: n.x * W, y: n.y * H }]));

  const vecinos = new Set<string>();
  if (seleccionado) {
    for (const { a, b } of aristas) {
      if (a === seleccionado) vecinos.add(b);
      if (b === seleccionado) vecinos.add(a);
    }
  }
  const enRuta = new Set(caminos.flat());
  const tramos = new Set<string>();
  for (const c of caminos)
    for (let i = 0; i + 1 < c.length; i++) {
      tramos.add(`${c[i]}|${c[i + 1]}`);
      tramos.add(`${c[i + 1]}|${c[i]}`);
    }
  const hayFoco = Boolean(seleccionado) || caminos.length > 0;

  const radio = (id: string) => {
    const base = 2.3;
    return tamanos ? base * (0.55 + 1.5 * Math.sqrt(tamanos[id] ?? 0)) : base;
  };

  function estadoNodo(id: string): "foco" | "vecino" | "normal" | "apagado" {
    if (id === seleccionado || enRuta.has(id)) return "foco";
    if (vecinos.has(id)) return "vecino";
    return hayFoco ? "apagado" : "normal";
  }

  function estadoArista(a: string, b: string): "foco" | "normal" | "apagado" {
    if (tramos.has(`${a}|${b}`)) return "foco";
    if (seleccionado && (a === seleccionado || b === seleccionado)) return "foco";
    return hayFoco ? "apagado" : "normal";
  }

  function rotulo(n: NodoGrafo) {
    const p = pos.get(n.id)!;
    const r = radio(n.id);
    const s = 1.1;
    switch (n.lado) {
      case "der":
        return { x: p.x + r + s, y: p.y + fuente * 0.35, anclaje: "start" as const };
      case "izq":
        return { x: p.x - r - s, y: p.y + fuente * 0.35, anclaje: "end" as const };
      case "arriba":
        return { x: p.x, y: p.y - r - s, anclaje: "middle" as const };
      default:
        return { x: p.x, y: p.y + r + s + fuente * 0.8, anclaje: "middle" as const };
    }
  }

  return (
    <svg
      viewBox={`${-M} ${-M / 2} ${W + 2 * M} ${H + M}`}
      role="img"
      aria-label={titulo}
      className="block h-auto w-full touch-manipulation select-none"
    >
      <title>{titulo}</title>

      {aristas.map(({ a, b, peso = 1 }, i) => {
        const p = pos.get(a);
        const q = pos.get(b);
        if (!p || !q) return null;
        const e = estadoArista(a, b);
        const grosor = (e === "foco" ? 0.75 : 0.4) * (1 + (peso - 1) * 0.55);
        return (
          <line
            key={i}
            x1={p.x}
            y1={p.y}
            x2={q.x}
            y2={q.y}
            className={COLOR_ARISTA[e]}
            strokeWidth={grosor}
            strokeLinecap="round"
          />
        );
      })}

      {mostrarPesos &&
        aristas.map(({ a, b, peso = 1 }, i) => {
          const p = pos.get(a);
          const q = pos.get(b);
          if (!p || !q) return null;
          const e = estadoArista(a, b);
          if (e === "apagado") return null;
          return (
            <text
              key={`p-${i}`}
              x={(p.x + q.x) / 2}
              y={(p.y + q.y) / 2 + fuente * 0.3}
              textAnchor="middle"
              className={`pointer-events-none ${e === "foco" ? "fill-brand-800" : "fill-stone-500"}`}
              style={{ fontSize: fuente * 0.85, fontWeight: 700 }}
              paintOrder="stroke"
              stroke="white"
              strokeWidth={1}
            >
              {peso}
            </text>
          );
        })}

      {nodos.map((n) => {
        const p = pos.get(n.id)!;
        const e = estadoNodo(n.id);
        const r = radio(n.id);
        return (
          <g
            key={n.id}
            onClick={onToque ? () => onToque(n.id) : undefined}
            className={onToque ? "cursor-pointer" : undefined}
          >
            {/* Zona de toque más grande que la figura: un nodo de 2 unidades es menos
                que la yema de un dedo en un celular. */}
            {onToque && <circle cx={p.x} cy={p.y} r={Math.max(r + 1.5, 4)} fill="transparent" />}
            {n.tipo === "grupo" ? (
              <circle cx={p.x} cy={p.y} r={r} className={COLOR_GRUPO[e]} strokeWidth={0.5} />
            ) : (
              <rect
                x={p.x - r * 0.9}
                y={p.y - r * 0.9}
                width={r * 1.8}
                height={r * 1.8}
                rx={0.4}
                className={COLOR_OBJETO[e]}
                strokeWidth={0.5}
              />
            )}
          </g>
        );
      })}

      {/* Las etiquetas van en una capa propia, encima de todos los nodos. */}
      {nodos.map((n) => {
        const t = rotulo(n);
        const e = estadoNodo(n.id);
        return (
          <text
            key={`t-${n.id}`}
            x={t.x}
            y={t.y}
            textAnchor={t.anclaje}
            className={`${COLOR_TEXTO[e]} pointer-events-none`}
            style={{ fontSize: fuente, fontWeight: e === "foco" ? 700 : 500 }}
            paintOrder="stroke"
            stroke="white"
            strokeWidth={0.9}
          >
            {n.etiqueta}
          </text>
        );
      })}
    </svg>
  );
}

const COLOR_GRUPO = {
  foco: "fill-brand-500 stroke-brand-700",
  vecino: "fill-brand-200 stroke-brand-500",
  normal: "fill-brand-300 stroke-brand-600",
  apagado: "fill-stone-200 stroke-stone-300",
};
const COLOR_OBJETO = {
  foco: "fill-stone-700 stroke-stone-900",
  vecino: "fill-stone-400 stroke-stone-600",
  normal: "fill-stone-300 stroke-stone-500",
  apagado: "fill-stone-100 stroke-stone-300",
};
const COLOR_ARISTA = {
  foco: "stroke-brand-600",
  normal: "stroke-stone-400",
  apagado: "stroke-stone-200",
};
const COLOR_TEXTO = {
  foco: "fill-stone-900",
  vecino: "fill-stone-800",
  normal: "fill-stone-700",
  apagado: "fill-stone-300",
};
