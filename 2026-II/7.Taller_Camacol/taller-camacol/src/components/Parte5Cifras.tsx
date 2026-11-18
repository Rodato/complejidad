"use client";

import { CabezaParte, Campo, Cita, Ejercicio, Limite, Tabla, Texto } from "./ui";
import { CIFRAS, CUADRO_VIVIENDA, POBLACION_TREQ } from "@/lib/carta";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

const n = (v: number) => v.toLocaleString("es-CO");

export default function Parte5Cifras({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={5}
        titulo="Las cifras de Camacol"
        bajada="La carta argumenta con números. Revisen qué mueven y de dónde salen."
      />

      <Ejercicio numero="5.1" titulo="Dónde van las viviendas">
        <Tabla
          columnas={[
            { titulo: "Tipo de suelo" },
            { titulo: "Proyecto de Acuerdo", derecha: true },
            { titulo: "Camacol", derecha: true },
          ]}
          filas={CUADRO_VIVIENDA.filas.map((f) => [
            f.suelo,
            <span key="a" className="whitespace-nowrap">
              {f.acuerdo.pct} %
              <span className="block text-xs text-stone-500">{n(f.acuerdo.viviendas)}</span>
            </span>,
            <span key="c" className="whitespace-nowrap">
              {f.camacol.pct} %
              <span className="block text-xs text-stone-500">{n(f.camacol.viviendas)}</span>
            </span>,
          ])}
          pie={`Carta de Camacol Valle, pág. 4. Necesidad habitacional estimada por el DAPD: ${n(CUADRO_VIVIENDA.total)} viviendas.`}
        />
        <Texto
          label="¿Cuántas viviendas más pone Camacol en suelo de expansión que el Proyecto de Acuerdo, y de qué tipos de suelo las quita?"
          valor={r.p5_viviendas}
          onChange={(v) => set("p5_viviendas", v)}
          filas={2}
        />
      </Ejercicio>

      <Ejercicio numero="5.2" titulo="El parque del río">
        <Cita fuente="Carta de Camacol Valle, pág. 4.">
          <p>
            La propuesta se integraría, además, con un parque ecoturístico del río Cauca, con una
            dimensión cercana a 2.000 hectáreas, que permitiría pasar de 3,8 m² a 12,6 m² el índice
            de espacio público verde por habitante.
          </p>
        </Cita>
        <div className="mb-4">
          <Campo
            label={`Con ${POBLACION_TREQ}, ¿cuántos m² de espacio verde por habitante agrega, por sí solo, un parque de 2.000 hectáreas? (1 hectárea = 10.000 m²)`}
            valor={r.p5_m2}
            onChange={(v) => set("p5_m2", v)}
            numerico
          />
        </div>
        <Texto
          label="Comparen su cuenta con el salto de 3,8 a 12,6 m². ¿Qué parte del salto explica el parque solo? ¿Qué papel cumple el parque del río en el argumento de la carta, al lado de las 500 hectáreas de expansión oriental?"
          valor={r.p5_parque}
          onChange={(v) => set("p5_parque", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Ejercicio numero="5.3" titulo="Quién produce cada cifra">
        <Tabla
          columnas={[{ titulo: "Cifra" }, { titulo: "Pág.", derecha: true }]}
          filas={CIFRAS.map((c) => [
            <span key="c">
              <span className="font-semibold text-stone-900">{c.cifra}</span> {c.que}
            </span>,
            c.pag,
          ])}
          pie="Cifras de la carta de Camacol Valle."
        />
        <Texto
          label="Para cada cifra, ¿quién la produce según la carta: el DAPD, el gremio, o no lo dice? ¿Cuáles podrían verificar ustedes y cuáles hay que creerle a Camacol? Y una en particular: ¿para qué usa la carta los 147 mil hogares en asentamientos irregulares (pág. 3)?"
          valor={r.p5_fuentes}
          onChange={(v) => set("p5_fuentes", v)}
          filas={7}
          minPalabras={60}
          maxPalabras={200}
        />
      </Ejercicio>

      <Limite>
        Que una cifra venga del gremio no la hace falsa, ni que venga del DAPD la hace cierta. La
        pregunta es si se puede revisar, y con qué.
      </Limite>
    </>
  );
}
