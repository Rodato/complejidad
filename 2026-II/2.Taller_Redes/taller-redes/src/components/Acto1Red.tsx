"use client";

import { useState } from "react";
import {
  ARISTAS_MEDICI,
  FAMILIAS,
  NOMBRES_FAMILIAS,
  RELACIONES,
  VINCULO_FALTANTE,
  type Direccion,
} from "@/lib/contenido";
import type { Respuestas } from "@/lib/tipos";
import Red from "./Red";
import {
  CabezaActo,
  Campo,
  Definicion,
  Ejercicio,
  Lienzo,
  Opciones,
  Revelable,
  Selector,
  Texto,
  Veredicto,
} from "./ui";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export const NODOS_FAMILIAS = FAMILIAS.map((f) => ({ id: f.id, etiqueta: f.id, x: f.x, y: f.y }));

const mismoVinculo = (a: string, b: string, [x, y]: [string, string]) =>
  (a === x && b === y) || (a === y && b === x);

const ARISTAS_SIN_UNA = ARISTAS_MEDICI.filter(([a, b]) => !mismoVinculo(a, b, VINCULO_FALTANTE));
const LISTA = [...ARISTAS_MEDICI]
  .map(([a, b]) => (a.localeCompare(b) <= 0 ? [a, b] : [b, a]))
  .sort((x, y) => x[0].localeCompare(y[0]) || x[1].localeCompare(y[1]));
const OPCIONES_FAMILIAS = NOMBRES_FAMILIAS.map((f) => ({ clave: f, nombre: f }));

export function aciertosDireccion(r: Respuestas): number {
  return RELACIONES.filter((x) => r.a1_direccion[x.id] === x.correcta).length;
}

