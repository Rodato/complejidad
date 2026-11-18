"use client";

import { CabezaParte, Campo, Cita, Contexto, Ejercicio, Limite, Texto } from "./ui";
import { TERREMOTO } from "@/lib/carta";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte4Silencio({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={4}
        titulo="El silencio sobre el terremoto"
        bajada={`La carta se radicó tres meses después del terremoto del ${TERREMOTO.fecha}. Esta parte examina el lugar que ocupa el sismo en su argumentación.`}
      />

      <Contexto
        titulo="La prórroga del Tribunal"
        fuente={
          <>
            Fuente: Alcaldía de Cali,{" "}
            <a
              href="https://www.cali.gov.co/boletines/publicaciones/194584/cali-obtiene-seis-meses-adicionales-para-ajustar-el-pot-e-incorporar-las-lecciones-aprendidas-del-terremoto-del-10-de-agosto/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              «Cali obtiene seis meses adicionales para ajustar el POT e incorporar las lecciones
              aprendidas del terremoto del 10 de agosto»
            </a>{" "}
            (28 de septiembre de 2026).
          </>
        }
      >
        <p>
          El POT de 2014 (Acuerdo 0373) fue anulado, y el Tribunal Administrativo del Valle aplazó
          los efectos de la nulidad para darle tiempo a la ciudad de adoptar uno nuevo. Después del
          terremoto, la Alcaldía pidió seis meses más con el argumento de que el sismo era «un hecho
          extraordinario, imprevisible y sobreviniente». El Tribunal amplió el plazo del 9 de enero
          al 9 de julio de 2027. La Alcaldía anunció que destinaría ese tiempo a incorporar las
          lecciones del terremoto, con nuevos estudios de microzonificación.
        </p>
      </Contexto>

      <Cita fuente="Carta de Camacol Valle, pág. 2.">
        <p>
          …el retorno del Proyecto de Acuerdo del POT a la etapa de concertación ambiental,
          aprovechando el nuevo plazo otorgado por el Tribunal Administrativo del Valle del Cauca…
        </p>
      </Cita>

      <Ejercicio numero="4.1" titulo="Frecuencia de términos">
        <div className="flex flex-col gap-4">
          <Campo
            label="¿Cuántas veces aparecen los términos «terremoto» o «sismo» en las seis páginas de la carta?"
            valor={r.p4_terremoto}
            onChange={(v) => set("p4_terremoto", v)}
            numerico
          />
          <Campo
            label="¿Cuántas veces aparece «riesgo sísmico», en qué página y en qué sección de la carta?"
            valor={r.p4_sismico}
            onChange={(v) => set("p4_sismico", v)}
          />
        </div>
      </Ejercicio>

      <Ejercicio numero="4.2" titulo="Dos lecturas de la «lección aprendida»">
        <Cita fuente="Carta de Camacol Valle, pág. 1.">
          <p>
            Como lo manifestamos en la reunión, debemos partir de una lección aprendida. En 2014
            CAMACOL VALLE advirtió que el modelo de ordenamiento entonces adoptado presentaba
            problemas estructurales de financiación y de viabilidad normativa que podían
            comprometer su ejecución. Doce años después, solo el 37% de ese modelo se cumplió,
            según lo informado por el DAPD.
          </p>
        </Cita>
        <Texto
          label="Camacol propone partir de «una lección aprendida». Compárenla con la lección que, según Castañeda (Taller 1), deja el terremoto. ¿Qué problema del POT de 2014 identifica cada uno y qué uso le daría cada uno a los seis meses de prórroga?"
          valor={r.p4_leccion}
          onChange={(v) => set("p4_leccion", v)}
          filas={6}
          minPalabras={50}
          maxPalabras={180}
        />
      </Ejercicio>

      <Ejercicio numero="4.3" titulo="La responsabilidad del sector constructor">
        <Contexto titulo="Datos del terremoto (Taller 1)" fuente="Fuentes: Alcaldía de Cali, repositorio oficial del terremoto (corte 8-sep-2026); TREQ (2022), págs. 11 y 44; Castañeda, «Cali ante el espejo del terremoto», sección 9.">
          <p>
            {TERREMOTO.fallecidos} fallecidos y {TERREMOTO.colapsos} estructuras con colapso total.
            Según el TREQ, más del 48 % de los caleños vive en estructuras de 1 a 2 pisos con
            provisiones sísmicas bajas y, citando a OSSO (2017), «son pocas las instancias en las que la normativa se
            cumple a cabalidad». Castañeda ubica el daño en el abanico de Cañaveralejo (Los
            Cámbulos, Cuarto de Legua, Nueva Tequendama, Olímpico, sectores del Limonar) y nombra,
            entre las edificaciones reportadas, los edificios Ana Pilar, María Elvira Lloreda y
            Cantabria y las Torres del Limonar.
          </p>
        </Contexto>
        <Texto
          label="Una lectura crítica de la carta sostiene que el gremio omite la responsabilidad que les cabe a los constructores en la catástrofe y en el incumplimiento de la norma sísmica. ¿Qué evidencia se requeriría para sostener o refutar esa tesis? ¿Qué aportan el TREQ y Castañeda y qué información falta (por ejemplo: quién construyó las edificaciones que colapsaron, en qué año y bajo qué norma)? Distingan lo que pueden afirmar con evidencia de lo que no."
          valor={r.p4_responsabilidad}
          onChange={(v) => set("p4_responsabilidad", v)}
          filas={7}
          minPalabras={60}
          maxPalabras={200}
        />
      </Ejercicio>

      <Limite>
        La frecuencia de un término mide lo que el texto dice, no lo que el gremio sabe ni lo que
        hace. Una omisión no demuestra por sí sola una intención: debe interpretarse a la luz de
        otras fuentes.
      </Limite>
    </>
  );
}
