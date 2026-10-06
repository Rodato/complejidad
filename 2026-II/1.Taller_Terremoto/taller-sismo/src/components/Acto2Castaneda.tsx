"use client";

import { useState } from "react";
import {
  CRONOLOGIA,
  LECTURA_CASTANEDA,
  OPCIONES_CRONOLOGIA,
  type TipoAccion,
} from "@/lib/contenido";
import type { Respuestas } from "@/lib/tipos";
import { CabezaActo, Definicion, Ejercicio, Opciones, Revelable, Texto } from "./ui";

export default function Acto2Castaneda({
  r,
  set,
}: {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
}) {
  const [leyendo, setLeyendo] = useState(false);

  const marcadas = Object.values(r.a2_cronologia).filter(Boolean).length;
  const completo = marcadas === CRONOLOGIA.length;
  const nConocer = Object.values(r.a2_cronologia).filter((v) => v === "conocer").length;
  const nActuar = Object.values(r.a2_cronologia).filter((v) => v === "actuar").length;

  return (
    <div>
      <CabezaActo
        numero={2}
        titulo="Veintiséis años de saber sin hacer"
        bajada="Ahora vas a leer un texto corto de Sergio Castañeda que revisa lo que hizo la administración de Cali entre el POT del año 2000 y el terremoto. Léelo completo antes de responder: se demora unos ocho minutos."
      />

      <Definicion titulo="Cómo leer un texto que sostiene una tesis">
        <p>
          Este no es un informe neutral: es un <strong>argumento</strong>. Castañeda afirma
          algo y trata de probarlo con documentos. Leerlo bien no significa creerle ni
          desconfiar por principio: significa distinguir qué respalda con evidencia, qué
          reconoce que no puede probar y dónde su conclusión va más lejos que sus datos.
        </p>
        <p>
          Fíjate en que él mismo marca sus límites («no parece haber sido», «sería incorrecto
          afirmar que Cali no realizó ningún reforzamiento»). Esos matices no son debilidad
          del texto: son lo que lo hace serio. Búscalos mientras lees.
        </p>
      </Definicion>

      <section className="card mb-5 overflow-hidden">
        <div className="border-b border-stone-200 bg-stone-50 p-4 sm:p-5">
          <p className="eyebrow">Lectura</p>
          <h3 className="mt-1 text-xl font-bold text-stone-900">
            Cali ante el espejo del terremoto
          </h3>
          <p className="mt-1 text-sm text-stone-600">
            Una lectura crítica de la gestión del riesgo sísmico desde el POT de 2000 hasta el
            10 de agosto de 2026, fecha del terremoto.
          </p>
          <p className="mt-2 text-sm font-medium text-stone-700">Sergio Castañeda</p>
        </div>

        <div className="p-4 sm:p-5">
          {!leyendo ? (
            <button onClick={() => setLeyendo(true)} className="btn btn-primary w-full">
              Abrir la lectura (≈ 8 min)
            </button>
          ) : (
            <>
              <div className="prosa text-[15px]">
                {LECTURA_CASTANEDA.map((b, i) => {
                  if (b.tipo === "h")
                    return (
                      <h4
                        key={i}
                        className="mt-6 mb-2 text-base font-bold text-stone-900 first:mt-0"
                      >
                        {b.texto}
                      </h4>
                    );
                  if (b.tipo === "cita")
                    return (
                      <blockquote
                        key={i}
                        className="my-4 border-l-4 border-brand-400 bg-brand-50 py-2 pl-4 pr-3 text-[15px] font-medium leading-relaxed text-brand-900"
                      >
                        {b.texto}
                      </blockquote>
                    );
                  if (b.tipo === "flecha")
                    return (
                      <p
                        key={i}
                        className="my-4 rounded-lg border border-stone-200 bg-stone-50 p-3 text-center font-mono text-[13px] leading-relaxed text-stone-700"
                      >
                        {b.texto}
                      </p>
                    );
                  return <p key={i}>{b.texto}</p>;
                })}
              </div>
              <button
                onClick={() => setLeyendo(false)}
                className="btn btn-secondary mt-4 w-full"
              >
                Contraer la lectura
              </button>
            </>
          )}
        </div>
      </section>

      <Ejercicio numero="2.1" titulo="La cronología: ¿conocer o actuar?">
        <p className="mb-4 text-[15px] leading-relaxed text-stone-600">
          Estos son los nueve hitos que Castañeda documenta. Para cada uno decide si produjo{" "}
          <strong>conocimiento</strong> sobre el riesgo, si <strong>actuó</strong> materialmente
          sobre las edificaciones vulnerables, o si no hizo ninguna de las dos cosas.
        </p>

        <div className="space-y-5">
          {CRONOLOGIA.map((c) => (
            <div key={c.id}>
              <p className="mb-2 text-[15px] leading-relaxed text-stone-800">
                <span className="mr-2 inline-block rounded bg-stone-800 px-2 py-0.5 align-middle font-mono text-xs font-semibold text-white">
                  {c.anio}
                </span>
                {c.hecho}
              </p>
              <Opciones<TipoAccion>
                opciones={OPCIONES_CRONOLOGIA}
                valor={r.a2_cronologia[c.id] ?? ""}
                onChange={(v) => set("a2_cronologia", { ...r.a2_cronologia, [c.id]: v })}
                columnas
              />
            </div>
          ))}
        </div>

        {completo && (
          <div className="mt-5 rounded-lg border border-stone-300 bg-stone-100 p-4">
            <p className="text-sm text-stone-700">
              Según tu clasificación, de {CRONOLOGIA.length} hitos en 26 años:
            </p>
            <p className="mt-2 text-lg font-bold text-stone-900">
              {nConocer} produjeron conocimiento · {nActuar} actuaron sobre las edificaciones
            </p>
          </div>
        )}

        <div className="mt-4">
          <Texto
            label="Mira esos dos números. ¿Qué patrón ves en 26 años?"
            ayuda="Y una pregunta más difícil: el hito de 2005, cuando se acaban los recursos de la Red de Acelerógrafos, ¿en cuál de las tres categorías cabe? ¿Qué te dice eso?"
            valor={r.a2_patron}
            onChange={(v) => set("a2_patron", v)}
            filas={5}
          />
        </div>

        <Revelable habilitado={completo} etiqueta="Ver un comentario sobre este ejercicio">
          <div className="space-y-2 text-sm leading-relaxed text-stone-700">
            <p>
              Aquí no hay una única respuesta correcta, pero sí un patrón difícil de esquivar:
              casi todos los hitos que Castañeda encuentra son de producción de conocimiento.
              Estudios, convenios, modelos, mapas, plazos. El artículo 233 del POT ordenaba una
              cosa distinta —ir vivienda por vivienda a determinar su patología estructural— y
              esa es justamente la que no aparece en la lista.
            </p>
            <p>
              El hito de 2005 es el más interesante porque no cabe en ninguna de las dos:{" "}
              <strong>desmontó</strong> conocimiento que ya existía. La ciudad no solo dejó de
              actuar; también dejó de medir. Guárdate esa idea para el Acto 4.
            </p>
          </div>
        </Revelable>
      </Ejercicio>

      <Ejercicio numero="2.2" titulo="Leer el argumento, no solo la conclusión">
        <Texto
          label="Cita una frase donde Castañeda afirme algo respaldado en documentos, y otra donde reconozca un límite de su propia evidencia."
          ayuda="Después explica en una o dos frases por qué esa distinción importa para juzgar si su tesis se sostiene."
          valor={r.a2_demuestra}
          onChange={(v) => set("a2_demuestra", v)}
          filas={6}
        />
        <Texto
          label="Castañeda dice que «el problema fundamental no parece haber sido la inexistencia de información». Si no fue falta de información, ¿qué fue?"
          ayuda="Formúlalo con tus propias palabras, en un máximo de tres frases. No copies el texto: tradúcelo."
          valor={r.a2_problema}
          onChange={(v) => set("a2_problema", v)}
          filas={5}
        />
      </Ejercicio>
    </div>
  );
}
