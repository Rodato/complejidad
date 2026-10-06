"use client";

// Red grande en canvas con física D3, zoom y arrastre. Portada de RedRealCanvas.tsx del
// Taller 5 de 2026-I (y de su versión Streamlit en el parcial): mismas fuerzas, flechas
// vendedor → comprador con la punta en el comprador, rampa de calor y posiciones que se
// reutilizan al cambiar de año o de temporada, para que la red evolucione en vez de
// saltar. Cambios para el celular:
//   - tocar un actor lo selecciona (en el Taller 5 era hover con mouse);
//   - un dedo mueve la página, dos dedos mueven y acercan la red: si un dedo arrastrara
//     la red, el estudiante quedaría atrapado en ella sin poder bajar;
//   - botones + / − / Centrar, porque no todo el mundo sabe pellizcar un canvas;
//   - nombres fijos para unos pocos actores marcados, en coordenadas de pantalla y sin
//     pisarse.

import { useCallback, useEffect, useRef } from "react";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { pointer, select } from "d3-selection";
import "d3-transition";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";

export type NodoCanvas = { id: string; etiqueta: string; size: number; color: string };
export type AristaCanvas = { source: string; target: string };

type SNode = SimulationNodeDatum & NodoCanvas;
type SLink = SimulationLinkDatum<SNode>;

// Rampa de calor del Taller 5: poco = azul claro (discreto), mucho = rojo (salta).
const RAMPA: [number, number, number][] = [
  [186, 220, 250],
  [96, 165, 250],
  [245, 158, 11],
  [194, 30, 30],
];

/** Color de la rampa para un valor entre 0 y max (raíz, como en el Taller 5). */
export function colorCalor(v: number, max: number): string {
  const t = max > 0 ? Math.min(1, Math.sqrt(v / max)) : 0;
  const x = t * (RAMPA.length - 1);
  const i = Math.min(RAMPA.length - 2, Math.floor(x));
  const f = x - i;
  const a = RAMPA[i];
  const b = RAMPA[i + 1];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
}

/** Diámetro en píxeles: crece con la raíz para que los grandes no tapen la red. */
export function tamanoNodo(v: number, max: number, min = 7, extra = 26): number {
  return min + extra * Math.sqrt(max > 0 ? v / max : 0);
}

const MARCA = "#ad4a1f"; // brand-600

type Props = {
  nodos: NodoCanvas[];
  aristas: AristaCanvas[];
  dirigida?: boolean;
  /** Actores con el nombre siempre visible (en orden de prioridad). */
  marcados?: string[];
  /** Actor tocado: se resaltan él y sus vecinos. */
  seleccionado: string | null;
  onToque: (id: string | null) => void;
  /** Texto que acompaña al nombre en la etiqueta del tocado (p. ej. «3 compras»). */
  detalle?: (id: string) => string;
  alto?: number;
  /** Fuerzas: Poniente es más densa que Cali y necesita más repulsión. */
  distancia?: number;
  carga?: number;
  leyenda?: React.ReactNode;
  titulo: string;
};

