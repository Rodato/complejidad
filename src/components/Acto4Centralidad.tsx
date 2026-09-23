"use client";

import { useMemo, useState } from "react";
import { ARISTAS_MEDICI, FAMILIAS } from "@/lib/contenido";
import {
  MEDIDAS,
  crearRed,
  fmt,
  puestos,
  todasLasMetricas,
  type Medida,
  type Metricas,
} from "@/lib/red";
import type { Respuestas } from "@/lib/tipos";
import { NODOS_FAMILIAS } from "./Acto1Red";
import Red from "./Red";
import {
  CabezaActo,
  Campo,
  Definicion,
  Ejercicio,
  Lienzo,
  Opciones,
  Revelable,
  Texto,
  Veredicto,
} from "./ui";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
  familia: string;
};

const RED = crearRed(
  FAMILIAS.map((f) => f.id),
  ARISTAS_MEDICI,
);
const M: Metricas = todasLasMetricas(RED);
const RIQUEZA: Record<string, number> = Object.fromEntries(FAMILIAS.map((f) => [f.id, f.riqueza]));

/** Tamaños 0–1 para dibujar: cada medida escalada a su máximo. */
function tamanosDe(m: Medida): Record<string, number> {
  const v = M[m];
  const max = Math.max(...Object.values(v)) || 1;
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x / max]));
}

const valor = (m: Medida, x: number) => (m === "grado" ? String(x) : fmt(x));

/** Cuántas veces más que los Strozzi tienen los Medici en cada medida. */
const BRECHA = Object.fromEntries(
  MEDIDAS.map((d) => [d.clave, M[d.clave].Medici / M[d.clave].Strozzi]),
) as Record<Medida, number>;
const MEDIDA_MAYOR_BRECHA = MEDIDAS.reduce((a, b) =>
  BRECHA[b.clave] > BRECHA[a.clave] ? b : a,
).clave;

