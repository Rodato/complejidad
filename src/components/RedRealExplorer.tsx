"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adyacencia, componentes, construirGrafoAcumulado, gradoEntrada } from "@/lib/red";
import type { AristaReal, GrafoSimple } from "@/lib/tipos";
import PanelDistribucion from "./PanelDistribucion";
import RedRealCanvas, { type VizArista, type VizNodo } from "./RedRealCanvas";

const ANIOS = [1938, 1939, 1940, 1941, 1943, 1944];
const ANIO_MIN = 1938;
const ANIO_MAX = 1944;
const ESCALA = [1938, 1939, 1940, 1941, 1942, 1943, 1944];

type Filtro = "todos" | "conectados" | "nucleos";
const FILTROS: { clave: Filtro; nombre: string; desc: string }[] = [
  {
    clave: "todos",
    nombre: "Toda la red",
    desc: "Todos los actores, incluidos los que solo aparecen en una transacción suelta.",
  },
  {
    clave: "conectados",
    nombre: "Conectados",
    desc: "Oculta a quienes solo transaron una vez (actores sueltos y pares aislados) y deja ver los grupos conectados de 3 o más actores.",
  },
  {
    clave: "nucleos",
    nombre: "Núcleos",
    desc: "Solo grupos de 4 o más actores conectados entre sí: los racimos más densos de la red.",
  },
];

// Rampa de calor por COMPRAS: pocas = azul claro (discreto), muchas = rojo (salta).
// La mayoría de actores compran 0-1 veces, así que el bulto queda suave y los
// acumuladores de tierra resaltan en rojo.
const RAMPA: [number, number, number][] = [
  [186, 220, 250], // azul claro — pocas compras
  [96, 165, 250], // azul
  [245, 158, 11], // ámbar
  [194, 30, 30], // rojo — muchas compras (acumula tierra)
];
function colorPorGrado(g: number, gMax: number): string {
  const t = gMax > 0 ? Math.min(1, Math.sqrt(g / gMax)) : 0;
  const x = t * (RAMPA.length - 1);
  const i = Math.min(RAMPA.length - 2, Math.floor(x));
  const f = x - i;
  const a = RAMPA[i];
  const b = RAMPA[i + 1];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
}

