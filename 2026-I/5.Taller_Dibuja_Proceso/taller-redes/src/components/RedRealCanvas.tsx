"use client";

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
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";

export type VizNodo = { id: string; grado: number; size: number; color: string };
export type VizArista = { source: string; target: string };

type SNode = SimulationNodeDatum & VizNodo;
type SLink = SimulationLinkDatum<SNode>;

export default function RedRealCanvas({
  nodos,
  aristas,
  onHover,
  centrarSignal,
}: {
  nodos: VizNodo[];
  aristas: VizArista[];
  onHover: (id: string | null) => void;
  centrarSignal: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Simulation<SNode, SLink> | null>(null);
  const nodesRef = useRef<SNode[]>([]);
  const linksRef = useRef<SLink[]>([]);
  const posRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const adjRef = useRef<Map<string, Set<string>>>(new Map());
  const transformRef = useRef<ZoomTransform>(zoomIdentity);
  const hoverRef = useRef<string | null>(null);
  const neighborRef = useRef<Set<string>>(new Set());
  const sizeRef = useRef({ w: 800, h: 540, dpr: 1 });
  const zoomRef = useRef<ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);
  const ajustadoRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w, h, dpr } = sizeRef.current;
    const t = transformRef.current;
    const hov = hoverRef.current;
    const nb = neighborRef.current;

    ctx.save();
    ctx.clearRect(0, 0, w * dpr, h * dpr);
    ctx.scale(dpr, dpr);
    ctx.translate(t.x, t.y);
    ctx.scale(t.k, t.k);

    // aristas dirigidas (vendedor → comprador) con punta de flecha en el target
    for (const l of linksRef.current) {
      const s = l.source as SNode;
      const g = l.target as SNode;
      if (s?.x == null || g?.x == null) continue;
      const inc = hov ? s.id === hov || g.id === hov : false;
      const color = hov ? (inc ? "#0d9488" : "#e8edf3") : "#94a3b8";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y!);
      ctx.lineTo(g.x, g.y!);
      ctx.strokeStyle = color;
      ctx.lineWidth = (inc ? 2.2 : 1) / t.k;
      ctx.stroke();
      // punta de flecha justo en el borde del nodo comprador
      const dx = g.x - s.x;
      const dy = g.y! - s.y!;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const tipX = g.x - ux * (g.size / 2 + 0.5);
      const tipY = g.y! - uy * (g.size / 2 + 0.5);
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

    // nodos
    for (const n of nodesRef.current) {
      if (n.x == null) continue;
      const r = n.size / 2;
      const dim = hov && n.id !== hov && !nb.has(n.id);
      ctx.globalAlpha = dim ? 0.25 : 1;
      ctx.beginPath();
      ctx.arc(n.x, n.y!, r, 0, 2 * Math.PI);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.lineWidth = (n.id === hov ? 2 : 1) / t.k;
      ctx.strokeStyle = n.id === hov ? "#1e3a8a" : "rgba(15,23,42,0.4)";
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // etiqueta del nodo bajo el cursor, en coordenadas de pantalla (nítida)
    if (hov) {
      const n = nodesRef.current.find((x) => x.id === hov);
      if (n && n.x != null) {
        const sx = t.x + n.x * t.k;
        const sy = t.y + n.y! * t.k;
        const texto = n.id;
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
        const tw = ctx.measureText(texto).width;
        const pad = 6;
        const bx = sx - tw / 2 - pad;
        const by = sy - n.size / 2 - 26;
        ctx.fillStyle = "rgba(15,23,42,0.92)";
        roundRect(ctx, bx, by, tw + pad * 2, 20, 5);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.textBaseline = "middle";
        ctx.fillText(texto, bx + pad, by + 10);
        ctx.restore();
      }
    }
  }, []);

  // Tamaño del canvas (responsive + HiDPI)
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

  // Zoom / pan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const z = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.15, 4])
      .on("zoom", (e) => {
        transformRef.current = e.transform;
        draw();
      });
    zoomRef.current = z;
    select(canvas).call(z);
    return () => {
      select(canvas).on(".zoom", null);
    };
  }, [draw]);

  const ajustar = useCallback(() => {
    const ns = nodesRef.current.filter((n) => n.x != null);
    const canvas = canvasRef.current;
    if (!ns.length || !canvas || !zoomRef.current) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of ns) {
      minX = Math.min(minX, n.x!);
      minY = Math.min(minY, n.y!);
      maxX = Math.max(maxX, n.x!);
      maxY = Math.max(maxY, n.y!);
    }
    const { w, h } = sizeRef.current;
    const gw = Math.max(1, maxX - minX);
    const gh = Math.max(1, maxY - minY);
    const k = Math.min(2, 0.85 * Math.min(w / gw, h / gh));
    const tx = w / 2 - ((minX + maxX) / 2) * k;
    const ty = h / 2 - ((minY + maxY) / 2) * k;
    const t = zoomIdentity.translate(tx, ty).scale(k);
    select(canvas).transition().duration(400).call(zoomRef.current.transform, t);
  }, []);

  // Datos → simulación (reusa posiciones para continuidad entre años)
  useEffect(() => {
    if (!nodos.length) {
      nodesRef.current = [];
      linksRef.current = [];
      draw();
      return;
    }
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

    const tick = () => {
      for (const n of nodes) if (n.x != null && n.y != null) posRef.current.set(n.id, { x: n.x, y: n.y });
      draw();
    };

    let sim = simRef.current;
    if (!sim) {
      sim = forceSimulation<SNode>(nodes)
        .force("link", forceLink<SNode, SLink>(links).id((d) => d.id).distance(38).strength(0.75))
        .force("charge", forceManyBody<SNode>().strength(-70).distanceMax(260))
        .force("x", forceX<SNode>(w / 2).strength(0.06))
        .force("y", forceY<SNode>(h / 2).strength(0.06))
        .force("collide", forceCollide<SNode>().radius((d) => d.size / 2 + 2));
      simRef.current = sim;
    } else {
      sim.nodes(nodes);
      (sim.force("link") as ReturnType<typeof forceLink<SNode, SLink>>).links(links);
    }
    sim.on("tick", tick);
    sim.on("end", () => {
      if (!ajustadoRef.current) {
        ajustadoRef.current = true;
        ajustar();
      }
    });
    sim.alpha(0.85).restart();
  }, [nodos, aristas, draw, ajustar]);

  // Botón "Centrar"
  useEffect(() => {
    if (centrarSignal > 0) ajustar();
  }, [centrarSignal, ajustar]);

  // Hover
  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const t = transformRef.current;
      const gx = (e.clientX - rect.left - t.x) / t.k;
      const gy = (e.clientY - rect.top - t.y) / t.k;
      let found: string | null = null;
      let best = Infinity;
      for (const n of nodesRef.current) {
        if (n.x == null) continue;
        const dx = n.x - gx;
        const dy = n.y! - gy;
        const d = dx * dx + dy * dy;
        const r = n.size / 2 + 3;
        if (d < r * r && d < best) {
          best = d;
          found = n.id;
        }
      }
      if (found !== hoverRef.current) {
        hoverRef.current = found;
        neighborRef.current = found ? adjRef.current.get(found) ?? new Set() : new Set();
        onHover(found);
        draw();
      }
    },
    [draw, onHover],
  );

  const onLeave = useCallback(() => {
    if (hoverRef.current !== null) {
      hoverRef.current = null;
      neighborRef.current = new Set();
      onHover(null);
      draw();
    }
  }, [draw, onHover]);

  return (
    <div ref={wrapRef} className="h-full w-full">
      <canvas
        ref={canvasRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="block cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