export default function Acto4Centralidad({ r, set, familia }: Props) {
  const [medida, setMedida] = useState<Medida>("grado");
  const tamanos = useMemo(() => tamanosDe(medida), [medida]);
  const orden = useMemo(
    () => Object.entries(M[medida]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    [medida],
  );
  const puestosFamilia = useMemo(
    () =>
      MEDIDAS.map((d) => ({
        ...d,
        valor: M[d.clave][familia],
        puesto: puestos(M[d.clave])[familia],
      })),
    [familia],
  );
  const bgListo = [r.a4_caminos_bg, r.a4_por_medici, r.a4_por_albizzi].every((v) => v.trim());

  return (
    <div>
      <CabezaActo
        numero={4}
        titulo="Cuatro maneras de ser central"
        bajada="Ya tienes las piezas: grado, caminos, puentes. Con ellas se construyen las medidas de centralidad, que es lo que Jackson llama las posiciones de poder e influencia en una red. No hay una sola: hay varias, y cada una responde a una pregunta distinta."
      />

      <Definicion titulo="Centralidad">
        <p>
          Una medida de centralidad le pone un número a la posición de cada nodo. Estas son las
          cuatro que vamos a usar (Jackson, <em>The Human Network</em>, cap. 2):
        </p>
        <ul className="mb-3 space-y-2">
          {MEDIDAS.map((d) => (
            <li key={d.clave}>
              <strong className="text-brand-800">
                {d.nombre} ({d.corto.toLowerCase()}).
              </strong>{" "}
              <span className="text-stone-700">{d.idea}</span>
            </li>
          ))}
        </ul>
        <p>
          La <strong>intermediación</strong> es la que Jackson usa para explicar a los Medici en
          el capítulo 1. Para cada par de familias se buscan los caminos más cortos entre ellas y
          se mira qué fracción pasa por la familia que estamos midiendo. Luego se promedia sobre
          todos los pares.
        </p>
      </Definicion>

      <Ejercicio numero="4.1" titulo="La intermediación, a mano">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Es el mismo ejemplo del libro. Mira a los <strong>Barbadori</strong> y a los{" "}
          <strong>Guadagni</strong> (resaltados). Busca todos los caminos más cortos entre ellos.
        </p>
        <Lienzo pie="Barbadori y Guadagni resaltados.">
          <Red
            nodos={NODOS_FAMILIAS}
            aristas={ARISTAS_MEDICI}
            marcados={["Barbadori", "Guadagni"]}
            titulo="Red de matrimonios con Barbadori y Guadagni resaltados"
          />
        </Lienzo>
        <div className="grid grid-cols-3 gap-3">
          <Campo
            label="¿Cuántos caminos más cortos hay?"
            valor={r.a4_caminos_bg}
            onChange={(v) => set("a4_caminos_bg", v)}
            numerico
          />
          <Campo
            label="¿Cuántos pasan por Medici?"
            valor={r.a4_por_medici}
            onChange={(v) => set("a4_por_medici", v)}
            numerico
          />
          <Campo
            label="¿Cuántos pasan por Albizzi?"
            valor={r.a4_por_albizzi}
            onChange={(v) => set("a4_por_albizzi", v)}
            numerico
          />
        </div>
        <Revelable habilitado={bgListo} etiqueta="Ver la respuesta">
          <p className="text-sm leading-relaxed text-stone-600">
            Hay <strong>2</strong> caminos de 3 pasos: Barbadori → Medici → Albizzi → Guadagni y
            Barbadori → Medici → Tornabuoni → Guadagni. Los Medici están en los 2 (fracción 2/2 =
            1); los Albizzi, en 1 (fracción 1/2); los Strozzi, en ninguno (0).
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Si repites esto para los 91 pares de familias que no incluyen a los Medici y
            promedias, te da su intermediación: <strong>{fmt(M.intermediacion.Medici)}</strong>.
            Más de la mitad de los caminos más cortos de la élite pasan por ellos. La de los
            Strozzi es {fmt(M.intermediacion.Strozzi)}.
          </p>
        </Revelable>
      </Ejercicio>

      <Ejercicio numero="4.2" titulo="Las cuatro medidas lado a lado">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Elige una medida. El tamaño de cada familia cambia según su valor, y abajo aparece la
          tabla ordenada. Tu familia, los {familia}, va resaltada.
        </p>
        <div className="mb-3">
          <Opciones<Medida>
            opciones={MEDIDAS.map((d) => ({ clave: d.clave, nombre: d.nombre }))}
            valor={medida}
            onChange={setMedida}
          />
        </div>
        <Lienzo pie={MEDIDAS.find((d) => d.clave === medida)!.idea}>
          <Red
            nodos={NODOS_FAMILIAS}
            aristas={ARISTAS_MEDICI}
            tamanos={tamanos}
            marcados={[familia]}
            radioBase={3}
            titulo={`Red de matrimonios con el tamaño según ${medida}`}
          />
        </Lienzo>
        <ol className="mb-4 text-sm">
          {orden.map(([f, v], i) => (
            <li
              key={f}
              className={`flex items-center gap-2 border-b border-stone-200 py-1 ${
                f === familia ? "font-bold text-brand-700" : "text-stone-700"
              }`}
            >
              <span className="w-5 text-right tabular-nums text-stone-400">{i + 1}</span>
              <span className="flex-1">{f}</span>
              <span className="tabular-nums">{valor(medida, v)}</span>
            </li>
          ))}
        </ol>
        <p className="mb-2 text-[15px] font-medium text-stone-800">
          Los Medici quedan primeros en las cuatro. Pero ¿en cuál la distancia con los Strozzi
          es más grande?
        </p>
        <Opciones<Medida>
          opciones={MEDIDAS.map((d) => ({ clave: d.clave, nombre: d.nombre }))}
          valor={r.a4_strozzi_medida}
          onChange={(v) => set("a4_strozzi_medida", v)}
        />
        {r.a4_strozzi_medida && (
          <Veredicto bien={r.a4_strozzi_medida === MEDIDA_MAYOR_BRECHA}>
            {r.a4_strozzi_medida === MEDIDA_MAYOR_BRECHA
              ? `Sí. En intermediación los Medici tienen ${BRECHA.intermediacion.toFixed(1).replace(".", ",")} veces lo de los Strozzi. En grado, ${BRECHA.grado.toFixed(1).replace(".", ",")} veces; en vector propio, ${BRECHA.vectorPropio.toFixed(1).replace(".", ",")}. Los Strozzi están casi a la par en «conexiones importantes»: están casados con familias bien conectadas. Lo que no son es puente.`
              : "No es esa. Compara el valor de los Medici con el de los Strozzi en cada una de las cuatro medidas: ¿en cuál es más grande la proporción entre los dos?"}
          </Veredicto>
        )}
      </Ejercicio>

      <Ejercicio numero="4.3" titulo={`La posición de los ${familia}`}>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {puestosFamilia.map((d) => (
            <div key={d.clave} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {d.nombre}
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-stone-900">
                {valor(d.clave, d.valor)}
              </p>
              <p className="text-xs text-stone-500">puesto {d.puesto} de 15</p>
            </div>
          ))}
        </div>
        <p className="mb-4 text-sm text-stone-600">
          Riqueza en 1427: <strong>{RIQUEZA[familia]}</strong> mil liras (los Strozzi, 146; los
          Medici, 103).
        </p>
        <Texto
          label={`¿Qué clase de posición tienen los ${familia}? ¿Populares, bien conectados, puente, o ninguna de esas? ¿Su posición en la red se corresponde con su riqueza?`}
          ayuda="Cita los puestos de arriba. Si su lugar cambia mucho de una medida a otra, explica por qué."
          valor={r.a4_familia_lectura}
          onChange={(v) => set("a4_familia_lectura", v)}
          filas={5}
          placeholder="Escribe aquí…"
        />
      </Ejercicio>

      <Ejercicio numero="4.4" titulo="¿Por qué los Medici y no los Strozzi?">
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="pb-1 font-semibold"></th>
                <th className="pb-1 text-right font-semibold">Riqueza</th>
                <th className="pb-1 text-right font-semibold">Priorías</th>
                {MEDIDAS.map((d) => (
                  <th key={d.clave} className="pb-1 pl-2 text-right font-semibold">
                    {d.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {["Medici", "Strozzi"].map((f) => (
                <tr key={f} className="border-t border-stone-200">
                  <td className="py-1.5 font-semibold text-stone-800">{f}</td>
                  <td className="py-1.5 text-right tabular-nums">{RIQUEZA[f]}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {FAMILIAS.find((x) => x.id === f)!.priorias}
                  </td>
                  {MEDIDAS.map((d) => (
                    <td key={d.clave} className="py-1.5 pl-2 text-right tabular-nums">
                      {valor(d.clave, M[d.clave][f])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1.5 text-xs text-stone-500">
            Riqueza: miles de liras en 1427. Priorías: puestos en el concejo de la ciudad entre
            1282 y 1344.
          </p>
        </div>
        <Texto
          label="Esta es la entrega principal del taller. Explica por qué fueron los Medici, y no los Strozzi, quienes terminaron controlando Florencia."
          ayuda="Entre 150 y 250 palabras. Tienes que usar al menos una cifra de riqueza o de priorías y al menos dos medidas de red, y decir qué capta cada una. Cierra con una limitación: ¿qué NO puede explicar la red de matrimonios?"
          valor={r.a4_argumento}
          onChange={(v) => set("a4_argumento", v)}
          filas={12}
          minPalabras={150}
          maxPalabras={250}
          placeholder="Escribe aquí…"
        />
      </Ejercicio>
    </div>
  );
}
