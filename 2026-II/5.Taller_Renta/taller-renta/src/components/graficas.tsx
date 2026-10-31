"use client";

// Gráficas del taller en SVG propio: livianas para el celular y tocables. Tocar una
// marca muestra su dato debajo de la gráfica (en el celular no hay «hover»).

import { useMemo, useState } from "react";
import {
  CUARENTA,
  DATOS,
  fechaLarga,
  HOY,
  millones,
  num,
  pesos40,
  type Escritura,
  type Sector,
} from "@/lib/datos";

// ── Paleta ──────────────────────────────────────────────────────────────────
// Categóricos en orden fijo (azul, naranja, aguamarina, amarillo), validados para
// daltonismo. El mapa usa un divergente azul↔rojo con gris en la mediana de la ciudad.
export const COLOR = {
  lote: "#2a78d6",
  casa: "#eb6834",
  municipio: "#1baf7a",
  grilla: "#e1e0d9",
  eje: "#c3c2b7",
  tinta: "#0b0b0b",
  tinta2: "#52514e",
  muda: "#898781",
};

const COLOR_SECTOR: Record<Sector, string> = {
  sur: "#2a78d6",
  oriente: "#eb6834",
  norte: "#1baf7a",
  occidente: "#eda100",
};

export const NOMBRE_SECTOR: Record<Sector, string> = {
  sur: "Sur",
  oriente: "Oriente",
  norte: "Norte",
  occidente: "Occidente",
};

/** Clases del índice (precio del m² / mediana de la ciudad en esa época). */
export const CLASES = [
  { hasta: 0.5, color: "#1c5cab", nombre: "menos de la mitad" },
  { hasta: 0.8, color: "#86b6ef", nombre: "0,5 a 0,8" },
  { hasta: 1.25, color: "#d9d7cf", nombre: "cerca de la mediana" },
  { hasta: 2, color: "#f0a09f", nombre: "1,25 a 2" },
  { hasta: Infinity, color: "#c73a39", nombre: "más del doble" },
];

export function colorIndice(i: number): string {
  return CLASES.find((c) => i < c.hasta)!.color;
}

// ── Piezas comunes ──────────────────────────────────────────────────────────

function Leyenda({ items }: { items: { color: string; nombre: string; forma?: "punto" | "linea" | "cuadro" }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 px-2 pt-2 text-xs text-stone-600">
      {items.map((it) => (
        <span key={it.nombre} className="inline-flex items-center gap-1.5">
          {it.forma === "linea" ? (
            <span className="inline-block h-0.5 w-4 rounded" style={{ background: it.color }} />
          ) : it.forma === "cuadro" ? (
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: it.color }} />
          ) : (
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: it.color }} />
          )}
          {it.nombre}
        </span>
      ))}
    </div>
  );
}

/** Lo que se tocó, debajo de la gráfica. */
function Lectura({ children, onCerrar }: { children: React.ReactNode; onCerrar: () => void }) {
  return (
    <div className="mx-2 mb-2 mt-1 flex items-start gap-2 rounded-lg bg-stone-50 p-2.5 text-sm leading-relaxed text-stone-700">
      <div className="min-w-0 flex-1">{children}</div>
      <button onClick={onCerrar} aria-label="Cerrar" className="shrink-0 px-1 text-stone-400">
        ✕
      </button>
    </div>
  );
}

function FichaEscritura({ e }: { e: Escritura }) {
  return (
    <>
      <p className="font-semibold text-stone-900">
        {pesos40(e.pm2, e.pm2 < 1 ? 3 : 2)} por m² · {e.tipo === "lote" ? "lote" : "casa con su lote"}
        {e.municipio ? " · vende el Municipio" : ""}
      </p>
      <p>
        {fechaLarga(e.fecha, e.anio)} · {pesos40(e.valor)} por {num(e.area, 1)} m²
        {e.barrio ? ` · ${e.barrio}` : ""}
        {e.km !== null ? ` (${num(e.km, 1)} km de la plaza)` : ""}
      </p>
      <p className="text-xs text-stone-500">
        Vende: {e.vendedor || "—"} · Compra: {e.comprador || "—"}
      </p>
      <p className="text-xs text-stone-500">{e.lugar}</p>
    </>
  );
}

