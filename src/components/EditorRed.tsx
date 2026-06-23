"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  addEdge,
  Background,
  ConnectionMode,
  Controls,
  Handle,
  MarkerType,
  NodeToolbar,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { construirGrafoSimple, PLANTILLAS } from "@/lib/red";
import type { Accion, GrafoSimple, Topologia } from "@/lib/tipos";

export type EstadoEditor = {
  grafo: GrafoSimple;
  acciones: Accion[];
  guardar: {
    nodos: { id: string; label: string }[];
    aristas: { source: string; target: string }[];
  };
};

const CLAVE_LS = "taller5-grafo";

// Contextos para que el nodo custom registre el renombrado en el log y en el historial.
const LogCtx = createContext<(tipo: Accion["tipo"], detalle: string) => void>(() => {});
const HistCtx = createContext<() => void>(() => {});

// ── Nodo custom "actor": renombrar (doble click), borrar (✕ al seleccionar) ──
function ActorEditorNode({ id, data, selected }: NodeProps) {
  const d = data as { label: string };
  const { updateNodeData, deleteElements } = useReactFlow();
  const log = useContext(LogCtx);
  const antesDeCambiar = useContext(HistCtx);
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(d.label);

  useEffect(() => setTexto(d.label), [d.label]);

  const commit = () => {
    setEditando(false);
    const v = texto.trim() || d.label;
    if (v !== d.label) {
      antesDeCambiar(); // el rename entra al historial (deshacer/rehacer)
      updateNodeData(id, { label: v });
      log("rename-nodo", `${id}: ${v}`);
    }
  };

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} offset={6}>
        <button
          onClick={() => deleteElements({ nodes: [{ id }] })}
          className="rounded-md bg-rose-600 px-2 py-0.5 text-xs font-medium text-white shadow hover:bg-rose-700"
          title="Borrar actor"
        >
          ✕ borrar
        </button>
      </NodeToolbar>
      {/* Ambos conectores son "source": con connectionMode=Loose la flecha sigue el
          SENTIDO DEL ARRASTRE (del nodo donde empiezas al nodo donde sueltas), sin
          importar qué conector se agarre. Así el estudiante decide la dirección. */}
      <Handle type="source" id="izq" position={Position.Left} className="rf-handle" />
      <div
        className="rf-nodo"
        onDoubleClick={() => setEditando(true)}
        title="Arrastra desde el borde hacia otro actor para crear un vínculo · doble click para renombrar"
      >
        {editando ? (
          <input
            autoFocus
            className="rf-nodo-input"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onBlur={commit}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setTexto(d.label);
                setEditando(false);
              }
            }}
          />
        ) : (
          d.label
        )}
      </div>
      <Handle type="source" id="der" position={Position.Right} className="rf-handle" />
    </>
  );
}

const nodeTypes = { actor: ActorEditorNode };

// Flecha vendedor → comprador (dirección de la cesión de la tierra).
const MARKER = { type: MarkerType.ArrowClosed, width: 16, height: 16, color: "#64748b" };
const defaultEdgeOptions = { markerEnd: MARKER };

type Snapshot = { nodes: Node[]; edges: Edge[] };