export default function RedRealExplorer() {
  const [edges, setEdges] = useState<AristaReal[]>([]);
  const [idx, setIdx] = useState(ANIOS.length - 1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [centrar, setCentrar] = useState(0);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    fetch("/data/red.json")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((d) => {
        if (!Array.isArray(d)) throw new Error("formato");
        setEdges(d);
      })
      .catch(() => setError("No se pudo cargar la red real."))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const anioMax = ANIOS[idx];

  // Grafo COMPLETO del año (el panel y las métricas siempre lo usan).
  const grafoAnio: GrafoSimple = useMemo(
    () => (edges.length ? construirGrafoAcumulado(edges, anioMax) : { nodos: [], aristas: [] }),
    [edges, anioMax],
  );

  const degIn = useMemo(() => gradoEntrada(grafoAnio), [grafoAnio]); // compras (métrica central)
  const comp = useMemo(() => componentes(grafoAnio), [grafoAnio]); // tamaño de componente (para los filtros)
  const adyAnio = useMemo(() => adyacencia(grafoAnio), [grafoAnio]);

  // Nodos/aristas visibles según el filtro estructural (solo afecta lo que se DIBUJA).
  const { vizNodos, vizAristas, nVis } = useMemo(() => {
    if (!grafoAnio.nodos.length) return { vizNodos: [] as VizNodo[], vizAristas: [] as VizArista[], nVis: 0 };
    const gMax = Math.max(1, ...degIn.values());
    const visible = (id: string) => {
      // "conectados": grupos de 3+ (oculta sueltos y pares de una sola transacción).
      // Filtrar por componente —no por grado— mantiene las estrellas/grupos COMPLETOS,
      // así sus aristas siempre se dibujan y ningún nodo queda visible pero suelto.
      if (filtro === "conectados") return (comp.get(id) ?? 1) >= 3;
      if (filtro === "nucleos") return (comp.get(id) ?? 1) >= 4;
      return true;
    };
    const visibles = new Set(grafoAnio.nodos.filter(visible));
    const vizNodos: VizNodo[] = [...visibles].map((id) => {
      const g = degIn.get(id) ?? 0; // tamaño/color por COMPRAS
      return { id, grado: g, size: 12 + g * 3, color: colorPorGrado(g, gMax) };
    });
    const vizAristas: VizArista[] = grafoAnio.aristas
      .filter((e) => visibles.has(e.source) && visibles.has(e.target))
      .map((e) => ({ source: e.source, target: e.target }));
    return { vizNodos, vizAristas, nVis: visibles.size };
  }, [grafoAnio, degIn, comp, filtro]);

  const hovered = hoverId
    ? {
        nombre: hoverId,
        compras: degIn.get(hoverId) ?? 0,
        vecinos: adyAnio.get(hoverId)?.size ?? 0,
      }
    : null;
  const filtroActivo = FILTROS.find((f) => f.clave === filtro)!;

  return (
    <div className="flex flex-col gap-4">
      <details className="group rounded-lg border border-slate-200 bg-white text-sm [&_summary]:list-none">
        <summary className="flex cursor-pointer items-center gap-1.5 px-4 py-2.5 font-medium text-brand-700">
          <svg
            className="h-3.5 w-3.5 transition-transform group-open:rotate-90"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M7 5l6 5-6 5V5z" />
          </svg>
          ¿Qué mide esto?
        </summary>
        <div className="space-y-2 border-t border-slate-100 px-4 py-3 leading-relaxed text-slate-600">
          <p>
            La flecha va del <strong>vendedor al comprador</strong>: sigue a la{" "}
            <strong>tierra</strong>, no al dinero. La punta cae en quien la recibe.
          </p>
          <p>
            El <strong>tamaño y color</strong> de cada actor son sus <strong>compras</strong>{" "}
            (cuántas veces adquirió tierra). Un nodo grande y rojo{" "}
            <strong>acumuló tierra</strong>; uno azul claro compró poco o solo vendió.
          </p>
          <p className="text-slate-500">
            No medimos dinero: si siguiéramos el dinero, la flecha iría al revés (del comprador
            al vendedor). Dos matices: comprar requiere capital, así que un gran acumulador
            seguramente también tenía dinero; y es la tierra que pasó por la Notaría 2 en
            1938–1944 (una sola notaría), un indicio de la concentración, no el total de
            propiedades de cada quien.
          </p>
        </div>
      </details>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label htmlFor="slider-anio" className="whitespace-nowrap text-sm font-medium text-slate-600">
              Año acumulado:
            </label>
            <input
              id="slider-anio"
              type="range"
              min={0}
              max={ANIOS.length - 1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              aria-label="Año acumulado"
              aria-valuetext={String(anioMax)}
              className="w-48 accent-brand-600 sm:w-64"
            />
            <span className="w-14 text-right font-mono text-lg font-semibold text-brand-700">
              {anioMax}
            </span>
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
            {FILTROS.map((f) => (
              <button
                key={f.clave}
                onClick={() => setFiltro(f.clave)}
                title={f.desc}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filtro === f.clave ? "bg-brand-600 text-white" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.nombre}
              </button>
            ))}
          </div>
        </div>

        <p className="-mt-1 text-xs text-slate-500">
          <span className="font-medium text-slate-600">{filtroActivo.nombre}:</span>{" "}
          {filtroActivo.desc}
        </p>

        {/* Escala de años (1942 sin datos) */}
        <div className="relative mx-1 h-4 text-[10px] text-slate-500">
          {ESCALA.map((a) => {
            const left = ((a - ANIO_MIN) / (ANIO_MAX - ANIO_MIN)) * 100;
            const falta = a === 1942;
            return (
              <span
                key={a}
                className={`absolute -translate-x-1/2 ${
                  falta ? "text-slate-300 line-through" : a === anioMax ? "font-semibold text-brand-700" : ""
                }`}
                style={{ left: `${left}%` }}
                title={falta ? "Sin datos: no se conserva el tomo de la Notaría de 1942" : undefined}
              >
                {a}
              </span>
            );
          })}
        </div>

        <div className="relative h-[540px] overflow-hidden rounded-lg border border-slate-200 bg-white">
          {cargando ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="text-sm">Cargando la red de la Notaría 2…</span>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
              <button onClick={cargar} className="btn btn-secondary btn-sm">
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <div
                className="absolute inset-0"
                role="img"
                aria-label={`Red de la Notaría 2 acumulada hasta ${anioMax}: ${grafoAnio.nodos.length} actores, ${grafoAnio.aristas.length} vínculos`}
              >
                <RedRealCanvas nodos={vizNodos} aristas={vizAristas} onHover={setHoverId} centrarSignal={centrar} />
              </div>

              <button
                onClick={() => setCentrar((c) => c + 1)}
                className="absolute right-3 top-3 z-10 rounded-md border border-slate-200 bg-white/90 px-2.5 py-1 text-xs text-slate-600 shadow-sm backdrop-blur hover:bg-white"
              >
                ⤢ Centrar
              </button>

              <div className="absolute bottom-3 left-3 z-10 rounded-md border border-slate-200 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-sm backdrop-blur">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: colorPorGrado(1, 7) }} />
                  <span className="inline-block rounded-full" style={{ width: 13, height: 13, background: colorPorGrado(3, 7) }} />
                  <span className="inline-block rounded-full" style={{ width: 18, height: 18, background: colorPorGrado(7, 7) }} />
                  <span className="ml-1">compras: pocas → muchas</span>
                </div>
                <div className="text-slate-400">cada círculo = un actor · la flecha va del vendedor al comprador</div>
              </div>

              {hovered && (
                <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md border border-slate-200 bg-white/90 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
                  <span className="font-semibold capitalize text-slate-800">{hovered.nombre}</span>
                  <span className="text-slate-500"> · {hovered.compras} compras · {hovered.vecinos} conexiones</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Notaría 2 acumulada hasta <span className="font-medium text-slate-700">{anioMax}</span> · mostrando{" "}
            <span className="font-medium text-slate-700">{nVis}</span> de {grafoAnio.nodos.length} actores
            {filtro !== "todos" && " (filtro visual; las métricas usan toda la red)"}
          </span>
          <span>Arrastra para mover, rueda para zoom. Saltamos de 1941 a 1943: falta el tomo de 1942.</span>
        </div>
      </div>

        <div className="card p-4">
          <PanelDistribucion grafo={grafoAnio} compacto />
        </div>
      </div>
    </div>
  );
}
