"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { distribucionGrado, estadisticasGrado, regimen } from "@/lib/red";
import { COLOR_REGIMEN } from "@/lib/regimen-ui";
import type { ClaveRegimen, GrafoSimple, Regimen } from "@/lib/tipos";

const BRAND = "#2563eb";
const C_CAMPANA = "#0ea5e9";
const C_COLA = "#e11d48";

export default function PanelDistribucion({
  grafo,
  compacto = false,
  onRegimen,
}: {
  grafo: GrafoSimple;
  compacto?: boolean;
  onRegimen?: (r: Regimen) => void;
}) {
  const [loglog, setLoglog] = useState(false);
  const kMaxRef = useRef(8); // kMax "pegajoso": evita que las barras se re-monten
  const previaRef = useRef<ClaveRegimen | undefined>(undefined);

  const stats = useMemo(() => estadisticasGrado(grafo), [grafo]);
  kMaxRef.current = Math.max(kMaxRef.current, stats.gradoMax);

  const datos = useMemo(() => distribucionGrado(grafo, kMaxRef.current), [grafo, stats.gradoMax]);
  const reg = useMemo(() => {
    const r = regimen(grafo, previaRef.current);
    previaRef.current = r.clave;
    return r;
  }, [grafo]);

  // Eleva el régimen al padre para que el valor guardado sea EXACTAMENTE el que ve
  // el estudiante (misma histéresis), no uno recalculado sin contexto.
  useEffect(() => {
    onRegimen?.(reg);
  }, [reg, onRegimen]);

  const datosLog = useMemo(() => datos.filter((d) => d.grado > 0 && d.conteo > 0), [datos]);

  // Resaltar la curva de referencia del régimen activo.
  const enfasisPoisson = reg.clave === "campana" ? 1 : reg.clave === "cola-larga" ? 0.28 : 0.7;
  const enfasisPotencia = reg.clave === "cola-larga" ? 1 : reg.clave === "campana" ? 0.28 : 0.7;
  const grosorPoisson = reg.clave === "campana" ? 2.6 : 1.5;
  const grosorPotencia = reg.clave === "cola-larga" ? 2.6 : 1.5;

  // Recta de referencia (pendiente de cola larga) para el log-log.
  const segLog = useMemo<[{ x: number; y: number }, { x: number; y: number }] | null>(() => {
    if (datosLog.length < 2) return null;
    const k0 = datosLog[0].grado;
    const c0 = datosLog[0].conteo;
    const kN = Math.max(...datosLog.map((d) => d.grado));
    return [
      { x: k0, y: c0 },
      { x: kN, y: Math.max(0.5, c0 * Math.pow(kN / k0, -2.5)) },
    ];
  }, [datosLog]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="eyebrow">Distribución de compras</h3>
        <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={loglog}
            onChange={(e) => setLoglog(e.target.checked)}
            className="accent-brand-600"
          />
          Escala log-log
        </label>
      </div>

      <div
        style={{ height: compacto ? 210 : 270 }}
        role="img"
        aria-label={`Distribución de grado: ${stats.n} actores, grado máximo ${stats.gradoMax}, régimen ${reg.etiqueta}`}
      >
        {loglog && datosLog.length < 3 ? (
          <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 px-6 text-center text-sm text-slate-500">
            Necesitas grados más variados para que el log-log tenga sentido — prueba la
            plantilla <em className="mx-1">Crecimiento</em>.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {loglog ? (
              <ScatterChart margin={{ top: 10, right: 14, bottom: 26, left: 14 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="grado"
                  name="grado"
                  scale="log"
                  domain={[1, "dataMax"]}
                  ticks={[1, 2, 3, 5, 8, 13, 21]}
                  allowDataOverflow
                  tick={{ fontSize: 11 }}
                  label={{ value: "compras (log)", position: "bottom", fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="conteo"
                  name="actores"
                  scale="log"
                  domain={[1, "dataMax"]}
                  ticks={[1, 2, 3, 5, 8, 13]}
                  allowDataOverflow
                  tick={{ fontSize: 11 }}
                  label={{ value: "actores (log)", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <Tooltip content={<TooltipLog />} />
                {segLog && (
                  <ReferenceLine
                    segment={segLog}
                    stroke={C_COLA}
                    strokeDasharray="5 4"
                    ifOverflow="extendDomain"
                  />
                )}
                <Scatter name="tu red" data={datosLog} fill={BRAND} />
              </ScatterChart>
            ) : (
              <ComposedChart data={datos} margin={{ top: 10, right: 14, bottom: 26, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="grado"
                  tick={{ fontSize: 11 }}
                  label={{ value: "compras (vínculos recibidos)", position: "bottom", fontSize: 11 }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<TooltipBarras />} />
                <Legend verticalAlign="top" height={22} iconType="plainline" wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  name="tu red"
                  dataKey="conteo"
                  fill={BRAND}
                  radius={[3, 3, 0, 0]}
                  isAnimationActive
                  animationDuration={350}
                />
                <Line
                  name="campana (azar)"
                  dataKey="poisson"
                  stroke={C_CAMPANA}
                  strokeOpacity={enfasisPoisson}
                  strokeWidth={grosorPoisson}
                  strokeDasharray="4 3"
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                <Line
                  name="cola larga"
                  dataKey="potencia"
                  stroke={C_COLA}
                  strokeOpacity={enfasisPotencia}
                  strokeWidth={grosorPotencia}
                  strokeDasharray="4 3"
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-xs leading-snug text-slate-500">
        Barras = tu red. Líneas punteadas = formas de referencia:{" "}
        <span className="font-medium text-sky-600">campana (azar)</span> y{" "}
        <span className="font-medium text-rose-600">cola larga (vinculación preferencial)</span>.
        La que se parece a tu red se resalta sola.
      </p>

      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat label="Actores" valor={stats.n} />
        <Stat label="Vínculos" valor={stats.m} />
        <Stat label="Compras máx." valor={stats.gradoMax} />
        <Stat label="Compras prom." valor={stats.gradoPromedio.toFixed(1)} />
      </div>

      <div className={`rounded-lg border px-3 py-2 ${COLOR_REGIMEN[reg.clave]}`}>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold">{reg.etiqueta}</span>
          <span className="font-mono text-[11px] opacity-70">CV = {reg.cv.toFixed(2)}</span>
        </div>
        <p className="mt-1 text-xs leading-snug">{reg.explicacion}</p>
      </div>
    </div>
  );
}

function Stat({ label, valor }: { label: string; valor: number | string }) {
  return (
    <div className="rounded-md bg-slate-100 py-1.5">
      <div className="text-base font-semibold text-slate-800">{valor}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

type Punto = { grado: number; conteo: number; poisson: number | null; potencia: number | null };

function TooltipBarras({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Punto;
  const ref = (v: number | null) => (v == null ? "—" : v >= 1 ? Math.round(v) : v.toFixed(1));
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-slate-800">{d.grado} compras</div>
      <div className="mt-0.5 font-medium text-brand-700">Tu red: {d.conteo} actores</div>
      <div className="text-slate-400">
        campana ~{ref(d.poisson)} · cola larga ~{ref(d.potencia)}
      </div>
    </div>
  );
}

function TooltipLog({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Punto;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-slate-800">{d.grado} compras</div>
      <div className="font-medium text-brand-700">{d.conteo} actores</div>
    </div>
  );
}
