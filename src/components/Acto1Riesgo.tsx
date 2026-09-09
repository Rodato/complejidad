"use client";

import {
  ENUNCIADOS_FACTOR,
  FACTORES,
  NOMBRE_FACTOR,
  type Factor,
} from "@/lib/contenido";
import type { Respuestas } from "@/lib/tipos";
import { CabezaActo, Definicion, Ejercicio, Opciones, Revelable, Texto } from "./ui";

export default function Acto1Riesgo({
  r,
  set,
}: {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
}) {
  const completo = ENUNCIADOS_FACTOR.every((e) => r.a1_clasificacion[e.id]);

  return (
    <div>
      <CabezaActo
        numero={1}
        titulo="Un terremoto no es un desastre"
        bajada="El 10 de agosto la tierra se movió durante unos segundos. Eso es un fenómeno natural. Que unos edificios se cayeran y otros no, y que se cayeran justo esos, no es un fenómeno natural: es el resultado de decisiones tomadas durante décadas. Empecemos por separar las dos cosas."
      />

      <Definicion titulo="Riesgo = Amenaza × Exposición × Vulnerabilidad">
        <p>
          Es el marco que usa el propio estudio TREQ que vamos a leer. El riesgo de desastre
          no es una cosa sola: es el producto de tres factores distintos.
        </p>
        <ul className="mb-3 space-y-2">
          {FACTORES.map((f) => (
            <li key={f.clave}>
              <strong className="text-brand-800">{f.nombre}.</strong>{" "}
              <span className="text-stone-700">{f.def}</span>
            </li>
          ))}
        </ul>
        <p>
          Fíjate en que es una <strong>multiplicación</strong>, no una suma. Si cualquiera de
          los tres factores fuera cero, no habría desastre. Un sismo de magnitud 8 en mitad del
          océano no es un desastre: no hay exposición. Un sismo de magnitud 6 debajo de una
          ciudad construida con materiales frágiles, sí lo es.
        </p>
        <p>
          Esto ya es una idea de sistemas complejos: <em>el resultado no está en ninguna de las
          partes</em>. No está en la falla geológica, ni en el número de edificios, ni en el
          material de los muros. Está en la <strong>interacción</strong> de los tres.
        </p>
      </Definicion>

      <Ejercicio
        numero="1.1"
        titulo="¿Amenaza, exposición o vulnerabilidad?"
      >
        <p className="mb-4 text-[15px] leading-relaxed text-stone-600">
          Las seis frases siguientes salen del estudio TREQ y del texto de Castañeda.
          Clasifica cada una. Una de ellas es más difícil de lo que parece.
        </p>

        <div className="space-y-5">
          {ENUNCIADOS_FACTOR.map((e, i) => (
            <div key={e.id}>
              <p className="mb-2 text-[15px] leading-relaxed text-stone-800">
                <span className="mr-1.5 font-semibold text-stone-400">{i + 1}.</span>
                {e.texto}
              </p>
              <Opciones<Factor>
                opciones={FACTORES.map((f) => ({ clave: f.clave, nombre: f.nombre }))}
                valor={r.a1_clasificacion[e.id] ?? ""}
                onChange={(v) =>
                  set("a1_clasificacion", { ...r.a1_clasificacion, [e.id]: v })
                }
              />
            </div>
          ))}
        </div>

        <Revelable habilitado={completo} etiqueta="Ver las respuestas y por qué">
          <ul className="space-y-3 text-sm">
            {ENUNCIADOS_FACTOR.map((e, i) => {
              const mia = r.a1_clasificacion[e.id];
              const bien = mia === e.correcta;
              return (
                <li key={e.id}>
                  <p className="font-semibold text-stone-800">
                    {i + 1}. {NOMBRE_FACTOR[e.correcta]}{" "}
                    <span className={bien ? "text-emerald-700" : "text-brand-700"}>
                      {bien ? "· acertaste" : `· tú marcaste ${NOMBRE_FACTOR[mia as Factor]}`}
                    </span>
                  </p>
                  <p className="mt-0.5 leading-relaxed text-stone-600">{e.porque}</p>
                </li>
              );
            })}
          </ul>
        </Revelable>
      </Ejercicio>

      <Ejercicio numero="1.2" titulo="Quién puede mover cada factor">
        <Texto
          label="De los tres factores, ¿cuál NO puede modificar una alcaldía, y cuáles sí?"
          ayuda="Responde en tres o cuatro frases y termina con esto: si dos de los tres factores son decisiones humanas, ¿qué implica eso para la responsabilidad política de un desastre?"
          valor={r.a1_puede_cambiar}
          onChange={(v) => set("a1_puede_cambiar", v)}
          filas={6}
          placeholder="Escribe aquí…"
        />
      </Ejercicio>
    </div>
  );
}
