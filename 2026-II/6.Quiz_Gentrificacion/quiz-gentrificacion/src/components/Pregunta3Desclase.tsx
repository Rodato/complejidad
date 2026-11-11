"use client";

import { Campo, CabezaParte, Cita, Definicion, Ejercicio, Limite, Tabla, Texto } from "./ui";
import { CUARENTA, HOY, millones, num, pesos40 } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Pregunta3Desclase({ r, set }: Props) {
  const cj = HOY.ciudad_jardin;

  return (
    <>
      <CabezaParte
        numero={3}
        titulo="El desclasamiento"
        bajada="Ochenta años después: ¿dónde quedaron los barrios que en 1941–44 eran los más caros de Cali?"
      />

      <Cita fuente="Mosquera y Aprile (1980), pág. 91.">
        <p>
          En general un barrio residencial se proyecta y se inicia para una clase y termina en
          poder de otra clase. [...] Al terminar un ciclo, el barrio experimenta un nuevo período
          de vida, con un marcado desclasamiento social y un evidente deterioro ambiental e
          inmobiliario.
        </p>
      </Cita>

      <Definicion titulo="La posición de un barrio">
        <p>
          Los pesos de 1943 y los de hoy no se pueden comparar directamente. Lo que sí se compara
          es la posición: el precio del m² en el barrio dividido por la mediana de toda la ciudad
          en esa misma época. Una posición de 2 quiere decir el doble de la mediana; una de 0,5, la
          mitad.
        </p>
        <p>
          En 1941–44 la mediana de los lotes es {pesos40(CUARENTA.mediana_lotes)} por m². En los
          avisos de venta de 2020–2024 es {millones(HOY.mediana)} por m².
        </p>
      </Definicion>

      <Tabla
        columnas={[
          { titulo: "Barrio" },
          { titulo: "1941–44", derecha: true },
          { titulo: "2020–24", derecha: true },
        ]}
        filas={[
          ...CUARENTA.posiciones.map((p) => [
            p.barrio,
            <span key="a">
              <strong>{num(p.pos_40, 2)}</strong>
              <span className="block text-xs text-stone-400">
                {p.n_40} {p.n_40 === 1 ? "lote" : "lotes"}
              </span>
            </span>,
            <span key="b">
              <strong>{num(p.pos_hoy, 2)}</strong>
              <span className="block text-xs text-stone-400">{p.n_hoy} avisos</span>
            </span>,
          ]),
          [
            "Ciudad Jardín",
            <span key="a" className="text-stone-400">no existía</span>,
            <span key="b">
              <strong>{num(cj.pos, 2)}</strong>
              <span className="block text-xs text-stone-400">{cj.n} avisos</span>
            </span>,
          ],
        ]}
        pie="Posición = precio del m² en el barrio ÷ mediana de la ciudad en la misma época. En 1941–44, lotes de las escrituras de la Notaría 2; en 2020–24, avisos de venta de casas y apartamentos."
      />

      <Ejercicio numero="3" titulo="¿Se desclasaron?">
        <div className="mb-4">
          <Campo
            label="¿Cuántas veces cayó la posición de Granada entre 1941–44 y 2020–24?"
            valor={r.p3_caida}
            onChange={(v) => set("p3_caida", v)}
            placeholder="veces"
            numerico
          />
        </div>
        <Texto
          label="¿Es eso el «desclasamiento» de Mosquera y Aprile? ¿Qué barrios de la tabla siguen el ciclo y cuál se sostiene mejor? Digan también qué compara mal esta cuenta."
          valor={r.p3_desclase}
          onChange={(v) => set("p3_desclase", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Limite>
        Hay muy pocos lotes por barrio en 1941–44, y en 2020–24 son avisos (lo que pide el
        vendedor), no ventas. Un precio más bajo tampoco dice por sí solo quién vive hoy en el
        barrio: eso lo diría un censo, no un aviso.
      </Limite>
    </>
  );
}
