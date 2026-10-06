"use client";

// Curva del puesto de un personaje temporada a temporada. Una serie principal (color de
// marca) y una de referencia (gris), con etiqueta directa al final de cada línea: así la
// identidad no depende del color. El eje va invertido porque el puesto 1 es «arriba».
// Tocar una columna elige esa temporada (la misma que el selector del acto).

export type Serie = { etiqueta: string; valores: (number | null)[]; principal: boolean };

type Props = {
  series: Serie[];
  /** Índice de la temporada elegida (0–7), o null. */
  elegida: number | null;
  onElegir: (i: number) => void;
  /** Puesto más bajo que muestra el eje. */
  tope?: number;
  titulo: string;
};

const W = 320;
const H = 190;
const M = { izq: 30, der: 62, arr: 12, aba: 26 };

export default function Trayectoria({ series, elegida, onElegir, tope = 80, titulo }: Props) {
  const n = series[0]?.valores.length ?? 0;
  const x = (i: number) => M.izq + (i * (W - M.izq - M.der)) / Math.max(n - 1, 1);
  const y = (v: number) => M.arr + ((Math.min(v, tope) - 1) * (H - M.arr - M.aba)) / (tope - 1);
  const marcas = [1, 20, 40, 60, 80].filter((t) => t <= tope);

  // Tramos continuos: si el personaje no sale en una temporada, la línea se corta.
  function tramos(vs: (number | null)[]): string[] {
    const res: string[] = [];
    let actual = "";
    vs.forEach((v, i) => {
      if (v === null) {
        if (actual) res.push(actual);
        actual = "";
      } else actual += `${actual ? "L" : "M"}${x(i)},${y(v)}`;
    });
    if (actual) res.push(actual);
    return res;
  }

  // Etiquetas directas al final, separadas si chocan.
  const finales = series.map((s) => {
    const ult = [...s.valores].reverse().findIndex((v) => v !== null);
    const i = ult === -1 ? n - 1 : n - 1 - ult;
    return { s, i, yy: y(s.valores[i] ?? tope) };
  });
  if (finales.length === 2 && Math.abs(finales[0].yy - finales[1].yy) < 12) {
    const [a, b] = finales[0].yy <= finales[1].yy ? [finales[0], finales[1]] : [finales[1], finales[0]];
    a.yy -= 6;
    b.yy += 6;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={titulo} className="block h-auto w-full select-none">
      <title>{titulo}</title>
      {marcas.map((t) => (
        <g key={t}>
          <line x1={M.izq} x2={W - M.der} y1={y(t)} y2={y(t)} className="stroke-stone-200" strokeWidth={1} />
          <text x={M.izq - 6} y={y(t) + 3.5} textAnchor="end" className="fill-stone-400" style={{ fontSize: 10 }}>
            {t}
          </text>
        </g>
      ))}
      <text x={4} y={M.arr - 2} className="fill-stone-400" style={{ fontSize: 9 }}>
        puesto
      </text>

      {elegida !== null && (
        <rect
          x={x(elegida) - 13}
          y={M.arr - 6}
          width={26}
          height={H - M.arr - M.aba + 10}
          rx={4}
          className="fill-brand-50"
        />
      )}

      {Array.from({ length: n }, (_, i) => (
        <text
          key={i}
          x={x(i)}
          y={H - 8}
          textAnchor="middle"
          className={i === elegida ? "fill-stone-900" : "fill-stone-500"}
          style={{ fontSize: 10.5, fontWeight: i === elegida ? 700 : 500 }}
        >
          T{i + 1}
        </text>
      ))}

      {[...series].sort((a) => (a.principal ? 1 : -1)).map((s) => (
        <g key={s.etiqueta}>
          {tramos(s.valores).map((d, k) => (
            <path
              key={k}
              d={d}
              fill="none"
              className={s.principal ? "stroke-brand-600" : "stroke-stone-400"}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {s.valores.map((v, i) =>
            v === null ? null : (
              <circle
                key={i}
                cx={x(i)}
                cy={y(v)}
                r={i === elegida ? 4.5 : 3}
                className={s.principal ? "fill-brand-600 stroke-white" : "fill-stone-400 stroke-white"}
                strokeWidth={1.5}
              />
            ),
          )}
        </g>
      ))}

      {finales.map(({ s, i, yy }) => (
        <text
          key={s.etiqueta}
          x={x(i) + 8}
          y={yy + 3.5}
          className={s.principal ? "fill-stone-900" : "fill-stone-500"}
          style={{ fontSize: 10.5, fontWeight: s.principal ? 700 : 500 }}
        >
          {s.etiqueta}
        </text>
      ))}

      {/* Zonas de toque: una columna entera por temporada, más ancha que el punto. */}
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          x={x(i) - 16}
          y={0}
          width={32}
          height={H}
          fill="transparent"
          className="cursor-pointer"
          onClick={() => onElegir(i)}
        >
          <title>
            {`Temporada ${i + 1}: ` +
              series
                .map((s) => `${s.etiqueta} ${s.valores[i] === null ? "no aparece" : `puesto ${s.valores[i]}`}`)
                .join(" · ")}
          </title>
        </rect>
      ))}
    </svg>
  );
}
