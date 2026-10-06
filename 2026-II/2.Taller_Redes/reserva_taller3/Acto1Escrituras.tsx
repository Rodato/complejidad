"use client";

import { ACTORES, FICHAS, NOMBRE_ACTOR, RELACIONES, type Direccion } from "@/lib/contenido";
import type { Respuestas, RespuestaFicha } from "@/lib/tipos";
import Red from "./Red";
import {
  CabezaActo,
  Definicion,
  Ejercicio,
  Lienzo,
  Opciones,
  Revelable,
  Selector,
  Texto,
} from "./ui";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

const NODOS_ACTORES = ACTORES.map((a) => ({ id: a.id, etiqueta: a.nombre, x: a.x, y: a.y }));
const OPCIONES_ACTORES = ACTORES.map((a) => ({ clave: a.id, nombre: a.nombre }));

/** Los vínculos que resultan de lo que el estudiante marcó en cada escritura. */
export function aristasDeFichas(fichas: Record<string, RespuestaFicha>): [string, string][] {
  const res: [string, string][] = [];
  for (const f of FICHAS) {
    const x = fichas[f.id];
    if (x && !x.no && x.de && x.a && x.de !== x.a) res.push([x.de, x.a]);
  }
  return res;
}

export const ARISTAS_CORRECTAS: [string, string][] = FICHAS.flatMap((f) =>
  f.correcta ? [[f.correcta.de, f.correcta.a] as [string, string]] : [],
);

export function fichaCorrecta(id: string, x: RespuestaFicha | undefined): boolean {
  const f = FICHAS.find((g) => g.id === id)!;
  if (!x) return false;
  if (f.correcta === null) return x.no;
  return !x.no && x.de === f.correcta.de && x.a === f.correcta.a;
}

const fichaCompleta = (x: RespuestaFicha | undefined) => Boolean(x && (x.no || (x.de && x.a)));