function Lienzo({ onCambio }: { onCambio: (e: EstadoEditor) => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  const contadorRef = useRef(1);
  const ordenRef = useRef(0);
  const accionesRef = useRef<Accion[]>([]);
  const pasadoRef = useRef<Snapshot[]>([]);
  const futuroRef = useRef<Snapshot[]>([]);
  const [puedeDeshacer, setPuedeDeshacer] = useState(false);
  const [puedeRehacer, setPuedeRehacer] = useState(false);
  const hidratadoRef = useRef(false);
  const guardarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const log = useCallback((tipo: Accion["tipo"], detalle: string) => {
    ordenRef.current += 1;
    accionesRef.current = [...accionesRef.current, { orden: ordenRef.current, tipo, detalle }];
  }, []);

  const snapshot = useCallback(
    (): Snapshot => ({ nodes: structuredClone(nodes), edges: structuredClone(edges) }),
    [nodes, edges],
  );
  const pushHistorial = useCallback(() => {
    pasadoRef.current = [...pasadoRef.current.slice(-49), snapshot()];
    futuroRef.current = [];
    setPuedeDeshacer(true);
    setPuedeRehacer(false);
  }, [snapshot]);

  // Rehidratar el trabajo guardado al montar.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAVE_LS);
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.nodes)) setNodes(s.nodes);
        if (Array.isArray(s.edges)) setEdges(s.edges);
        if (typeof s.contador === "number") contadorRef.current = s.contador;
        if (Array.isArray(s.acciones)) {
          accionesRef.current = s.acciones;
          ordenRef.current = s.acciones.reduce((m: number, a: Accion) => Math.max(m, a.orden), 0);
        }
      }
    } catch {}
    hidratadoRef.current = true;
  }, [setNodes, setEdges]);

  // Reportar al padre + autosave (debounced) en cada cambio.
  useEffect(() => {
    const grafo = construirGrafoSimple(
      nodes.map((n) => n.id),
      edges.map((e) => ({ source: e.source, target: e.target })),
    );
    onCambio({
      grafo,
      acciones: accionesRef.current,
      guardar: {
        nodos: nodes.map((n) => ({ id: n.id, label: String((n.data as { label?: string })?.label ?? n.id) })),
        aristas: edges.map((e) => ({ source: e.source, target: e.target })),
      },
    });

    if (!hidratadoRef.current) return;
    if (guardarTimer.current) clearTimeout(guardarTimer.current);
    guardarTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          CLAVE_LS,
          JSON.stringify({ nodes, edges, contador: contadorRef.current, acciones: accionesRef.current }),
        );
      } catch {}
    }, 400);
  }, [nodes, edges, onCambio]);

  const nuevoNodo = useCallback(
    (x: number, y: number) => {
      const id = `n${contadorRef.current}`;
      const label = `${contadorRef.current}`;
      contadorRef.current += 1;
      pushHistorial();
      setNodes((nds) => [
        ...nds,
        { id, position: { x, y }, data: { label }, type: "actor" },
      ]);
      log("add-nodo", `actor ${label}`);
    },
    [setNodes, log, pushHistorial],
  );

  const { screenToFlowPosition } = useReactFlow();

  // Evita crear un nodo FANTASMA cuando el "click" en el lienzo es en realidad la cola de
  // un arrastre de vínculo. React Flow resetea connectionInProgress en el pointerup (antes
  // de que dispare el click), así que su propio guard se escapa por timing y termina
  // llamando a onPaneClick. Marcamos el gesto al iniciar la conexión (onConnectStart) y lo
  // limpiamos en cada pointerdown nuevo sobre el lienzo (auto-sana si la conexión terminó
  // sobre un nodo y nunca hubo click de lienzo que lo consumiera).
  const gestoConexion = useRef(false);
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (gestoConexion.current) {
        gestoConexion.current = false;
        return; // fue el cierre de un vínculo, no un click para crear nodo
      }
      const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      nuevoNodo(pos.x, pos.y);
    },
    [screenToFlowPosition, nuevoNodo],
  );

  const onConnect = useCallback(
    (conn: Connection) => {
      if (conn.source === conn.target) return; // sin self-loops
      // dirigido: solo se bloquea el MISMO sentido (A→B y B→A son distintos)
      const dup = edges.some((e) => e.source === conn.source && e.target === conn.target);
      if (dup) return;
      // Efectos FUERA del updater (que debe ser puro; evita doble disparo en StrictMode).
      pushHistorial();
      log("add-arista", `${conn.source} → ${conn.target}`);
      setEdges((eds) => addEdge({ ...conn, animated: false, markerEnd: MARKER }, eds));
    },
    [edges, setEdges, log, pushHistorial],
  );

  // Nota: arrastrar un vínculo al vacío NO crea nada (nodos y vínculos están separados).
  // Los nodos se crean con click en el lienzo o el botón "+Actor"; los vínculos solo
  // arrastrando de un actor a otro, y la flecha sigue el sentido del arrastre.

  const onNodesDelete = useCallback(
    (b: Node[]) =>
      log("del-nodo", b.map((n) => (n.data as { label?: string })?.label ?? n.id).join(", ")),
    [log],
  );
  const onEdgesDelete = useCallback(
    (b: Edge[]) => log("del-arista", b.map((e) => `${e.source}→${e.target}`).join(", ")),
    [log],
  );

  // Capturar el estado ANTES de cualquier borrado (tecla Supr o botón ✕).
  const onBeforeDelete = useCallback(async () => {
    pushHistorial();
    return true;
  }, [pushHistorial]);

  const restaurar = useCallback(
    (s: Snapshot) => {
      setNodes(s.nodes);
      setEdges(s.edges);
    },
    [setNodes, setEdges],
  );

  const deshacer = useCallback(() => {
    const prev = pasadoRef.current[pasadoRef.current.length - 1];
    if (!prev) return;
    futuroRef.current = [...futuroRef.current, snapshot()];
    pasadoRef.current = pasadoRef.current.slice(0, -1);
    restaurar(prev);
    setPuedeDeshacer(pasadoRef.current.length > 0);
    setPuedeRehacer(true);
  }, [snapshot, restaurar]);

  const rehacer = useCallback(() => {
    const next = futuroRef.current[futuroRef.current.length - 1];
    if (!next) return;
    pasadoRef.current = [...pasadoRef.current, snapshot()];
    futuroRef.current = futuroRef.current.slice(0, -1);
    restaurar(next);
    setPuedeRehacer(futuroRef.current.length > 0);
    setPuedeDeshacer(true);
  }, [snapshot, restaurar]);

  // Atajos de teclado (ignora cuando se escribe en un input/textarea).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) rehacer();
        else deshacer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deshacer, rehacer]);

  const aplicarPlantilla = useCallback(
    (nombre: string, gen: () => Topologia) => {
      pushHistorial();
      const t = gen();
      setNodes(
        t.nodos.map((nd) => ({
          id: nd.id,
          position: { x: nd.x, y: nd.y },
          data: { label: nd.label },
          type: "actor",
        })),
      );
      setEdges(
        t.aristas.map((e) => ({ id: `${e.source}-${e.target}`, source: e.source, target: e.target, markerEnd: MARKER })),
      );
      contadorRef.current = t.nodos.length + 1;
      log("plantilla", nombre);
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 0);
    },
    [setNodes, setEdges, log, pushHistorial, fitView],
  );

  const limpiar = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) return;
    pushHistorial();
    setNodes([]);
    setEdges([]);
    log("limpiar", "");
  }, [setNodes, setEdges, log, pushHistorial, nodes.length, edges.length]);

  return (
    <LogCtx.Provider value={log}>
     <HistCtx.Provider value={pushHistorial}>
      <div className="flex flex-col gap-2 h-full">
        <Toolbar
          nNodos={nodes.length}
          nAristas={edges.length}
          onActor={() => nuevoNodo(240 + ((contadorRef.current * 47) % 220), 150 + ((contadorRef.current * 31) % 200))}
          onPlantilla={aplicarPlantilla}
          onCentrar={() => fitView({ padding: 0.2, duration: 300 })}
          onDeshacer={deshacer}
          onRehacer={rehacer}
          puedeDeshacer={puedeDeshacer}
          puedeRehacer={puedeRehacer}
          onLimpiar={limpiar}
        />
        <div
          className="relative flex-1 rounded-lg border border-slate-200 bg-white overflow-hidden"
          // En la fase de captura (antes de onConnectStart) limpia la marca: si el gesto
          // empieza en un conector, onConnectStart la volverá a poner; si empieza en el
          // lienzo o un nodo, queda limpia y el click sí crea nodo.
          onPointerDownCapture={() => {
            gestoConexion.current = false;
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={() => {
              gestoConexion.current = true;
            }}
            onPaneClick={onPaneClick}
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={defaultEdgeOptions}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            onBeforeDelete={onBeforeDelete}
            isValidConnection={(c) => c.source !== c.target}
            deleteKeyCode={["Backspace", "Delete"]}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#cbd5e1" gap={18} />
            <Controls showInteractive={false} />
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div className="pointer-events-none mt-16 flex flex-col items-center gap-1 text-center text-slate-500">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="opacity-50">
                    <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="18" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="9" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 7l8 1.5M8 8l1 8" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <p className="text-sm font-medium">Haz click en cualquier parte para crear tu primer actor</p>
                  <p className="text-xs">luego arrastra de un actor a otro para crear un vínculo</p>
                  <p className="text-xs text-slate-400">la flecha apunta hacia donde sueltas (vendedor → comprador)</p>
                  <p className="text-xs text-slate-400">o empieza con una plantilla de arriba</p>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>
     </HistCtx.Provider>
    </LogCtx.Provider>
  );
}

function Toolbar(props: {
  nNodos: number;
  nAristas: number;
  onActor: () => void;
  onPlantilla: (nombre: string, gen: () => Topologia) => void;
  onCentrar: () => void;
  onDeshacer: () => void;
  onRehacer: () => void;
  puedeDeshacer: boolean;
  puedeRehacer: boolean;
  onLimpiar: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <button onClick={props.onActor} className="btn btn-primary btn-sm">
        ＋ Actor
      </button>

      <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
        <span className="text-xs text-slate-500">Plantillas:</span>
        {PLANTILLAS.map((p) => (
          <button
            key={p.clave}
            onClick={() => props.onPlantilla(p.nombre, p.gen)}
            className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <span className="border-l border-slate-200 pl-3 text-xs text-slate-600">
        <span className="font-semibold text-slate-800">{props.nNodos}</span> nodos ·{" "}
        <span className="font-semibold text-slate-800">{props.nAristas}</span> aristas
      </span>

      <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
        <button onClick={props.onCentrar} className="btn-ghost btn btn-sm" title="Centrar">
          ⤢
        </button>
        <button
          onClick={props.onDeshacer}
          disabled={!props.puedeDeshacer}
          className="btn-ghost btn btn-sm"
          title="Deshacer (⌘Z)"
        >
          ↶
        </button>
        <button
          onClick={props.onRehacer}
          disabled={!props.puedeRehacer}
          className="btn-ghost btn btn-sm"
          title="Rehacer (⌘⇧Z)"
        >
          ↷
        </button>
      </div>

      <button onClick={props.onLimpiar} className="btn btn-secondary btn-sm ml-auto">
        Limpiar
      </button>
    </div>
  );
}

export default function EditorRed({ onCambio }: { onCambio: (e: EstadoEditor) => void }) {
  return (
    <ReactFlowProvider>
      <Lienzo onCambio={onCambio} />
    </ReactFlowProvider>
  );
}
