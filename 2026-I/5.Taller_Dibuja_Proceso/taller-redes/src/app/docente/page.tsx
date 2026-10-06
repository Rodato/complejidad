"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import GrafoMini from "@/components/GrafoMini";
import { COLUMNAS } from "@/lib/columnas";
import { claveDesdeEtiqueta, COLOR_REGIMEN, HEX_REGIMEN } from "@/lib/regimen-ui";
import type { ClaveRegimen } from "@/lib/tipos";

type Respuesta = Record<string, string>;
const SS_CLAVE = "taller5-docente-clave";
const INTERVALO_MS = 15000;

function claveDeFila(f: Respuesta): ClaveRegimen {
  return (f.regimen_clave as ClaveRegimen) || claveDesdeEtiqueta(f.regimen);
}

export default function Docente() {
  const [clave, setClave] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [filas, setFilas] = useState<Respuesta[]>([]);
  const [origen, setOrigen] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [autoRefrescar, setAutoRefrescar] = useState(true);
  const [ultima, setUltima] = useState<Date | null>(null);
  const claveRef = useRef("");

  const cargar = useCallback(
    async (c: string, opts: { silencioso?: boolean } = {}) => {
      if (!opts.silencioso) setCargando(true);
      try {
        const r = await fetch("/api/respuestas", { headers: { "x-clave": c } });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error ?? "Error");
        setFilas(data.filas);
        setOrigen(data.origen);
        setAutorizado(true);
        setError("");
        setUltima(new Date());
        claveRef.current = c;
        try {
          sessionStorage.setItem(SS_CLAVE, c);
        } catch {}
      } catch (e) {
        if (!autorizado) setError((e as Error).message);
        else setError(`No se pudo actualizar: ${(e as Error).message}`);
      } finally {
        if (!opts.silencioso) setCargando(false);
      }
    },
    [autorizado],
  );

  // Reautorizar al montar si hay clave guardada.
  useEffect(() => {
    try {
      const guardada = sessionStorage.getItem(SS_CLAVE);
      if (guardada) cargar(guardada);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresco silencioso.
  useEffect(() => {
    if (!autorizado || !autoRefrescar) return;
    const t = setInterval(() => cargar(claveRef.current, { silencioso: true }), INTERVALO_MS);
    return () => clearInterval(t);
  }, [autorizado, autoRefrescar, cargar]);

  const conteoRegimen = useMemo(() => {
    const m = new Map<ClaveRegimen, number>();
    for (const f of filas) {
      const k = claveDeFila(f);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    const total = filas.length || 1;
    const etiquetas: Record<ClaveRegimen, string> = {
      campana: "Campana",
      intermedio: "Intermedio",
      "cola-larga": "Cola larga",
      vacio: "Sin forma",
    };
    return (["campana", "intermedio", "cola-larga", "vacio"] as ClaveRegimen[])
      .map((k) => ({ clave: k, regimen: etiquetas[k], n: m.get(k) ?? 0, pct: Math.round(((m.get(k) ?? 0) / total) * 100) }))
      .filter((d) => d.n > 0);
  }, [filas]);

  function exportarCSV() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lineas = [COLUMNAS.map(esc).join(",")];
    for (const f of filas) lineas.push(COLUMNAS.map((c) => esc(f[c])).join(","));
    const blob = new Blob([lineas.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taller5_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!autorizado) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard docente</h1>
        <p className="mb-5 text-sm text-slate-500">Taller 5 · Notaría 2</p>
        <input
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && cargar(clave)}
          placeholder="Contraseña"
          className="field"
        />
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        <button onClick={() => cargar(clave)} disabled={cargando} className="btn btn-primary mt-3 w-full">
          {cargando ? "Entrando…" : "Entrar"}
        </button>
      </div>
    );
  }

  const idFila = (f: Respuesta) => `${f.codigo}-${f.timestamp}`;
  const filaSel = sel ? filas.find((f) => idFila(f) === sel) : null;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard docente</h1>
          <p className="text-base text-slate-500">
            {filas.length} respuestas · fuente <span className="font-mono">{origen}</span>
            {ultima && <> · actualizado {ultima.toLocaleTimeString("es-CO")}</>}
            {cargando && <span className="ml-2 text-slate-400">actualizando…</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefrescar((v) => !v)}
            className={`btn btn-sm ${autoRefrescar ? "btn-secondary text-emerald-700" : "btn-secondary"}`}
            title="Auto-refresco cada 15s"
          >
            {autoRefrescar ? "● En vivo" : "⏸ Pausado"}
          </button>
          <button onClick={() => cargar(claveRef.current)} className="btn btn-secondary btn-sm">
            ↻ Refrescar
          </button>
          <button onClick={exportarCSV} className="btn btn-secondary btn-sm">
            ⤓ CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          {error} (mostrando datos de {ultima?.toLocaleTimeString("es-CO") ?? "antes"})
        </div>
      )}

      {filas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-24 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-slate-300">
            <circle cx="6" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="10" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 8l7 1.5M8.5 9l1.5 6" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <p className="text-xl font-medium text-slate-500">Esperando las primeras respuestas…</p>
          <p className="text-sm text-slate-400">La pantalla se actualiza sola cada 15 segundos.</p>
        </div>
      ) : (
        <>
          <section className="mb-8 card p-5">
            <h2 className="eyebrow mb-3">¿A qué régimen llegó la clase?</h2>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conteoRegimen} margin={{ top: 20, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="regimen" tick={{ fontSize: 14 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
                  <Tooltip formatter={(v) => [`${v} estudiantes`, "régimen"]} />
                  <Bar dataKey="n" radius={[4, 4, 0, 0]}>
                    {conteoRegimen.map((d) => (
                      <Cell key={d.clave} fill={HEX_REGIMEN[d.clave]} />
                    ))}
                    <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 13 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <div className="card overflow-hidden">
              <div className="max-h-[620px] overflow-auto">
                <table className="w-full text-base">
                  <thead className="sticky top-0 bg-slate-100 text-left text-sm text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5">Estudiante</th>
                      <th className="px-4 py-2.5">Régimen</th>
                      <th className="px-4 py-2.5">n/m</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((f) => (
                      <tr
                        key={idFila(f)}
                        onClick={() => setSel(idFila(f))}
                        className={`cursor-pointer border-t border-slate-100 hover:bg-brand-50 ${
                          sel === idFila(f) ? "bg-brand-50" : ""
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-slate-700">{f.nombre}</div>
                          <div className="font-mono text-xs text-slate-400">{f.codigo}</div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full border px-2 py-0.5 text-xs ${COLOR_REGIMEN[claveDeFila(f)]}`}>
                            {f.regimen}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-sm">
                          {f.n_nodos}/{f.n_aristas}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-5">
              {!filaSel ? (
                <p className="text-base text-slate-400">
                  Selecciona un estudiante para ver su red y su narrativa.
                </p>
              ) : (
                <FichaEstudiante fila={filaSel} />
              )}
            </div>
          </section>
        </>
      )}

      <footer className="mt-12 border-t border-slate-200/60 py-6 text-center text-xs text-slate-500">
        Introducción a la Complejidad · Universidad del Valle · Daniel Otero
      </footer>
    </main>
  );
}

function FichaEstudiante({ fila }: { fila: Respuesta }) {
  let grafo: { nodos: { id: string; label: string }[]; aristas: { source: string; target: string }[] } = {
    nodos: [],
    aristas: [],
  };
  try {
    grafo = JSON.parse(fila.grafo || "{}");
  } catch {}
  const clave = claveDeFila(fila);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-xl font-semibold text-slate-800">{fila.nombre}</h3>
        <p className="font-mono text-sm text-slate-400">{fila.codigo}</p>
        {fila.companeros && <p className="mt-1 text-sm text-slate-500">Grupo: {fila.companeros}</p>}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className={`rounded-full border px-2.5 py-1 ${COLOR_REGIMEN[clave]}`}>{fila.regimen}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1">
          {fila.n_nodos} actores · {fila.n_aristas} vínculos
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1">grado máx {fila.grado_max}</span>
      </div>

      <GrafoMini nodos={grafo.nodos ?? []} aristas={grafo.aristas ?? []} tamFuente={13} alto={300} />

      <div>
        <h4 className="eyebrow">Narrativa</h4>
        <p className="mt-1 whitespace-pre-wrap text-base text-slate-700">
          {fila.narrativa || "(sin narrativa)"}
        </p>
      </div>
    </div>
  );
}