export default function Acto1Red({ r, set }: Props) {
  const [tocada, setTocada] = useState<string | null>(null);
  const eligioFaltante = Boolean(r.a1_falta_a && r.a1_falta_b);
  const acerto = mismoVinculo(r.a1_falta_a, r.a1_falta_b, VINCULO_FALTANTE);
  const direccionLista = RELACIONES.every((x) => r.a1_direccion[x.id]);

  return (
    <div>
      <CabezaActo
        numero={1}
        titulo="Qué es una red"
        bajada="Entre 1400 y 1434 la familia Medici pasó de ser una más de la oligarquía de Florencia a controlar la ciudad. Lo raro es que no eran los más ricos ni los que más puestos tenían en el gobierno: esos eran los Strozzi. Jackson abre su libro con este caso, y todo este taller gira alrededor de la misma pregunta: ¿por qué los Medici?"
      />

      <Definicion titulo="Nodos y vínculos">
        <p>
          Una red tiene solo dos ingredientes. Los <strong>nodos</strong> son los actores; aquí,
          15 familias de la élite florentina. Los <strong>vínculos</strong> (también se les dice
          aristas o enlaces) son las relaciones entre ellos; aquí, los matrimonios. En esa época
          los matrimonios los arreglaban los patriarcas y eran alianzas políticas.
        </p>
        <p>
          Una red se puede escribir de dos maneras. Como <strong>dibujo</strong>, que sirve para
          mirar. Y como <strong>lista de vínculos</strong>: una fila por cada vínculo, con los
          dos nodos que une. La lista es la que sirve para calcular, y es la forma en que llegan
          los datos. Las escrituras de la Notaría de Cali que vamos a estudiar la próxima semana
          son, justamente, una lista de vínculos.
        </p>
      </Definicion>

      <Ejercicio numero="1.1" titulo="El dibujo y la lista">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Aquí están las dos versiones de la red. Pero el dibujo tiene un error: le falta uno de
          los matrimonios de la lista. Toca una familia para ver sus vínculos en el dibujo, y
          compara con la lista.
        </p>
        <Lienzo
          pie={
            tocada
              ? `${tocada}: toca otra familia, o la misma para soltarla.`
              : "Toca una familia para resaltar sus matrimonios."
          }
        >
          <Red
            nodos={NODOS_FAMILIAS}
            aristas={eligioFaltante && acerto ? ARISTAS_MEDICI : ARISTAS_SIN_UNA}
            seleccionado={tocada}
            onToque={(id) => setTocada((t) => (t === id ? null : id))}
            titulo="Red de matrimonios entre familias florentinas"
          />
        </Lienzo>

        <details className="mb-4 rounded-lg border border-stone-200 bg-stone-50" open>
          <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-stone-800">
            Lista de vínculos (matrimonios)
          </summary>
          <ol className="grid grid-cols-1 gap-x-4 px-3 pb-3 text-sm text-stone-700 sm:grid-cols-2">
            {LISTA.map(([a, b], i) => (
              <li key={`${a}-${b}`} className="flex gap-2 border-b border-stone-200 py-1">
                <span className="w-5 text-right tabular-nums text-stone-400">{i + 1}</span>
                <span>
                  {a} — {b}
                </span>
              </li>
            ))}
          </ol>
        </details>

        <div className="grid grid-cols-2 gap-3">
          <Campo
            label="¿Cuántos nodos tiene la red?"
            valor={r.a1_n_nodos}
            onChange={(v) => set("a1_n_nodos", v)}
            numerico
          />
          <Campo
            label="¿Cuántos vínculos?"
            valor={r.a1_n_vinculos}
            onChange={(v) => set("a1_n_vinculos", v)}
            numerico
          />
        </div>

        <p className="mb-2 mt-4 text-[15px] font-medium text-stone-800">
          ¿Qué matrimonio de la lista falta en el dibujo?
        </p>
        <div className="flex gap-2">
          <Selector
            label="Una familia"
            valor={r.a1_falta_a}
            onChange={(v) => set("a1_falta_a", v)}
            opciones={OPCIONES_FAMILIAS}
          />
          <Selector
            label="La otra"
            valor={r.a1_falta_b}
            onChange={(v) => set("a1_falta_b", v)}
            opciones={OPCIONES_FAMILIAS}
          />
        </div>
        {eligioFaltante && (
          <Veredicto bien={acerto}>
            {acerto
              ? "Ese era. Ya quedó dibujado. Encontrarlo exigía pasar del dibujo a la lista, familia por familia: es lo que hace un computador cada vez que calcula algo sobre una red."
              : "Ese matrimonio sí está en el dibujo. Revisa la lista fila por fila y toca cada familia para comprobar."}
          </Veredicto>
        )}

        <Revelable
          habilitado={Boolean(r.a1_n_nodos.trim() && r.a1_n_vinculos.trim())}
          etiqueta="Ver cuántos nodos y vínculos"
        >
          <p className="text-sm leading-relaxed text-stone-600">
            <strong>{FAMILIAS.length} nodos y {ARISTAS_MEDICI.length} vínculos.</strong> Los
            nodos se cuentan en el dibujo; los vínculos, en la lista (una fila por vínculo). En la
            base original había una familia más, los Pucci, que no tenían matrimonios con
            ninguna de las otras: un nodo sin vínculos se llama <strong>aislado</strong>, y Jackson
            lo deja por fuera.
          </p>
        </Revelable>
      </Ejercicio>

      <Definicion titulo="Con flecha o sin flecha">
        <p>
          Un vínculo puede tener dirección o no tenerla. En un matrimonio no hay dirección: si
          los Medici están casados con los Albizzi, los Albizzi están casados con los Medici. Es
          una red <strong>no dirigida</strong> y el vínculo es una línea. En una compraventa, en
          cambio, la tierra va del vendedor al comprador: es una red <strong>dirigida</strong> y
          el vínculo es una flecha.
        </p>
      </Definicion>

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

      <Ejercicio numero="1.3" titulo="Una red es una decisión">
        <Texto
          label="Esta red solo tiene matrimonios. Pero las familias también se relacionaban de otras formas. Elige otra relación que pudiera importar para el poder en Florencia. ¿Sería dirigida o no? ¿Crees que cambiaría quién parece más importante?"
          ayuda="Tres o cuatro frases. La idea: qué cuenta como vínculo lo decide quien investiga, antes de dibujar, y esa decisión cambia lo que la red muestra."
          valor={r.a1_otra_relacion}
          onChange={(v) => set("a1_otra_relacion", v)}
          filas={5}
          placeholder="Escribe aquí…"
        />
      </Ejercicio>
    </div>
  );
}
