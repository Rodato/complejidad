"use client";

import { ETAPAS_LAZO, OPCIONES_LAZO, type Cumplimiento } from "@/lib/contenido";
import { PERFIL_MITIGACION } from "@/lib/escenarios";
import type { Respuestas } from "@/lib/tipos";
import {
  CabezaActo,
  Definicion,
  Ejercicio,
  ImagenAmpliable,
  Opciones,
  Texto,
} from "./ui";

export default function Acto4Lazo({
  r,
  set,
}: {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
}) {
  return (
    <div>
      <CabezaActo
        numero={4}
        titulo="El lazo que no se cerró"
        bajada="Ya tienes las dos mitades: un texto que documenta 26 años de decisiones y un modelo que cuantifica lo que estaba en juego. Falta ponerles nombre a los mecanismos. Estas tres ideas son las que vamos a usar durante todo el curso."
      />

      <Definicion titulo="Variables lentas y variables rápidas">
        <p>
          El sismo duró unos segundos. La vulnerabilidad que lo convirtió en desastre se
          acumuló durante veintiséis años, o más. En un sistema complejo casi siempre conviven
          procesos de velocidades muy distintas, y el evento rápido suele ser solo la{" "}
          <strong>revelación</strong> del estado en que estaba la variable lenta.
        </p>
        <p>
          Por eso Castañeda escribe: «El terremoto no creó esa contradicción. La hizo visible».
          Confundir el detonante con la causa es el error más común al analizar un desastre.
        </p>
      </Definicion>

      <Definicion titulo="Retroalimentación: el lazo de control">
        <p>
          Para que un sistema se corrija a sí mismo necesita un circuito cerrado:{" "}
          <strong>medir → diagnosticar → decidir → financiar → actuar → volver a medir</strong>.
          La última flecha es la decisiva: si el resultado de la acción no regresa como
          información nueva, el sistema no aprende.
        </p>
        <p>
          Si el circuito se corta en cualquier punto, el sistema puede tener toda la información
          del mundo y aun así no corregirse. Un sistema que mide y no actúa es un{" "}
          <strong>lazo abierto</strong>: produce diagnósticos cada vez mejores de un problema
          que no cambia.
        </p>
      </Definicion>

      <Definicion titulo="Dependencia de trayectoria">
        <p>
          Lo que se construyó antes de que existiera norma sismorresistente sigue en pie hoy.
          Las decisiones del pasado quedan incorporadas <em>físicamente</em> en la ciudad, en
          forma de muros, columnas y cimentaciones que nadie va a rehacer por gusto.
        </p>
        <p>
          Por eso una ciudad no puede simplemente «cambiar de política»: arrastra su propia
          historia construida. El pasado de Cali no es historia; es material de construcción
          todavía parado.
        </p>
      </Definicion>

      <Ejercicio numero="4.1" titulo="¿Dónde se rompió el circuito?">
        <p className="mb-4 text-[15px] leading-relaxed text-stone-600">
          Con lo que leíste en Castañeda, marca para cada etapa del lazo si Cali la cumplió
          entre 2000 y 2026. Si el texto no da elementos para juzgarla, marca «No sé»: eso
          también es un hallazgo.
        </p>

        <div className="space-y-5">
          {ETAPAS_LAZO.map((e, i) => (
            <div key={e.id}>
              <p className="mb-0.5 text-[15px] font-semibold text-stone-900">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-800 text-xs font-bold text-white">
                  {i + 1}
                </span>
                {e.etapa}
              </p>
              <p className="mb-2 ml-8 text-sm leading-relaxed text-stone-600">{e.detalle}</p>
              <Opciones<Cumplimiento>
                opciones={OPCIONES_LAZO}
                valor={r.a4_lazo[e.id] ?? ""}
                onChange={(v) => set("a4_lazo", { ...r.a4_lazo, [e.id]: v })}
              />
            </div>
          ))}
        </div>

        <div className="mt-5">
          <Texto
            label="¿En qué etapa exacta se rompe el lazo? Justifícalo citando el texto."
            ayuda="Y una segunda pregunta: ¿por qué crees que se rompe justo ahí y no en otra parte? Piensa en quién es el dueño de las viviendas privadas, cuánto dura una alcaldía y quién paga un reforzamiento."
            valor={r.a4_donde_rompe}
            onChange={(v) => set("a4_donde_rompe", v)}
            filas={7}
          />
        </div>
      </Ejercicio>

      <Ejercicio numero="4.2" titulo="Tu argumento">
        <blockquote className="mb-4 border-l-4 border-brand-400 bg-brand-50 py-3 pl-4 pr-3 text-[15px] font-medium leading-relaxed text-brand-900">
          «El terremoto no creó esa contradicción. La hizo visible.»
        </blockquote>
        <Texto
          label="Defiende o complica esta frase."
          ayuda="Es obligatorio usar UNA fecha del texto de Castañeda y UNA cifra del TREQ (puede ser de tu perfil). Complicar la frase es tan válido como defenderla: por ejemplo, podrías argumentar que el terremoto sí creó algo nuevo, o que la frase le quita peso a decisiones concretas al presentarlo todo como una contradicción abstracta."
          valor={r.a4_argumento}
          onChange={(v) => set("a4_argumento", v)}
          filas={12}
          minPalabras={200}
          maxPalabras={300}
        />
      </Ejercicio>

      <Ejercicio numero="4.3" titulo="Lo que el modelo no vio">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Este es el otro perfil del TREQ: no un sismo concreto, sino el promedio de todos los
          sismos posibles en 100.000 años simulados. Señala en qué comunas se concentra el
          riesgo año tras año, y cómo se reparte por estrato social.
        </p>
        <ImagenAmpliable
          src={PERFIL_MITIGACION}
          alt="Perfil de mitigación y gestión del riesgo sísmico de Cali, TREQ/GEM 2022"
        />

        <div className="my-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-white p-3">
            <p className="eyebrow">El modelo anticipaba</p>
            <p className="mt-1 text-[15px] leading-relaxed text-stone-800">
              Bretaña, El Nacional, Marco Fidel Suárez, San Antonio y La Isla como los cinco
              barrios de mayor riesgo anual.
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-3">
            <p className="eyebrow">El daño real del 10 de agosto</p>
            <p className="mt-1 text-[15px] leading-relaxed text-stone-800">
              Los Cámbulos, Cuarto de Legua, Nueva Tequendama, Olímpico y sectores del Limonar,
              alrededor del abanico de Cañaveralejo.
            </p>
          </div>
        </div>

        <Texto
          label="¿Coinciden las dos listas? ¿Cómo explicas la diferencia?"
          ayuda="Pista importante: el perfil de mitigación promedia TODOS los sismos posibles durante 100.000 años. El del 10 de agosto fue UNO solo, con una ubicación y una profundidad concretas. Piensa también en qué mide el modelo (colapsos y muertos) y qué no mide. Última pregunta: ¿esta diferencia significa que el modelo estaba equivocado, o significa otra cosa?"
          valor={r.a4_modelo_vs_dano}
          onChange={(v) => set("a4_modelo_vs_dano", v)}
          filas={8}
        />
      </Ejercicio>
    </div>
  );
}