// Desplazamiento determinista para que los puntos de un mismo barrio (que comparten la
// coordenada del centro del barrio) no queden uno encima de otro.
function ruido(id: number): number {
  const x = Math.sin(id * 12.9898) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}

// Escala logarítmica para precios del 40.
const Y40 = { min: 0.01, max: 300 };
const TICKS_Y40 = [0.01, 0.1, 1, 10, 100];

function etiquetaY40(v: number) {
  return v < 1 ? `$${num(v, v < 0.1 ? 2 : 1)}` : `$${num(v)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Parte 1 · Todos los precios por año
// ─────────────────────────────────────────────────────────────────────────────

export function PreciosPorAnio() {
  const [sel, setSel] = useState<Escritura | null>(null);
  const W = 360,
    H = 250,
    m = { t: 12, r: 12, b: 28, l: 44 };
  const anios = [1941, 1942, 1943, 1944];
  const x = (a: number) => m.l + ((anios.indexOf(a) + 0.5) / anios.length) * (W - m.l - m.r);
  const y = (v: number) =>
    m.t +
    (1 - (Math.log10(v) - Math.log10(Y40.min)) / (Math.log10(Y40.max) - Math.log10(Y40.min))) * (H - m.t - m.b);
  const lotes = CUARENTA.escrituras.filter((e) => e.tipo === "lote");
  const medianas = CUARENTA.resumen_anual.filter((r) => r.tipo === "lote");
  const banda = (W - m.l - m.r) / anios.length;

  return (
    <figure className="mb-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Precio por metro cuadrado de cada lote vendido, por año, 1941 a 1944, en escala logarítmica">
        {TICKS_Y40.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={COLOR.grilla} />
            <text x={m.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill={COLOR.muda}>
              {etiquetaY40(t)}
            </text>
          </g>
        ))}
        {anios.map((a) => (
          <text key={a} x={x(a)} y={H - 10} textAnchor="middle" fontSize="11" fill={COLOR.tinta2}>
            {a}
          </text>
        ))}
        {lotes.map((e) => (
          <circle
            key={e.id}
            cx={x(e.anio) + ruido(e.id) * banda * 0.6}
            cy={y(Math.max(e.pm2, Y40.min))}
            r={sel?.id === e.id ? 5.5 : 3.5}
            fill={COLOR.lote}
            fillOpacity={sel && sel.id !== e.id ? 0.3 : 0.6}
            stroke={sel?.id === e.id ? COLOR.tinta : "none"}
            onClick={() => setSel(e)}
            className="cursor-pointer"
          />
        ))}
        {medianas.map((r) => (
          <g key={r.anio} pointerEvents="none">
            <line
              x1={x(r.anio) - banda * 0.38}
              x2={x(r.anio) + banda * 0.38}
              y1={y(r.mediana)}
              y2={y(r.mediana)}
              stroke={COLOR.tinta}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <text x={x(r.anio)} y={y(r.mediana) - 6} textAnchor="middle" fontSize="10.5" fontWeight={600} fill={COLOR.tinta}>
              {pesos40(r.mediana)}
            </text>
          </g>
        ))}
      </svg>
      <Leyenda
        items={[
          { color: COLOR.lote, nombre: "Un lote vendido (toca para ver la escritura)" },
          { color: COLOR.tinta, nombre: "Mediana del año", forma: "linea" },
        ]}
      />
      {sel ? (
        <Lectura onCerrar={() => setSel(null)}>
          <FichaEscritura e={sel} />
        </Lectura>
      ) : (
        <figcaption className="px-3 py-2 text-xs leading-relaxed text-stone-500">
          Pesos corrientes por m², escala logarítmica: cada línea de la grilla es diez veces la
          anterior. Notaría 2 de Cali, compraventas de lotes con precio y área.
        </figcaption>
      )}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Partes 2, 3 y 4 · El cono: precio del m² según la distancia a la Plaza de Caicedo
// ─────────────────────────────────────────────────────────────────────────────

const TICKS_KM = [0, 0.5, 1, 2, 3, 5, 8];

export function Cono40({
  casas = false,
  municipio = false,
  medianas = true,
}: {
  casas?: boolean;
  municipio?: boolean;
  medianas?: boolean;
}) {
  const [sel, setSel] = useState<Escritura | null>(null);
  const W = 360,
    H = 270,
    m = { t: 12, r: 14, b: 34, l: 44 };
  const KMAX = 9;
  // Raíz cuadrada: abre el primer kilómetro, que es donde pasa todo.
  const x = (k: number) => m.l + (Math.sqrt(Math.max(k, 0)) / Math.sqrt(KMAX)) * (W - m.l - m.r);
  const y = (v: number) =>
    m.t +
    (1 - (Math.log10(v) - Math.log10(Y40.min)) / (Math.log10(Y40.max) - Math.log10(Y40.min))) * (H - m.t - m.b);

  const puntos = CUARENTA.escrituras.filter((e) => e.km !== null && (casas || e.tipo === "lote"));
  const color = (e: Escritura) =>
    e.tipo === "casa" ? COLOR.casa : municipio && e.municipio ? COLOR.municipio : COLOR.lote;
  const perfil = CUARENTA.perfil.filter((p) => casas || p.tipo === "lote");

  return (
    <figure className="mb-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Precio por metro cuadrado contra distancia a la Plaza de Caicedo, 1941 a 1944">
        {TICKS_Y40.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={COLOR.grilla} />
            <text x={m.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill={COLOR.muda}>
              {etiquetaY40(t)}
            </text>
          </g>
        ))}
        {TICKS_KM.map((k) => (
          <g key={k}>
            <line x1={x(k)} x2={x(k)} y1={H - m.b} y2={H - m.b + 4} stroke={COLOR.eje} />
            <text x={x(k)} y={H - m.b + 15} textAnchor="middle" fontSize="10" fill={COLOR.muda}>
              {num(k, k % 1 ? 1 : 0)}
            </text>
          </g>
        ))}
        <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} stroke={COLOR.eje} />
        <text x={(W + m.l) / 2} y={H - 4} textAnchor="middle" fontSize="10.5" fill={COLOR.tinta2}>
          km desde la Plaza de Caicedo
        </text>
        {puntos.map((e) => (
          <circle
            key={e.id}
            cx={x(e.km! + ruido(e.id) * 0.12)}
            cy={y(Math.max(e.pm2, Y40.min))}
            r={sel?.id === e.id ? 5.5 : 3.5}
            fill={color(e)}
            fillOpacity={sel && sel.id !== e.id ? 0.3 : 0.65}
            stroke={sel?.id === e.id ? COLOR.tinta : "none"}
            onClick={() => setSel(e)}
            className="cursor-pointer"
          />
        ))}
        {medianas &&
          perfil.map((p) => (
            <line
              key={`${p.tipo}-${p.desde}`}
              x1={x(p.desde) + 1}
              x2={x(p.hasta) - 1}
              y1={y(p.mediana)}
              y2={y(p.mediana)}
              stroke={p.tipo === "casa" ? COLOR.casa : COLOR.lote}
              strokeWidth={2.5}
              strokeLinecap="round"
              pointerEvents="none"
            />
          ))}
      </svg>
      <Leyenda
        items={[
          { color: COLOR.lote, nombre: municipio ? "Lote de particulares" : "Lote" },
          ...(municipio ? [{ color: COLOR.municipio, nombre: "Lote ejido que vende el Municipio" }] : []),
          ...(casas ? [{ color: COLOR.casa, nombre: "Casa con su lote" }] : []),
          ...(medianas ? [{ color: COLOR.tinta2, nombre: "Mediana del anillo", forma: "linea" as const }] : []),
        ]}
      />
      {sel ? (
        <Lectura onCerrar={() => setSel(null)}>
          <FichaEscritura e={sel} />
        </Lectura>
      ) : (
        <figcaption className="px-3 py-2 text-xs leading-relaxed text-stone-500">
          Pesos corrientes por m² (escala logarítmica). La distancia va comprimida (raíz
          cuadrada) para que el primer kilómetro no quede apretado. Cada escritura se ubica en
          el centro de su barrio, así que los puntos de un barrio se separan un poco a propósito.
          Toca un punto para ver la escritura.
        </figcaption>
      )}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Parte 5 · Mapa: la geografía del precio en las dos épocas
// ─────────────────────────────────────────────────────────────────────────────

type SelMapa =
  | { tipo: "celda"; n: number; indice: number }
  | { tipo: "barrio"; b: (typeof CUARENTA.barrios)[number] };

export function MapaCali() {
  const [epoca, setEpoca] = useState<"40" | "hoy">("40");
  const [sel, setSel] = useState<SelMapa | null>(null);

  const geo = useMemo(() => {
    const lats = HOY.celdas.map((c) => c.lat);
    const lons = HOY.celdas.map((c) => c.lon);
    const pad = 0.006;
    const lat0 = Math.min(...lats) - pad,
      lat1 = Math.max(...lats) + pad,
      lon0 = Math.min(...lons) - pad,
      lon1 = Math.max(...lons) + pad;
    const cos = Math.cos((DATOS.plaza.lat * Math.PI) / 180);
    const W = 340;
    const S = W / ((lon1 - lon0) * cos);
    const H = (lat1 - lat0) * S;
    return {
      W,
      H,
      S,
      x: (lon: number) => (lon - lon0) * cos * S,
      y: (lat: number) => (lat1 - lat) * S,
    };
  }, []);

  const lado = 0.005 * geo.S; // celda de ~550 m
  const barrios = CUARENTA.barrios.filter((b) => b.indice_40 !== null);

  return (
    <figure className="mb-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="flex gap-2 p-2">
        {(
          [
            ["40", "1941–1944 (lotes)"],
            ["hoy", "2020–2024 (avisos)"],
          ] as const
        ).map(([k, t]) => (
          <button
            key={k}
            onClick={() => {
              setEpoca(k);
              setSel(null);
            }}
            aria-pressed={epoca === k}
            className={`opcion ${epoca === k ? "opcion-activa" : "hover:bg-stone-50"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${geo.W} ${geo.H}`} className="block w-full" role="img" aria-label="Mapa de Cali con el precio del metro cuadrado relativo a la mediana de la ciudad">
        {/* La huella de la ciudad de hoy, en gris tenue, como referencia en las dos épocas. */}
        {HOY.celdas.map((c) => (
          <rect
            key={`f-${c.lat}-${c.lon}`}
            x={geo.x(c.lon) - lado / 2}
            y={geo.y(c.lat) - lado / 2}
            width={lado}
            height={lado}
            fill={epoca === "hoy" ? colorIndice(c.indice) : "#efeee9"}
            stroke="#fcfcfb"
            strokeWidth={1}
            onClick={epoca === "hoy" ? () => setSel({ tipo: "celda", n: c.n, indice: c.indice }) : undefined}
            className={epoca === "hoy" ? "cursor-pointer" : undefined}
          />
        ))}
        {epoca === "40" &&
          barrios.map((b) => (
            <circle
              key={b.barrio}
              cx={geo.x(b.lon)}
              cy={geo.y(b.lat)}
              r={3 + Math.sqrt(b.n_lotes) * 1.6}
              fill={colorIndice(b.indice_40!)}
              stroke="#fcfcfb"
              strokeWidth={2}
              onClick={() => setSel({ tipo: "barrio", b })}
              className="cursor-pointer"
            />
          ))}
        {HOY.rotulos.map((r) => (
          <text
            key={r.nombre}
            x={geo.x(r.lon)}
            y={geo.y(r.lat) + 3}
            textAnchor="middle"
            fontSize="9.5"
            fontWeight={600}
            fill={COLOR.tinta2}
            stroke="#fcfcfb"
            strokeWidth={2.5}
            paintOrder="stroke"
            pointerEvents="none"
          >
            {r.nombre}
          </text>
        ))}
        <g pointerEvents="none">
          <circle cx={geo.x(DATOS.plaza.lon)} cy={geo.y(DATOS.plaza.lat)} r={4} fill={COLOR.tinta} stroke="#fcfcfb" strokeWidth={2} />
          <text
            x={geo.x(DATOS.plaza.lon) + 7}
            y={geo.y(DATOS.plaza.lat) - 5}
            fontSize="9.5"
            fontWeight={700}
            fill={COLOR.tinta}
            stroke="#fcfcfb"
            strokeWidth={2.5}
            paintOrder="stroke"
          >
            Plaza de Caicedo
          </text>
          <text x={geo.W - 10} y={16} textAnchor="end" fontSize="10" fill={COLOR.muda}>
            N ↑
          </text>
        </g>
      </svg>
      <Leyenda items={CLASES.map((c) => ({ color: c.color, nombre: c.nombre, forma: "cuadro" as const }))} />
      {sel ? (
        <Lectura onCerrar={() => setSel(null)}>
          {sel.tipo === "celda" ? (
            <p>
              <strong>{num(sel.indice, 2)}</strong> veces la mediana de la ciudad (
              {millones(sel.indice * HOY.mediana)} por m²), con {sel.n} avisos en este cuadro de
              unos 550 m de lado.
            </p>
          ) : (
            <>
              <p className="font-semibold text-stone-900">
                {sel.b.barrio} · {num(sel.b.indice_40, 2)} veces la mediana de 1941–44
              </p>
              <p>
                {sel.b.n_lotes} lote{sel.b.n_lotes === 1 ? "" : "s"}, mediana {pesos40(sel.b.lote_mediana)} por m².
                Hoy es {sel.b.hoy}
                {sel.b.indice_hoy !== null
                  ? `: ${num(sel.b.indice_hoy, 2)} veces la mediana de 2020–24 (${sel.b.n_hoy} avisos).`
                  : ", sin avisos en la base de 2020–24."}
              </p>
            </>
          )}
        </Lectura>
      ) : (
        <figcaption className="px-3 py-2 text-xs leading-relaxed text-stone-500">
          {epoca === "40"
            ? `Cada círculo es un barrio de las escrituras, en el centro del barrio de hoy; el tamaño crece con el número de lotes. Color: mediana del barrio dividida por la de toda la ciudad (${pesos40(CUARENTA.mediana_lotes)} por m²). El gris de fondo es la Cali de hoy.`
            : `Cuadros de unos 550 m con al menos 3 avisos. Color: mediana del cuadro dividida por la de toda la ciudad (${millones(HOY.mediana)} por m²). Base de Johan Torres.`}{" "}
          Toca para ver el dato.
        </figcaption>
      )}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Parte 5 · El perfil de hoy, por sector
// ─────────────────────────────────────────────────────────────────────────────

export function PerfilHoy() {
  const [sel, setSel] = useState<(typeof HOY.perfil)[number] | null>(null);
  const W = 360,
    H = 250,
    m = { t: 14, r: 64, b: 34, l: 40 };
  const KMAX = 14,
    YMAX = 4.5e6;
  const x = (k: number) => m.l + (k / KMAX) * (W - m.l - m.r);
  const y = (v: number) => m.t + (1 - v / YMAX) * (H - m.t - m.b);
  const sectores: Sector[] = ["sur", "oriente", "norte", "occidente"];
  const medio = (p: { desde: number; hasta: number }) => (p.desde + p.hasta) / 2;

  return (
    <figure className="mb-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Mediana del precio del metro cuadrado por anillo de distancia, en cuatro sectores de Cali, 2020 a 2024">
        {[0, 1e6, 2e6, 3e6, 4e6].map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={t ? COLOR.grilla : COLOR.eje} />
            <text x={m.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill={COLOR.muda}>
              {t ? `$${t / 1e6} M` : "0"}
            </text>
          </g>
        ))}
        {[0, 2, 4, 6, 8, 10, 12, 14].map((k) => (
          <text key={k} x={x(k)} y={H - m.b + 15} textAnchor="middle" fontSize="10" fill={COLOR.muda}>
            {k}
          </text>
        ))}
        <text x={(W - m.r + m.l) / 2} y={H - 4} textAnchor="middle" fontSize="10.5" fill={COLOR.tinta2}>
          km desde la Plaza de Caicedo
        </text>
        {sectores.map((s) => {
          const ps = HOY.perfil.filter((p) => p.sector === s);
          if (!ps.length) return null;
          const ultimo = ps[ps.length - 1];
          return (
            <g key={s}>
              <polyline
                points={ps.map((p) => `${x(medio(p))},${y(p.mediana)}`).join(" ")}
                fill="none"
                stroke={COLOR_SECTOR[s]}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {ps.map((p) => (
                <g key={p.desde} onClick={() => setSel(p)} className="cursor-pointer">
                  <circle cx={x(medio(p))} cy={y(p.mediana)} r={12} fill="transparent" />
                  <circle
                    cx={x(medio(p))}
                    cy={y(p.mediana)}
                    r={sel === p ? 5.5 : 4}
                    fill={COLOR_SECTOR[s]}
                    stroke="#fcfcfb"
                    strokeWidth={2}
                  />
                </g>
              ))}
              <text x={x(medio(ultimo)) + 8} y={y(ultimo.mediana) + 3.5} fontSize="10.5" fontWeight={600} fill={COLOR.tinta2}>
                {NOMBRE_SECTOR[s]}
              </text>
            </g>
          );
        })}
      </svg>
      <Leyenda items={sectores.map((s) => ({ color: COLOR_SECTOR[s], nombre: NOMBRE_SECTOR[s], forma: "linea" as const }))} />
      {sel ? (
        <Lectura onCerrar={() => setSel(null)}>
          <p>
            <strong>{NOMBRE_SECTOR[sel.sector]}</strong>, entre {sel.desde} y {sel.hasta} km de la
            plaza: mediana de <strong>{millones(sel.mediana)}</strong> por m² ({num(sel.n)} avisos).
          </p>
        </Lectura>
      ) : (
        <figcaption className="px-3 py-2 text-xs leading-relaxed text-stone-500">
          Mediana del precio por m² en anillos de 2 km (de 10 a 14 km al final), solo donde hay
          al menos 10 avisos. Sector según el rumbo desde la plaza: norte, oriente, sur u
          occidente. Avisos de venta de 2020 a 2024, pesos corrientes. Toca un punto.
        </figcaption>
      )}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Parte 6 · La mediana ingenua frente a la comparación dentro del barrio
// ─────────────────────────────────────────────────────────────────────────────

export function Indices() {
  const W = 360,
    H = 230,
    m = { t: 14, r: 16, b: 28, l: 40 };
  const anios = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const x = (a: number) => m.l + ((a - 2020) / 6) * (W - m.l - m.r);
  const YMIN = 60,
    YMAX = 200;
  const y = (v: number) => m.t + (1 - (v - YMIN) / (YMAX - YMIN)) * (H - m.t - m.b);

  const casas = HOY.ingenuas.filter((r) => r.tipo === "Casa");
  const base = casas.find((r) => r.anio === 2020)!.mediana;
  const ingenua = casas.map((r) => ({ anio: r.anio, v: (100 * r.mediana) / base }));
  const dentro = HOY.indice.map((r) => ({ anio: r.anio, v: r.indice }));
  // 2025 no está en la base: la línea se corta, no se inventa el tramo.
  const tramos = (s: { anio: number; v: number }[]) => [s.filter((p) => p.anio <= 2024), s.filter((p) => p.anio >= 2026)];

  const series = [
    { nombre: "Mediana de las casas, tal cual", color: COLOR.casa, datos: ingenua },
    { nombre: "Mismo barrio y mismo tipo", color: COLOR.lote, datos: dentro },
  ];

  return (
    <figure className="mb-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Dos índices de precios 2020 a 2026, base 2020 igual a 100">
        {[60, 100, 140, 180].map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={t === 100 ? COLOR.eje : COLOR.grilla} />
            <text x={m.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill={COLOR.muda}>
              {t}
            </text>
          </g>
        ))}
        {anios.map((a) => (
          <text key={a} x={x(a)} y={H - 10} textAnchor="middle" fontSize="10.5" fill={a === 2025 ? COLOR.eje : COLOR.tinta2}>
            {a === 2025 ? "sin datos" : a}
          </text>
        ))}
        {series.map((s) => (
          <g key={s.nombre}>
            {tramos(s.datos).map((t, i) =>
              t.length > 1 ? (
                <polyline
                  key={i}
                  points={t.map((p) => `${x(p.anio)},${y(p.v)}`).join(" ")}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              ) : null,
            )}
            {s.datos.map((p) => (
              <g key={p.anio}>
                <circle cx={x(p.anio)} cy={y(p.v)} r={4} fill={s.color} stroke="#fcfcfb" strokeWidth={2} />
                {(p.anio === 2024 || p.anio === 2026) && (
                  <text
                    x={x(p.anio) + (p.anio === 2026 ? -8 : 0)}
                    y={y(p.v) + (s.color === COLOR.casa ? -9 : 15)}
                    textAnchor={p.anio === 2026 ? "end" : "middle"}
                    fontSize="10.5"
                    fontWeight={600}
                    fill={COLOR.tinta}
                  >
                    {num(p.v)}
                  </text>
                )}
              </g>
            ))}
          </g>
        ))}
      </svg>
      <Leyenda items={series.map((s) => ({ color: s.color, nombre: s.nombre, forma: "linea" as const }))} />
      <figcaption className="px-3 py-2 text-xs leading-relaxed text-stone-500">
        Las dos series valen 100 en 2020. La naranja es la mediana del precio por m² de todas las
        casas de cada año. La azul compara cada aviso solo con otros del mismo barrio y del mismo
        tipo (casa o apartamento), así que no la mueve que un año traiga más avisos de barrios
        caros. 2025 no viene en la base.
      </figcaption>
    </figure>
  );
}

export function Composicion() {
  const filas = [...HOY.composicion]
    .filter((c) => c.mediana !== null)
    .sort((a, b) => (b.mediana ?? 0) - (a.mediana ?? 0));
  const max = Math.max(...filas.flatMap((c) => [c.ref, c.y2026]));
  return (
    <figure className="mb-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="px-3 pt-3">
        <div className="mb-1 grid grid-cols-[4.5rem_1fr] gap-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
          <span>Comuna</span>
          <span>% de los avisos</span>
        </div>
        {filas.map((c) => (
          <div key={c.comuna} className="grid grid-cols-[4.5rem_1fr] items-center gap-2 py-[3px]">
            <span className="text-xs leading-tight text-stone-700">
              <strong>{c.comuna}</strong>
              <span className="block text-[10px] text-stone-400">{millones(c.mediana, 1).replace(" millones", " M")}/m²</span>
            </span>
            <div className="flex flex-col gap-[2px]">
              {(
                [
                  ["ref", COLOR.lote],
                  ["y2026", COLOR.casa],
                ] as const
              ).map(([k, color]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <div className="h-2 rounded-r" style={{ width: `${Math.max((c[k] / max) * 80, 0.5)}%`, background: color }} />
                  <span className="text-[10px] tabular-nums text-stone-500">{num(c[k], 1)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Leyenda
        items={[
          { color: COLOR.lote, nombre: "2020–2024", forma: "cuadro" },
          { color: COLOR.casa, nombre: "2026", forma: "cuadro" },
        ]}
      />
      <figcaption className="px-3 py-2 text-xs leading-relaxed text-stone-500">
        Comunas ordenadas de la más cara a la más barata según la mediana por m² de 2020–2024
        (el número pequeño). Cada barra es el porcentaje de los avisos de ese período que caen
        en la comuna.
      </figcaption>
    </figure>
  );
}
