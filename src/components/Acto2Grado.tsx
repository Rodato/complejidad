"use client";

import { useMemo, useState } from "react";
import { ARISTAS_MEDICI, FAMILIAS } from "@/lib/contenido";
import { crearRed, grado } from "@/lib/red";
import type { Respuestas } from "@/lib/tipos";
import { NODOS_FAMILIAS } from "./Acto1Red";
import Red from "./Red";
import { CabezaActo, Campo, Definicion, Ejercicio, Lienzo, Revelable, Texto } from "./ui";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
  familia: string;
};

export default function Acto2Grado({ r, set, familia }: Props) {
  const [tocada, setTocada] = useState<string | null>(null);
  const gradosFlorencia = useMemo(
    () => grado(crearRed(FAMILIAS.map((f) => f.id), ARISTAS_MEDICI)),
    [],
  );
  const florenciaListo = [r.a2_grado_medici, r.a2_grado_strozzi, r.a2_grado_familia].every(
    (v) => v.trim(),
  );

  return (
    <div>
      <CabezaActo
        numero={2}
        titulo="Contar vínculos: el grado"
        bajada="La medida más simple de una red es contar cuántos vínculos tiene cada nodo. Si el poder en Florencia se hacía con alianzas matrimoniales, la primera sospecha es obvia: manda el que tiene más aliados. Pongámosla a prueba."
      />

      <Definicion titulo="Grado">
        <p>
          El <strong>grado</strong> de un nodo es el número de vínculos que tiene. En la red de
          Florencia, el grado de una familia es cuántos matrimonios tiene con las demás.
        </p>
        <p>
          En una red dirigida el grado se cuenta por separado: <strong>grado de entrada</strong>{" "}
          (las flechas que llegan) y <strong>grado de salida</strong> (las que salen). En la red
          de compraventas de la Notaría de Cali, cada flecha que llega es tierra que se recibe:
          el grado de entrada mide la <strong>acumulación</strong> de tierra. Lo vamos a usar
          desde la próxima semana.
        </p>
      </Definicion>

      <Ejercicio numero="2.1" titulo="Contar matrimonios">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Toca una familia para ver con quiénes está casada. Tu pareja estudia a los{" "}
          <strong className="text-brand-700">{familia}</strong> (salen de tu código): vas a
          seguirlos durante todo el taller.
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
            aristas={ARISTAS_MEDICI}
            seleccionado={tocada}
            marcados={tocada ? [] : [familia]}
            onToque={(id) => setTocada((t) => (t === id ? null : id))}
            titulo="Red de matrimonios entre familias florentinas"
          />
        </Lienzo>
        <div className="grid grid-cols-3 gap-3">
          <Campo
            label="Grado de los Medici"
            valor={r.a2_grado_medici}
            onChange={(v) => set("a2_grado_medici", v)}
            numerico
          />
          <Campo
            label="Grado de los Strozzi"
            valor={r.a2_grado_strozzi}
            onChange={(v) => set("a2_grado_strozzi", v)}
            numerico
          />
          <Campo
            label={`Grado de los ${familia}`}
            valor={r.a2_grado_familia}
            onChange={(v) => set("a2_grado_familia", v)}
            numerico
          />
        </div>
        <Revelable habilitado={florenciaListo} etiqueta="Ver los grados de todas las familias">
          <ol className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {Object.entries(gradosFlorencia)
              .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
              .map(([f, g]) => (
                <li
                  key={f}
                  className={`flex justify-between border-b border-stone-200 py-1 ${
                    f === familia ? "font-bold text-brand-700" : "text-stone-700"
                  }`}
                >
                  <span>{f}</span>
                  <span className="tabular-nums">{g}</span>
                </li>
              ))}
          </ol>
        </Revelable>
      </Ejercicio>

      <Ejercicio numero="2.2" titulo="¿Alcanza con contar?">
        <Texto
          label="Los Medici tienen 6 matrimonios; los Strozzi, 4. Jackson dice que esa diferencia «sugiere», pero no alcanza para explicar por qué ganaron los Medici. ¿Por qué no alcanza? ¿Qué no mide el grado?"
          ayuda="Mira la red: más allá de cuántos matrimonios tiene cada uno, ¿con quién están casados los Medici y con quién los Strozzi?"
          valor={r.a2_grado_basta}
          onChange={(v) => set("a2_grado_basta", v)}
          filas={5}
          placeholder="Escribe aquí…"
        />
      </Ejercicio>
    </div>
  );
}