export default function RedCanvas({
  nodos,
  aristas,
  dirigida = false,
  marcados = [],
  seleccionado,
  onToque,
  detalle,
  alto = 440,
  distancia = 38,
  carga = -70,
  leyenda,
  titulo,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Simulation<SNode, SLink> | null>(null);
  const nodesRef = useRef<SNode[]>([]);
  const linksRef = useRef<SLink[]>([]);
  const posRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const adjRef = useRef<Map<string, Set<string>>>(new Map());
  const transformRef = useRef<ZoomTransform>(zoomIdentity);
  const selRef = useRef<string | null>(seleccionado);
  const marcadosRef = useRef<string[]>(marcados);
  const detalleRef = useRef(detalle);
  const sizeRef = useRef({ w: 360, h: alto, dpr: 1 });
  const zoomRef = useRef<ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);
  const ajustarPendiente = useRef(true);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w, h, dpr } = sizeRef.current;
    const t = transformRef.current;
    const sel = selRef.current;
    const nb = sel ? (adjRef.current.get(sel) ?? new Set<string>()) : new Set<string>();
    const marc = new Set(marcadosRef.current);

    ctx.save();
    ctx.clearRect(0, 0, w * dpr, h * dpr);
    ctx.scale(dpr, dpr);
    ctx.translate(t.x, t.y);
    ctx.scale(t.k, t.k);

    for (const l of linksRef.current) {
      const s = l.source as SNode;
      const g = l.target as SNode;
      if (s?.x == null || g?.x == null) continue;
      const inc = sel ? s.id === sel || g.id === sel : false;
      const color = sel ? (inc ? "#0d9488" : "#eef2f6") : "#b8c2cf";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y!);
      ctx.lineTo(g.x, g.y!);
      ctx.strokeStyle = color;
      ctx.lineWidth = (inc ? 2.2 : 0.9) / t.k;
      ctx.stroke();
      if (!dirigida) continue;
      // Punta de flecha justo en el borde del comprador.
      const dx = g.x - s.x;
      const dy = g.y! - s.y!;
      const len = Math.hypot(dx, dy) || 1;
      const tipX = g.x - (dx / len) * (g.size / 2 + 0.5);
      const tipY = g.y! - (dy / len) * (g.size / 2 + 0.5);
      const ah = 7 / t.k;
      const ang = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - ah * Math.cos(ang - 0.42), tipY - ah * Math.sin(ang - 0.42));
      ctx.lineTo(tipX - ah * Math.cos(ang + 0.42), tipY - ah * Math.sin(ang + 0.42));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    for (const n of nodesRef.current) {
      if (n.x == null) continue;
      const dim = sel && n.id !== sel && !nb.has(n.id);
      ctx.globalAlpha = dim ? 0.2 : 1;
      ctx.beginPath();
      ctx.arc(n.x, n.y!, n.size / 2, 0, 2 * Math.PI);
      ctx.fillStyle = n.color;
      ctx.fill();
      const destacado = n.id === sel || marc.has(n.id);
      ctx.lineWidth = (destacado ? 2.5 : 1) / t.k;
      ctx.strokeStyle = n.id === sel ? "#1e3a8a" : destacado ? MARCA : "rgba(15,23,42,0.35)";
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Nombres en coordenadas de pantalla: nítidos a cualquier zoom.
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.textBaseline = "middle";
    const cajas: [number, number, number, number][] = [];
    const porId = new Map(nodesRef.current.map((n) => [n.id, n]));
    const choca = (x0: number, y0: number, x1: number, y1: number) =>
      cajas.some(([a, b, c, d]) => x0 < c && x1 > a && y0 < d && y1 > b);

    for (const id of marcadosRef.current) {
      const n = porId.get(id);
      if (!n || n.x == null || id === sel) continue;
      const sx = t.x + n.x * t.k;
      const sy = t.y + n.y! * t.k;
      ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
      const texto = n.etiqueta.length > 24 ? `${n.etiqueta.slice(0, 22)}…` : n.etiqueta;
      const tw = ctx.measureText(texto).width;
      const r = (n.size / 2) * t.k;
      // Abajo; si choca, arriba; si tampoco cabe, se omite.
      for (const dy of [r + 9, -r - 9]) {
        const x0 = Math.max(2, Math.min(w - tw - 2, sx - tw / 2));
        const y = sy + dy;
        if (y < 6 || y > h - 6 || choca(x0 - 2, y - 7, x0 + tw + 2, y + 7)) continue;
        cajas.push([x0 - 2, y - 7, x0 + tw + 2, y + 7]);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.strokeText(texto, x0, y);
        ctx.fillStyle = "#1c1917";
        ctx.fillText(texto, x0, y);
        break;
      }
    }

    // Etiqueta del tocado, con su detalle, como el tooltip del Taller 5.
    if (sel) {
      const n = porId.get(sel);
      if (n && n.x != null) {
        const sx = t.x + n.x * t.k;
        const sy = t.y + n.y! * t.k;
        const extra = detalleRef.current?.(sel);
        const texto = extra ? `${n.etiqueta} · ${extra}` : n.etiqueta;
        ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
        const tw = ctx.measureText(texto).width;
        const pad = 7;
        const bx = Math.max(4, Math.min(w - tw - 2 * pad - 4, sx - tw / 2 - pad));
        const by = Math.max(4, sy - (n.size / 2) * t.k - 28);
        ctx.fillStyle = "rgba(15,23,42,0.92)";
        redondeado(ctx, bx, by, tw + pad * 2, 20, 5);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText(texto, bx + pad, by + 10);
      }
    }
    ctx.restore();
  }, [dirigida]);

  // Las props que solo cambian el dibujo no reinician la física.
  useEffect(() => {
    selRef.current = seleccionado;
    marcadosRef.current = marcados;
    detalleRef.current = detalle;
    draw();
  }, [seleccionado, marcados, detalle, draw]);

  // Tamaño del canvas (responsive + pantallas de alta densidad).
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      sizeRef.current = { w, h, dpr };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const sim = simRef.current;
      if (sim) {
        (sim.force("x") as ReturnType<typeof forceX<SNode>>)?.x(w / 2);
        (sim.force("y") as ReturnType<typeof forceY<SNode>>)?.y(h / 2);
      }
      draw();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw]);

  // Zoom y arrastre. Con el dedo: uno mueve la página, dos mueven la red.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const z = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.1, 6])
      .filter((e: Event) => {
        if (e.type.startsWith("touch")) return (e as TouchEvent).touches.length >= 2;
        if (e.type === "wheel") return (e as WheelEvent).ctrlKey || (e as WheelEvent).metaKey;
        return !(e as MouseEvent).button;
      })
      .on("zoom", (e) => {
        transformRef.current = e.transform;
        draw();
      });
    zoomRef.current = z;
    select(canvas).call(z).on("dblclick.zoom", null);
    // d3-zoom pone touch-action: none; se devuelve el desplazamiento vertical a la página.
    canvas.style.touchAction = "pan-y";
    return () => {
      select(canvas).on(".zoom", null);
    };
  }, [draw]);

  const ajustar = useCallback(() => {
    const ns = nodesRef.current.filter((n) => n.x != null);
    const canvas = canvasRef.current;
    if (!ns.length || !canvas || !zoomRef.current) return;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const n of ns) {
      minX = Math.min(minX, n.x! - n.size / 2);
      minY = Math.min(minY, n.y! - n.size / 2);
      maxX = Math.max(maxX, n.x! + n.size / 2);
      maxY = Math.max(maxY, n.y! + n.size / 2);
    }
    const { w, h } = sizeRef.current;
    const k = Math.min(2, 0.9 * Math.min(w / Math.max(1, maxX - minX), h / Math.max(1, maxY - minY)));
    const t = zoomIdentity
      .translate(w / 2 - ((minX + maxX) / 2) * k, h / 2 - ((minY + maxY) / 2) * k)
      .scale(k);
    select(canvas).transition().duration(400).call(zoomRef.current.transform, t);
  }, []);

  const acercar = useCallback((f: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !zoomRef.current) return;
    select(canvas).transition().duration(250).call(zoomRef.current.scaleBy, f);
  }, []);

  // Datos → simulación. Reutiliza posiciones para que la red evolucione sin saltos.
  useEffect(() => {
    const { w, h } = sizeRef.current;
    const prev = posRef.current;
    const nodes: SNode[] = nodos.map((n) => {
      const p = prev.get(n.id);
      return {
        ...n,
        x: p?.x ?? w / 2 + (Math.random() - 0.5) * 240,
        y: p?.y ?? h / 2 + (Math.random() - 0.5) * 240,
      };
    });
    const links: SLink[] = aristas.map((a) => ({ source: a.source, target: a.target }));
    nodesRef.current = nodes;
    linksRef.current = links;

    const adj = new Map<string, Set<string>>();
    for (const a of aristas) {
      if (!adj.has(a.source)) adj.set(a.source, new Set());
      if (!adj.has(a.target)) adj.set(a.target, new Set());
      adj.get(a.source)!.add(a.target);
      adj.get(a.target)!.add(a.source);
    }
    adjRef.current = adj;
    // Cada cambio de temporada o de año vuelve a encuadrar la red, apenas se asienta: en el
    // celular, una red que se sale de la pantalla parece una red rota.
    ajustarPendiente.current = true;

    const tick = () => {
      for (const n of nodes) if (n.x != null && n.y != null) posRef.current.set(n.id, { x: n.x, y: n.y });
      // Dos encuadres: uno temprano, para no mostrar la red fuera de la pantalla, y otro
      // cuando ya casi no se mueve (las redes densas se expanden mientras se asientan).
      const alfa = sim!.alpha();
      if (ajustarPendiente.current && alfa < 0.25) {
        ajustarPendiente.current = false;
        ajustar();
      } else if (!ajustarPendiente.current && alfa < 0.04 && alfa > 0.035) {
        ajustar();
      }
      draw();
    };

    let sim = simRef.current;
    if (!sim) {
      sim = forceSimulation<SNode>(nodes)
        .force("link", forceLink<SNode, SLink>(links).id((d) => d.id).distance(distancia).strength(0.75))
        .force("charge", forceManyBody<SNode>().strength(carga).distanceMax(260))
        .force("x", forceX<SNode>(w / 2).strength(0.06))
        .force("y", forceY<SNode>(h / 2).strength(0.06))
        .force("collide", forceCollide<SNode>().radius((d) => d.size / 2 + 2));
      simRef.current = sim;
    } else {
      sim.nodes(nodes);
      (sim.force("link") as ReturnType<typeof forceLink<SNode, SLink>>).links(links);
    }
    sim.on("tick", tick);
    sim.on("end", ajustar);
    sim.alpha(0.85).restart();
  }, [nodos, aristas, draw, ajustar, distancia, carga]);

  useEffect(() => () => void simRef.current?.stop(), []);

  // Tocar un actor lo selecciona; tocar el vacío limpia la selección.
  const alTocar = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const [px, py] = pointer(e.nativeEvent, e.currentTarget);
      const t = transformRef.current;
      const gx = (px - t.x) / t.k;
      const gy = (py - t.y) / t.k;
      let encontrado: string | null = null;
      let mejor = Infinity;
      for (const n of nodesRef.current) {
        if (n.x == null) continue;
        const d = (n.x - gx) ** 2 + (n.y! - gy) ** 2;
        // Zona de toque de al menos 14 px de radio en pantalla: la yema de un dedo.
        const r = Math.max(n.size / 2 + 3, 14 / t.k);
        if (d < r * r && d < mejor) {
          mejor = d;
          encontrado = n.id;
        }
      }
      onToque(encontrado);
    },
    [onToque],
  );

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height: alto }}>
      <canvas
        ref={canvasRef}
        onClick={alTocar}
        role="img"
        aria-label={titulo}
        className="block cursor-grab active:cursor-grabbing"
      />
      <div className="absolute right-2 top-2 flex gap-1.5">
        <BotonMapa onClick={() => acercar(1.5)} etiqueta="Acercar">
          +
        </BotonMapa>
        <BotonMapa onClick={() => acercar(1 / 1.5)} etiqueta="Alejar">
          −
        </BotonMapa>
        <BotonMapa onClick={ajustar} etiqueta="Centrar la red">
          ⤢
        </BotonMapa>
      </div>
      {leyenda && (
        <div className="pointer-events-none absolute bottom-2 left-2 max-w-[85%] rounded-md border border-stone-200 bg-white/90 px-2.5 py-1.5 text-[11px] leading-snug text-stone-600">
          {leyenda}
        </div>
      )}
    </div>
  );
}

function BotonMapa({
  onClick,
  etiqueta,
  children,
}: {
  onClick: () => void;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 bg-white/95 text-lg leading-none text-stone-600 shadow-sm active:bg-stone-100"
    >
      {children}
    </button>
  );
}

/** Leyenda de la rampa de calor, como la del Taller 5. */
export function LeyendaCalor({ que, nota }: { que: string; nota?: string }) {
  return (
    <>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: "rgb(186,220,250)" }} />
        <span className="inline-block h-3 w-3 rounded-full" style={{ background: "rgb(245,158,11)" }} />
        <span className="inline-block h-4 w-4 rounded-full" style={{ background: "rgb(194,30,30)" }} />
        <span className="ml-1">{que}</span>
      </span>
      {nota && <span className="block text-stone-400">{nota}</span>}
    </>
  );
}

function redondeado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
