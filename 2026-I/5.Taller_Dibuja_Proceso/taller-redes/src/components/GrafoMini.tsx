"use client";

import { useMemo } from "react";
import { Background, MarkerType, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { construirGrafoSimple, gradoEntrada } from "@/lib/red";
import { calcularPosiciones } from "@/lib/layout";

export default function GrafoMini({
  nodos,
  aristas,
  alto = 260,
  tamFuente = 9,
}: {
  nodos: { id: string; label: string }[];
  aristas: { source: string; target: string }[];
  alto?: number;
  tamFuente?: number;
}) {
  const { rfNodes, rfEdges } = useMemo(() => {
    const grafo = construirGrafoSimple(
      nodos.map((n) => n.id),
      aristas,
    );
    const deg = gradoEntrada(grafo);
    const gMax = Math.max(1, ...deg.values());
    const pos = calcularPosiciones(grafo, { ancho: 500, alto, iteraciones: 200 });
    const base = tamFuente <= 10 ? 14 : 18;
    const rfNodes: Node[] = grafo.nodos.map((id) => {
      const g = deg.get(id) ?? 0;
      const t = g / gMax;
      const size = base + g * (tamFuente <= 10 ? 3 : 4);
      return {
        id,
        position: pos.get(id) ?? { x: 0, y: 0 },
        data: { label: nodos.find((n) => n.id === id)?.label ?? id },
        draggable: false,
        selectable: false,
        connectable: false,
        style: {
          width: size,
          height: size,
          borderRadius: "50%",
          fontSize: tamFuente,
          padding: 0,
          background: `rgb(${Math.round(186 - t * 150)},${Math.round(220 - t * 120)},${Math.round(255 - t * 70)})`,
          border: "1px solid rgba(15,23,42,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      };
    });
    const rfEdges: Edge[] = grafo.aristas.map((e, i) => ({
      id: `e${i}`,
      source: e.source,
      target: e.target,
      style: { stroke: "#94a3b8", strokeWidth: 1 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "#94a3b8" },
      selectable: false,
    }));
    return { rfNodes, rfEdges };
  }, [nodos, aristas, alto, tamFuente]);

  return (
    <div style={{ height: alto }} className="rounded-lg border border-slate-200 bg-white">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#eef2f7" gap={16} />
      </ReactFlow>
    </div>
  );
}
