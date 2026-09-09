"use client";

import { COMPARACION, type Escenario } from "@/lib/escenarios";
import type { Respuestas } from "@/lib/tipos";
import {
  CabezaActo,
  Campo,
  Definicion,
  Ejercicio,
  ImagenAmpliable,
  Texto,
} from "./ui";

export default function Acto3Treq({
  r,
  set,
  escenario,
}: {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
  escenario: Escenario;
}) {
  return (
    <div>
      <CabezaActo
        numero={3}
        titulo="Leer el estudio que Cali sí tenía"
        bajada="Entre 2020 y 2022 Cali participó en el proyecto TREQ, financiado por USAID y ejecutado por la Fundación GEM con el Servicio Geológico Colombiano, la Alcaldía y el USGS. Modelaron 348.000 edificaciones, 2,3 millones de habitantes y 13 sismos posibles. A tu pareja le tocó uno de esos trece."
      />

      <Definicion titulo="Cómo se lee un perfil de riesgo sísmico">
        <p>
          Cada perfil es una página con cuatro partes. Vale la pena reconocerlas antes de
          buscar cifras:
        </p>
        <ul className="mb-3 space-y-1.5 text-stone-700">
          <li>
            <strong>Franja superior:</strong> qué sismo es (origen, magnitud, profundidad) y
            qué hay expuesto en la ciudad. Esa exposición es la misma en los trece perfiles.
          </li>
          <li>
            <strong>Mapa:</strong> el <em>índice de colapsos</em> por comuna, es decir, qué
            porcentaje de los edificios de esa comuna colapsa. Entre más oscuro, peor.
          </li>
          <li>
            <strong>Tabla:</strong> las comunas más afectadas, con fallecidos, heridos graves,
            desplazados y pérdidas económicas en miles de millones de pesos.
          </li>
          <li>
            <strong>Histogramas de abajo:</strong> el impacto total. Aquí está el detalle más
            importante del método.
          </li>
        </ul>
        <p>
          El TREQ no simuló el sismo una vez, sino <strong>2.000 veces</strong>. El mismo
          terremoto puede sentirse distinto en la superficie, así que el resultado no es un
          número: es un rango con un promedio. Además el modelo asume que el sismo ocurre de
          noche, con el 95 % de la gente dentro de las casas; de día las cifras de muertos
          serían mucho más bajas.
        </p>
      </Definicion>

      <section className="card mb-5 p-4 sm:p-5">
        <p className="eyebrow">El escenario de tu pareja</p>
        <h3 className="mt-1 text-xl font-bold text-stone-900">{escenario.titulo}</h3>
        <p className="mt-1 text-sm text-stone-600">{escenario.origen}</p>
        <p className="mt-2 font-mono text-sm text-stone-700">
          Magnitud {escenario.magnitud.toFixed(1)} · profundidad {escenario.profundidadKm} km ·
          evento {escenario.tipo}
        </p>
        <div className="mt-4">
          <ImagenAmpliable
            src={escenario.imagen}
            alt={`Perfil de riesgo sísmico TREQ para el escenario ${escenario.titulo}`}
          />
        </div>
      </section>

      <Ejercicio numero="3.1" titulo="Extrae las cifras de tu perfil">
        <p className="mb-4 text-[15px] leading-relaxed text-stone-600">
          Amplía la imagen y busca cada dato. Copia lo que dice la infografía, sin redondear.
        </p>
        <div className="space-y-4">
          <Campo
            label="Índice de colapsos en toda la ciudad"
            valor={r.a3_indice_colapsos}
            onChange={(v) => set("a3_indice_colapsos", v)}
            placeholder="Ej.: 0,52 %"
          />
          <Campo
            label="Las tres comunas con mayor índice de colapsos"
            valor={r.a3_comunas_top}
            onChange={(v) => set("a3_comunas_top", v)}
            placeholder="Ej.: comuna 1, comuna 10, comuna 9"
          />
          <Campo
            label="Fallecidos: promedio de las 2.000 simulaciones"
            valor={r.a3_fallecidos_prom}
            onChange={(v) => set("a3_fallecidos_prom", v)}
            placeholder="Ej.: 1.200"
          />
          <Campo
            label="Fallecidos: rango completo (mínimo – máximo)"
            valor={r.a3_fallecidos_rango}
            onChange={(v) => set("a3_fallecidos_rango", v)}
            placeholder="Ej.: 800 – 1.800"
          />
          <Campo
            label="Comuna con MÁS pérdidas económicas"
            valor={r.a3_comuna_perdidas}
            onChange={(v) => set("a3_comuna_perdidas", v)}
            placeholder="Número de comuna y cifra"
          />
          <Campo
            label="Comuna con MÁS fallecidos"
            valor={r.a3_comuna_fallecidos}
            onChange={(v) => set("a3_comuna_fallecidos", v)}
            placeholder="Número de comuna y cifra"
          />
        </div>
      </Ejercicio>

      <Ejercicio numero="3.2" titulo="Lo que las cifras dicen entre líneas">
        <Texto
          label="¿La comuna con más pérdidas económicas es la misma que la de más fallecidos?"
          ayuda="Si no lo es, explica por qué crees que no. ¿Qué revela ese desacople sobre quién pone la plata y quién pone los muertos en un desastre? Fíjate en que la ciudad es la misma y el sismo es el mismo: lo único que cambia es qué hay construido y quién vive ahí."
          valor={r.a3_desacople}
          onChange={(v) => set("a3_desacople", v)}
          filas={6}
        />
        <Texto
          label="El resultado no es un número sino un rango. ¿Qué significa eso, y por qué un modelo serio entrega un rango?"
          ayuda="Piensa qué pasaría si un funcionario tuviera que tomar una decisión de presupuesto con el promedio, y qué pasaría si la tomara con el peor caso del rango."
          valor={r.a3_rango_significa}
          onChange={(v) => set("a3_rango_significa", v)}
          filas={6}
        />
      </Ejercicio>

      <Ejercicio numero="3.3" titulo="La magnitud no manda">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Estas cifras salen de cinco de los trece perfiles del mismo estudio, sobre la misma
          ciudad y la misma exposición. Léelas con cuidado antes de responder.
        </p>

        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-stone-300 text-left">
                <th className="px-3 py-2 font-semibold text-stone-700">Escenario</th>
                <th className="px-3 py-2 text-right font-semibold text-stone-700">Mw</th>
                <th className="px-3 py-2 text-right font-semibold text-stone-700">Prof.</th>
                <th className="px-3 py-2 text-right font-semibold text-stone-700">
                  Índice colapsos
                </th>
                <th className="px-3 py-2 text-right font-semibold text-stone-700">Colapsos</th>
                <th className="px-3 py-2 text-right font-semibold text-stone-700">
                  Fallecidos
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARACION.map((f) => (
                <tr key={f.escenario} className="border-b border-stone-200">
                  <td className="px-3 py-2 text-stone-800">{f.escenario}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-stone-900">
                    {f.mw}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-stone-600">{f.prof}</td>
                  <td className="px-3 py-2 text-right font-mono text-stone-600">{f.indice}</td>
                  <td className="px-3 py-2 text-right font-mono text-stone-600">
                    {f.colapsos}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-brand-700">
                    {f.fallecidos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-stone-500">
          Promedios de 2.000 simulaciones por escenario. Fuente: TREQ/GEM (2022), perfiles de
          preparación y respuesta.
        </p>

        <div className="my-5 rounded-lg border-l-4 border-brand-500 bg-brand-50 p-4">
          <p className="text-[15px] leading-relaxed text-brand-900">
            El terremoto de <strong>1906 tuvo magnitud 8.8</strong> y el modelo estima{" "}
            <strong>12 fallecidos</strong>. El hipotético de Dagua–Calima tiene{" "}
            <strong>magnitud 6.5</strong> y el modelo estima <strong>1.200</strong>: cien veces
            más muertos con mucha menos magnitud.
          </p>
        </div>

        <Texto
          label="¿Cómo es posible? Da al menos dos razones."
          ayuda="Pista: la magnitud mide la energía que libera la falla, no lo que le llega a un edificio. Vuelve a los tres factores del Acto 1 y pregúntate cuál está cambiando entre una fila y otra. Cierra respondiendo qué le dirías a alguien convencido de que «lo único que importa es qué tan fuerte fue el sismo»."
          valor={r.a3_no_linealidad}
          onChange={(v) => set("a3_no_linealidad", v)}
          filas={7}
        />
      </Ejercicio>

      <section className="card mb-5 p-4 sm:p-5">
        <h3 className="mb-2 text-base font-bold text-stone-900">
          Si quieres ir al informe completo
        </h3>
        <p className="text-[15px] leading-relaxed text-stone-600">
          Para el taller te basta con tu perfil, pero el estudio entero está disponible y vale
          la pena hojearlo. Son 79 páginas: cómo construyeron el modelo de exposición, las
          funciones de vulnerabilidad, los trece escenarios y sus límites declarados.
        </p>
        <ul className="mt-3 space-y-2 text-[15px]">
          <li>
            <a
              href="/TREQ_riesgo_sismico_Cali_2022.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              Informe completo en PDF
            </a>{" "}
            <span className="text-stone-500">
              — ojo, pesa unos 8 MB: mejor con wifi.
            </span>
          </li>
          <li>
            <a
              href="https://www.globalquakemodel.org/proj/treq"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              Página del proyecto TREQ
            </a>{" "}
            <span className="text-stone-500">(Fundación GEM)</span>
          </li>
          <li>
            <a
              href="https://github.com/gem/treq-riesgo-urbano"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              Repositorio abierto con los modelos y resultados
            </a>{" "}
            <span className="text-stone-500">— los datos crudos, si te dan ganas.</span>
          </li>
        </ul>
        <p className="mt-4 border-t border-stone-200 pt-3 text-sm leading-relaxed text-stone-500">
          Yepes-Estrada C, Calderón A, Acevedo A, Pérez H (2022).{" "}
          <em>Evaluación de Riesgo Sísmico para Santiago de Cali.</em> GEM-TREQ, Reporte
          Técnico D2.6.2. Financiado por USAID/BHA. Publicado bajo licencia CC BY-NC-SA 4.0 y
          reproducido aquí sin modificaciones, con fines educativos.
        </p>
      </section>
    </div>
  );
}
