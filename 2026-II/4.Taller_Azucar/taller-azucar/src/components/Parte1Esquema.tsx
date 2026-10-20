"use client";

import Explorador from "./Explorador";
import { CabezaParte, Campo, Definicion, Ejercicio, Texto } from "./ui";
import { ESQUEMA1 } from "@/lib/collins";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte1Esquema({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={1}
        titulo="Cuatro familias, once ingenios"
        bajada="Collins, esquema 1 (pág. 583): los grupos económicos familiares y los ingenios del Valle en que tenían intereses entre 1930 y 1950."
      />

      <Definicion titulo="Una red bipartita">
        <p>
          El esquema tiene dos clases de nodos: grupos familiares (círculos) e ingenios
          (cuadrados). Las líneas solo unen un grupo con un ingenio, nunca dos grupos entre sí. El{" "}
          <strong>grado</strong> de un grupo es cuántos ingenios toca.
        </p>
        <p>
          La <strong>intermediación</strong> de un nodo mira todos los pares de otros nodos y
          suma la parte de sus caminos más cortos que pasa por él. Si entre dos nodos hay dos
          caminos igual de cortos y solo uno pasa por el nodo, ese par le suma ½. La columna
          «caminos que pasan» de la tabla los cuenta enteros, sin repartir.
        </p>
      </Definicion>

      <Explorador
        nodos={ESQUEMA1.nodos}
        aristas={ESQUEMA1.aristas}
        proporcion={ESQUEMA1.proporcion}
        fuente={3.4}
        titulo="Esquema 1 de Collins: cuatro grupos familiares y once ingenios"
        pie="Collins, esquema 1, pág. 583. Círculos: grupos familiares. Cuadrados: ingenios. El orden de los ingenios cambió para que se crucen menos líneas; los vínculos son los mismos."
      />

      <Ejercicio numero="1.1" titulo="Grado e intermediación">
        <div className="mb-4 flex flex-col gap-3">
          <Campo
            label="¿Cuál grupo económico familiar tiene el mayor grado? ¿Cuánto?"
            valor={r.p1_grado}
            onChange={(v) => set("p1_grado", v)}
          />
          <Campo
            label="¿Cuál grupo tiene el coeficiente de intermediación más alto? ¿Cuánto?"
            valor={r.p1_intermediacion}
            onChange={(v) => set("p1_intermediacion", v)}
          />
        </div>
        <Texto
          label="¿Es el mismo grupo en las dos medidas? ¿Qué nodo de toda la red tiene la intermediación más alta, y por qué?"
          valor={r.p1_contraste}
          onChange={(v) => set("p1_contraste", v)}
          filas={4}
        />
      </Ejercicio>

      <Ejercicio numero="1.2" titulo="La familia Salcedo">
        <Texto
          label="¿Quiénes hacen parte de la familia Salcedo y por qué eran tan importantes en ese periodo?"
          ayuda="Hay pistas repartidas en el texto de Collins entre las págs. 583 y 596, incluido el cuadro 6 (pág. 584)."
          valor={r.p1_salcedo}
          onChange={(v) => set("p1_salcedo", v)}
          filas={6}
        />
      </Ejercicio>
    </>
  );
}
