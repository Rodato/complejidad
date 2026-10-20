"use client";

import { CabezaParte, Cita, Ejercicio, Texto } from "./ui";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte5Caicedo({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={5}
        titulo="Hernando Caicedo, economista"
        bajada="Las quejas de los azucareros del Valle en la crisis de 1933, y lo que el mismo Caicedo dijo doce años después."
      />

      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">1933, en plena crisis</h3>
      <Cita fuente="Hernando Caicedo en Relator, 1 de febrero de 1933. Collins, pág. 611.">
        <p>
          Actualmente los ingenios están entregados a su propia suerte. Se hallan regidos por la
          ley ciega e inexorable de la oferta y la demanda. La marcha del negocio no da ningún
          signo de mejoría. Al contrario, los precios ya bajos han bajado más […]. El caso es de
          guerra a muerte, de competencia destructora.
        </p>
      </Cita>
      <Cita fuente="Caicedo, 1933. Collins, pág. 612.">
        <p>La única solución es la cooperación. La cooperación o la ruina.</p>
        <p>
          Hay que descartar la posibilidad de que los interesados aisladamente, sin la ayuda
          oficial, puedan solucionar un caso tan grave.
        </p>
      </Cita>

      <section className="mb-3 rounded-lg border border-stone-200 bg-stone-50 p-4 text-[15px] leading-relaxed text-stone-700">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          La propuesta de Caicedo, según Collins (págs. 612–613)
        </p>
        <p>
          En 1933 se producían 750.000 quintales y se consumían 500.000. Caicedo propone bajar
          la producción un 20 % y crear una entidad financiera del Estado, manejada por la Caja
          de Crédito Agrario o los Almacenes Generales de Depósito, que venda los 500.000
          quintales a $4,50 (un ingreso de $2.250.000) y les pague a los ingenios $1.500.000, o
          $2,50 el quintal. La ganancia, $750.000, se repartiría entre los ingenios después de
          los gastos, y la entidad guardaría los 100.000 quintales sobrantes. En sus palabras:
          «es un magnífico negocio».
        </p>
      </section>

      <h3 className="mb-2 mt-5 text-sm font-bold uppercase tracking-wide text-stone-500">1945</h3>
      <Cita fuente="Entrevista de Juan Lozano y Lozano a Hernando Caicedo, 1945. Collins, pág. 617.">
        <p>
          P. ¿Para ustedes, los grandes productores de azúcar, no ha representado un regalo el
          aumento de un centavo por libra que autorizó el Gobierno el año pasado?
        </p>
        <p>
          R. Qué va a ser un regalo. Si el mercado fuese libre, el precio del azúcar sería mayor,
          hoy cuando existe escasez y compensaría el precio menor que recibimos cuando
          disminuyen los consumos internos.
        </p>
      </Cita>

      <div className="mt-5">
        <Ejercicio numero="5.1" titulo="¿Son coherentes?">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            Lean las quejas de los productores de azúcar del Valle en las páginas 611–612 (y lo
            que sigue hasta la 617). Si les preguntaran qué piensan, como economistas, de los
            análisis de Hernando Caicedo, ¿ustedes qué dirían? ¿Son coherentes? ¿O no lo son?
            ¿Por qué? Expliquen.
          </p>
          <Texto
            label="Su respuesta"
            valor={r.p5_caicedo}
            onChange={(v) => set("p5_caicedo", v)}
            filas={9}
            minPalabras={150}
            maxPalabras={400}
          />
        </Ejercicio>

        <Ejercicio numero="5.2" titulo="Una pregunta que Collins deja abierta">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            El Estado congeló el precio interno del azúcar de 1946 a 1955 y los ingenios se
            quejaban de poca rentabilidad (cuadro 13). Aun así, la producción pasó de 82 mil
            toneladas en 1946 a 261 mil en 1956 (cuadro 15). ¿Cómo lo explicarían?
          </p>
          <Texto
            label="Su explicación"
            valor={r.p5_produccion}
            onChange={(v) => set("p5_produccion", v)}
            filas={5}
          />
        </Ejercicio>
      </div>
    </>
  );
}
