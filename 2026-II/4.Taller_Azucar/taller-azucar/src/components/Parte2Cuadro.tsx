"use client";

import { useState } from "react";
import Explorador from "./Explorador";
import Matriz from "./Matriz";
import { CabezaParte, Campo, Definicion, Ejercicio, Opciones, Texto } from "./ui";
import { REDES_C7, VISTAS_C7, type VistaC7 } from "@/lib/collins";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte2Cuadro({ r, set }: Props) {
  const [vista, setVista] = useState<VistaC7>("grupos");
  const red = REDES_C7[vista];
  const idea = VISTAS_C7.find((v) => v.clave === vista)!.idea;

  return (
    <>
      <CabezaParte
        numero={2}
        titulo="Accionistas y empresas"
        bajada="Collins, cuadro 7 (pág. 585): accionistas y directivos de los ingenios y 21 empresas de fuera del sector azucarero, 1890–1961."
      />

      <Definicion titulo="Una matriz de afiliación, no de adyacencia">
        <p>
          Una matriz de adyacencia tiene los mismos nodos en las filas y en las columnas. El
          cuadro 7 no. En las filas hay 25 accionistas o directivos (A1 a H2), agrupados por la
          letra del ingenio al que pertenecen. En las columnas hay 21 empresas o asociaciones de{" "}
          <strong>fuera</strong> del azúcar (A a U). Una ✕ dice que esa persona participa en esa
          empresa.
        </p>
        <p>
          Ojo: la misma letra significa dos cosas. La <strong>fila A</strong> son los accionistas
          de la Manuelita; la <strong>columna A</strong> es la Compañía de navegación por el río
          Cauca. En este taller, «grupo A» es siempre la fila y «empresa A» la columna.
        </p>
        <p>
          Para hablar de grado, intermediación o caminos más cortos hay que convertir la matriz
          en una red. Se puede hacer de varias maneras y cada una cuenta algo distinto: abajo
          están tres.
        </p>
      </Definicion>

      <Matriz />

      <section className="mb-5">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Ver el cuadro como red de
        </p>
        <Opciones
          opciones={VISTAS_C7.map((v) => ({ clave: v.clave, nombre: v.nombre }))}
          valor={vista}
          onChange={setVista}
        />
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{idea}</p>
      </section>

      <Explorador
        key={vista}
        nodos={red.nodos}
        aristas={red.aristas}
        proporcion={red.proporcion}
        fuente={vista === "bipartita" ? 2.9 : 3.3}
        mostrarPesos={vista === "grupos"}
        tablaConNombre={vista === "personas"}
        titulo={`Cuadro 7 de Collins como red de ${VISTAS_C7.find((v) => v.clave === vista)!.nombre.toLowerCase()}`}
        pie="Construida a partir del cuadro 7 de Collins (pág. 585). Las medidas no usan el grosor: compartir tres empresas cuenta como un vínculo, igual que compartir una."
      />

      <Ejercicio numero="2.1" titulo="Los bloques">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Collins (pág. 591) dice que los dueños de la Manuelita se relacionan sobre todo con
          las empresas A a F, los Cabal-Becerra con las G a O y los Caicedo con las P a U, y que
          hay «15 cruces entre estos grupos».
        </p>
        <Texto
          label="Indiquen cuáles son los clusters más importantes."
          valor={r.p2_clusters}
          onChange={(v) => set("p2_clusters", v)}
          filas={5}
        />
        <Campo
          label="¿Cuántos cruces entre esos tres grupos cuentan ustedes? Expliquen arriba cómo los contaron."
          valor={r.p2_cruces}
          onChange={(v) => set("p2_cruces", v)}
          numerico
        />
      </Ejercicio>

      <Ejercicio numero="2.2" titulo="Trayectorias más cortas">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          En la <strong>red de grupos (filas A–H)</strong>, ¿cuántas trayectorias más cortas
          pasan por los grupos A, C y F? ¿Y por el B?
        </p>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Campo label="Grupo A" valor={r.p2_tray_a} onChange={(v) => set("p2_tray_a", v)} numerico />
          <Campo label="Grupo C" valor={r.p2_tray_c} onChange={(v) => set("p2_tray_c", v)} numerico />
          <Campo label="Grupo F" valor={r.p2_tray_f} onChange={(v) => set("p2_tray_f", v)} numerico />
          <Campo label="Grupo B" valor={r.p2_tray_b} onChange={(v) => set("p2_tray_b", v)} numerico />
        </div>
        <Texto
          label="¿Qué les dice eso sobre quién conecta a quién? ¿Cambia la respuesta si miran la red de grupos y empresas?"
          valor={r.p2_tray_lectura}
          onChange={(v) => set("p2_tray_lectura", v)}
          filas={5}
        />
      </Ejercicio>

      <Ejercicio numero="2.3" titulo="Obras públicas">
        <Texto
          label="¿Cuáles relaciones dan cuenta de la participación de los grupos familiares o individuos en la construcción de obras públicas?"
          ayuda="Toquen la letra de cada columna: la ficha resume lo que dice Collins de esa empresa (págs. 587–591)."
          valor={r.p2_obras}
          onChange={(v) => set("p2_obras", v)}
          filas={5}
        />
      </Ejercicio>

      <Ejercicio numero="2.4" titulo="Cali">
        <Texto
          label="¿Cuál es la importancia de Cali en esas relaciones?"
          valor={r.p2_cali}
          onChange={(v) => set("p2_cali", v)}
          filas={5}
        />
      </Ejercicio>
    </>
  );
}
