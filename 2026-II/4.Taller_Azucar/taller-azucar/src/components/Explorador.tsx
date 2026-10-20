"use client";

import { useMemo, useState } from "react";
import Grafo, { type AristaGrafo, type NodoGrafo } from "./Grafo";
import { Lienzo, Opciones, Selector } from "./ui";
import { caminosMasCortos, caminosQuePasan, crearRed, fmt, grado, intermediacion } from "@/lib/red";

type Tamano = "igual" | "grado" | "intermediacion";

/**
 * Una red con todo lo que el estudiante necesita para leerla: tocar un nodo (ficha con
 * grado, vecinos e intermediación), buscar los caminos más cortos entre dos nodos y
 * abrir la tabla de medidas. Las medidas no se muestran de entrada: primero se mira.
 */
export default function Explorador({
  nodos,
  aristas,
  proporcion,
  titulo,
  pie,
  fuente,
  mostrarPesos = false,
  /** En la tabla, usar el nombre completo (para la red de personas, cuya etiqueta es A1, B3…). */
  tablaConNombre = false,
}: {
  nodos: NodoGrafo[];
  aristas: AristaGrafo[];
  proporcion: number;
  titulo: string;
  pie?: React.ReactNode;
  fuente?: number;
  mostrarPesos?: boolean;
  tablaConNombre?: boolean;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tamano, setTamano] = useState<Tamano>("igual");
  const [tabla, setTabla] = useState(false);

  const medidas = useMemo(() => {
    const red = crearRed(
      nodos.map((n) => n.id),
      aristas,
    );
    return {
      red,
      grado: grado(red),
      inter: intermediacion(red),
      pasan: caminosQuePasan(red),
    };
  }, [nodos, aristas]);

  const porId = useMemo(() => new Map(nodos.map((n) => [n.id, n])), [nodos]);
  const etiqueta = (id: string) => porId.get(id)?.etiqueta ?? id;
  const nombreTabla = (n: NodoGrafo) => (tablaConNombre ? n.nombre : n.etiqueta);

  const tamanos = useMemo(() => {
    if (tamano === "igual") return undefined;
    const v = tamano === "grado" ? medidas.grado : medidas.inter;
    const max = Math.max(...Object.values(v), 1e-9);
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x / max]));
  }, [tamano, medidas]);

  const caminos = useMemo(
    () => (desde && hasta && desde !== hasta ? caminosMasCortos(medidas.red, desde, hasta) : []),
    [desde, hasta, medidas.red],
  );

  function tocar(id: string) {
    setDesde("");
    setHasta("");
    setSel((s) => (s === id ? null : id));
  }

  const opcionesNodo = nodos.map((n) => ({ clave: n.id, nombre: nombreTabla(n) }));
  const nodoSel = sel ? porId.get(sel) : null;
  const vecinosSel = sel
    ? aristas
        .filter((x) => x.a === sel || x.b === sel)
        .map((x) => ({ id: x.a === sel ? x.b : x.a, nota: x.nota }))
        .sort((p, q) => etiqueta(p.id).localeCompare(etiqueta(q.id), "es"))
    : [];

  const filas = [...nodos].sort(
    (p, q) =>
      medidas.inter[q.id] - medidas.inter[p.id] ||
      medidas.grado[q.id] - medidas.grado[p.id] ||
      p.etiqueta.localeCompare(q.etiqueta, "es"),
  );

  return (
    <div>
      <Lienzo pie={pie}>
        <Grafo
          nodos={nodos}
          aristas={aristas}
          proporcion={proporcion}
          seleccionado={sel}
          caminos={caminos}
          tamanos={tamanos}
          mostrarPesos={mostrarPesos}
          fuente={fuente}
          onToque={tocar}
          titulo={titulo}
        />
      </Lienzo>

      {nodoSel ? (
        <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[15px] font-semibold text-stone-900">{nodoSel.nombre}</p>
            <button
              onClick={() => setSel(null)}
              aria-label="Cerrar ficha"
              className="shrink-0 px-1 text-stone-500 hover:text-stone-800"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 text-sm text-stone-700">
            Grado: <strong>{medidas.grado[nodoSel.id]}</strong>
          </p>
          {vecinosSel.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 text-sm text-stone-700">
              {vecinosSel.map((v) => (
                <li key={v.id}>
                  · {porId.get(v.id)?.nombre ?? v.id}
                  {v.nota && <span className="text-stone-500"> — comparten: {v.nota}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="mb-4 text-sm leading-relaxed text-stone-500">
          Toca un nodo para ver con quién está unido. Vuelve a tocarlo para soltarlo.
        </p>
      )}

      <div className="mb-4">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Tamaño de los nodos según
        </p>
        <Opciones
          opciones={[
            { clave: "igual", nombre: "Igual" },
            { clave: "grado", nombre: "Grado" },
            { clave: "intermediacion", nombre: "Intermediación" },
          ]}
          valor={tamano}
          onChange={setTamano}
        />
      </div>

      <div className="mb-4 rounded-lg border border-stone-200 bg-stone-50 p-3.5">
        <p className="text-sm font-semibold text-stone-800">Caminos más cortos entre dos nodos</p>
        <div className="mt-2 flex gap-2">
          <Selector
            label="Desde"
            valor={desde}
            onChange={(v) => {
              setSel(null);
              setDesde(v);
            }}
            opciones={opcionesNodo}
          />
          <Selector
            label="Hasta"
            valor={hasta}
            onChange={(v) => {
              setSel(null);
              setHasta(v);
            }}
            opciones={opcionesNodo}
          />
        </div>
        {desde && hasta && desde !== hasta && (
          <div className="mt-2.5 text-sm text-stone-700">
            {caminos.length === 0 ? (
              <p>No hay camino entre esos dos nodos.</p>
            ) : (
              <>
                <p>
                  {caminos.length === 1
                    ? "Hay 1 camino más corto"
                    : `Hay ${caminos.length} caminos más cortos`}
                  , de {caminos[0].length - 1} paso{caminos[0].length - 1 === 1 ? "" : "s"}:
                </p>
                <ol className="mt-1 space-y-0.5">
                  {caminos.map((c, i) => (
                    <li key={i} className="font-medium text-stone-800">
                      {c.map(etiqueta).join(" → ")}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        )}
      </div>

      <button onClick={() => setTabla((t) => !t)} className="btn btn-secondary mb-3 w-full">
        {tabla ? "Ocultar la tabla de medidas" : "Ver la tabla de medidas"}
      </button>

      {tabla && (
        <div className="mb-4 overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Nodo</th>
                <th className="px-2 py-2 text-right font-semibold">Grado</th>
                <th className="px-2 py-2 text-right font-semibold">Intermed.</th>
                <th className="px-3 py-2 text-right font-semibold">Caminos que pasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filas.map((n) => (
                <tr key={n.id} className={n.id === sel ? "bg-brand-50" : undefined}>
                  <td className="px-3 py-1.5 text-stone-800">{nombreTabla(n)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{medidas.grado[n.id]}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{fmt(medidas.inter[n.id])}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{medidas.pasan.porNodo[n.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-stone-100 bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-500">
            {medidas.pasan.pares} pares de nodos conectados, unidos por {medidas.pasan.caminos} caminos
            más cortos en total. Ordenada de mayor a menor intermediación.
          </p>
        </div>
      )}
    </div>
  );
}