export default function Acto1Escrituras({ r, set }: Props) {
  const aristas = aristasDeFichas(r.a1_fichas);
  const fichasListas = FICHAS.every((f) => fichaCompleta(r.a1_fichas[f.id]));
  const direccionLista = RELACIONES.every((x) => r.a1_direccion[x.id]);

  function cambiar(id: string, cambio: Partial<RespuestaFicha>) {
    const previa = r.a1_fichas[id] ?? { de: "", a: "", no: false };
    set("a1_fichas", { ...r.a1_fichas, [id]: { ...previa, ...cambio } });
  }

  return (
    <div>
      <CabezaActo
        numero={1}
        titulo="De una escritura a una red"
        bajada="Entre 1938 y 1944 pasaron por la Notaría Segunda de Cali cientos de escrituras: compraventas, permutas, hipotecas. Cada una es una relación entre dos partes. Si las juntamos todas, aparece algo que ninguna escritura muestra por separado: una red. En este acto vas a construir una con seis escrituras reales."
      />

      <Definicion titulo="Nodos y vínculos">
        <p>
          Una red tiene solo dos ingredientes. Los <strong>nodos</strong> son los actores: en
          nuestro caso, personas, familias, empresas, bancos o el Municipio. Los{" "}
          <strong>vínculos</strong> (también se les dice aristas o enlaces) son las relaciones
          entre ellos.
        </p>
        <p>
          Un vínculo puede tener dirección o no tenerla. En una compraventa la tierra va del
          vendedor al comprador, así que la dibujamos como una <strong>flecha</strong>: vendedor
          → comprador. Es una red <strong>dirigida</strong>. En un matrimonio no hay dirección: si
          A está casado con B, B está casado con A. Es una red <strong>no dirigida</strong>, y el
          vínculo es una línea sin punta.
        </p>
        <p>
          Lo más importante: <em>qué es un nodo y qué es un vínculo lo decide quien investiga</em>,
          antes de dibujar. En este curso decidimos que un vínculo es una escritura en la que la
          tierra pasa de una parte a otra, y que la flecha sigue a la tierra.
        </p>
      </Definicion>

      <Ejercicio numero="1.1" titulo="Seis escrituras, una red">
        <p className="mb-4 text-[15px] leading-relaxed text-stone-600">
          Lee cada escritura y marca quién entrega la tierra y quién la recibe. Si en la
          escritura no pasa tierra de una parte a otra, márcalo: esa no entra a la red. Abajo, la
          red se va dibujando con lo que marques.
        </p>

        <ol className="space-y-4">
          {FICHAS.map((f, i) => {
            const x = r.a1_fichas[f.id] ?? { de: "", a: "", no: false };
            return (
              <li key={f.id} className="rounded-lg border border-stone-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Escritura {i + 1} · {f.fecha}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-stone-800">{f.texto}</p>
                <div className={`mt-3 flex gap-2 ${x.no ? "opacity-40" : ""}`}>
                  <Selector
                    label="Entrega la tierra"
                    valor={x.no ? "" : x.de}
                    onChange={(v) => cambiar(f.id, { de: v, no: false })}
                    opciones={OPCIONES_ACTORES}
                  />
                  <Selector
                    label="La recibe"
                    valor={x.no ? "" : x.a}
                    onChange={(v) => cambiar(f.id, { a: v, no: false })}
                    opciones={OPCIONES_ACTORES}
                  />
                </div>
                {!x.no && x.de && x.de === x.a && (
                  <p className="mt-1.5 text-sm text-brand-700">
                    Elegiste la misma parte en los dos lados: nadie se vende tierra a sí mismo.
                  </p>
                )}
                <label className="mt-2.5 flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={x.no}
                    onChange={(e) => cambiar(f.id, { no: e.target.checked })}
                    className="h-5 w-5 accent-brand-600"
                  />
                  En esta escritura no pasa tierra de una parte a otra
                </label>
              </li>
            );
          })}
        </ol>

        <p className="mb-2 mt-5 text-sm font-semibold text-stone-800">Tu red hasta ahora</p>
        <Lienzo
          pie={`${aristas.length} vínculo${aristas.length === 1 ? "" : "s"}. Cada flecha va de quien entrega la tierra a quien la recibe.`}
        >
          <Red
            nodos={NODOS_ACTORES}
            aristas={aristas}
            dirigida
            proporcion={0.8}
            radioBase={4}
            titulo="La red que armaste con las escrituras"
          />
        </Lienzo>

        <Revelable habilitado={fichasListas} etiqueta="Ver las respuestas y la red correcta">
          <ul className="space-y-3 text-sm">
            {FICHAS.map((f, i) => {
              const bien = fichaCorrecta(f.id, r.a1_fichas[f.id]);
              return (
                <li key={f.id}>
                  <p className="font-semibold text-stone-800">
                    {i + 1}.{" "}
                    {f.correcta
                      ? `${NOMBRE_ACTOR[f.correcta.de]} → ${NOMBRE_ACTOR[f.correcta.a]}`
                      : "No entra a la red de tierra"}{" "}
                    <span className={bien ? "text-emerald-700" : "text-brand-700"}>
                      {bien ? "· acertaste" : "· revisa esta"}
                    </span>
                  </p>
                  <p className="mt-0.5 leading-relaxed text-stone-600">{f.porque}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 rounded-lg border border-stone-200 bg-white p-1">
            <Red
              nodos={NODOS_ACTORES}
              aristas={ARISTAS_CORRECTAS}
              dirigida
              proporcion={0.8}
              radioBase={4}
              titulo="La red correcta"
            />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Pedro P. Caicedo B. queda suelto: aparece en los documentos, pero no en la red de
            tierra. Un nodo sin vínculos se llama <strong>aislado</strong>.
          </p>
        </Revelable>
      </Ejercicio>

      <Ejercicio numero="1.2" titulo="¿Con flecha o sin flecha?">
        <p className="mb-4 text-[15px] leading-relaxed text-stone-600">
          Para cada relación, decide si el vínculo tiene dirección.
        </p>
        <div className="space-y-5">
          {RELACIONES.map((x, i) => (
            <div key={x.id}>
              <p className="mb-2 text-[15px] leading-relaxed text-stone-800">
                <span className="mr-1.5 font-semibold text-stone-400">{i + 1}.</span>
                {x.texto}
              </p>
              <Opciones<Direccion>
                opciones={[
                  { clave: "dirigido", nombre: "Dirigido (→)" },
                  { clave: "no_dirigido", nombre: "No dirigido (—)" },
                ]}
                valor={r.a1_direccion[x.id] ?? ""}
                onChange={(v) => set("a1_direccion", { ...r.a1_direccion, [x.id]: v })}
              />
            </div>
          ))}
        </div>
        <Revelable habilitado={direccionLista} etiqueta="Ver las respuestas">
          <ul className="space-y-3 text-sm">
            {RELACIONES.map((x, i) => {
              const bien = r.a1_direccion[x.id] === x.correcta;
              return (
                <li key={x.id}>
                  <p className="font-semibold text-stone-800">
                    {i + 1}. {x.correcta === "dirigido" ? "Dirigido" : "No dirigido"}{" "}
                    <span className={bien ? "text-emerald-700" : "text-brand-700"}>
                      {bien ? "· acertaste" : "· revisa esta"}
                    </span>
                  </p>
                  <p className="mt-0.5 leading-relaxed text-stone-600">{x.porque}</p>
                </li>
              );
            })}
          </ul>
        </Revelable>
      </Ejercicio>

      <Ejercicio numero="1.3" titulo="Lo que se pierde en el camino">
        <Texto
          label="Una escritura tiene fecha, precio, área, linderos y ubicación. Una flecha solo dice de quién a quién. ¿Qué se pierde al convertir una escritura en una flecha? ¿Y qué se gana?"
          ayuda="Tres o cuatro frases. Usa al menos una de las seis escrituras como ejemplo."
          valor={r.a1_se_pierde}
          onChange={(v) => set("a1_se_pierde", v)}
          filas={5}
          placeholder="Escribe aquí…"
        />
      </Ejercicio>
    </div>
  );
}
