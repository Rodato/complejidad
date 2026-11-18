"use client";

import { CabezaParte, Casillas, Cita, Contexto, Ejercicio, Limite, Texto } from "./ui";
import { ACTORES } from "@/lib/carta";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte2Mesa({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={2}
        titulo="Quién se sienta a la mesa"
        bajada="Un POT pasa por varias instituciones antes de aprobarse. La carta propone con quién negociarlo, y deja a otras por fuera."
      />

      <Contexto
        titulo="Quién interviene en un POT"
        fuente="Fuente: Ley 388 de 1997, artículos 24 y 25."
      >
        <p>
          Antes de llegar al Concejo, que es quien lo aprueba, el proyecto de POT pasa por la
          concertación de los asuntos ambientales con la autoridad ambiental (en el Valle, la CVC),
          por el concepto del Consejo Territorial de Planeación y por la consulta a la ciudadanía.
          La misma ley dice que la administración pedirá la opinión de los gremios económicos y
          hará convocatorias públicas, con audiencias para las juntas administradoras locales.
        </p>
      </Contexto>

      <Ejercicio numero="2.1" titulo="La mesa que propone Camacol">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          En el punto 2 (pág. 4), ¿quiénes conforman la «mesa técnica y jurídica» que propone el
          gremio? Marquen todos los que estén.
        </p>
        <Casillas opciones={ACTORES} valor={r.p2_mesa} onChange={(v) => set("p2_mesa", v)} />
      </Ejercicio>

      <Ejercicio numero="2.2" titulo="Las copias">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          ¿A quiénes les llega copia de la carta (pág. 6)? Marquen todos.
        </p>
        <Casillas opciones={ACTORES} valor={r.p2_copias} onChange={(v) => set("p2_copias", v)} />
      </Ejercicio>

      <Ejercicio numero="2.3" titulo="La CVC">
        <Cita fuente="Carta de Camacol Valle, pág. 2.">
          <p>
            El gremio desea dejar constancia expresa de su recomendación sobre el retorno del
            Proyecto de Acuerdo del POT a la etapa de concertación ambiental, aprovechando el nuevo
            plazo otorgado por el Tribunal Administrativo del Valle del Cauca, en lo posible con el
            acompañamiento de delegados de alto nivel de los Ministerios de Vivienda, Ciudad y
            Territorio, y de Ambiente y Desarrollo Sostenible, con capacidad suficiente de
            interlocución ante la Corporación Autónoma Regional del Valle del Cauca -CVC-.
          </p>
        </Cita>
        <Texto
          label="¿Qué papel le da la carta a la CVC? ¿Por qué pedir delegados del gobierno nacional «con capacidad suficiente de interlocución ante» ella, en vez de sentarla en la mesa? Si dibujan la red que propone la carta (quién habla con quién), ¿por dónde pasa el camino entre el alcalde y la CVC?"
          valor={r.p2_cvc}
          onChange={(v) => set("p2_cvc", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Ejercicio numero="2.4" titulo="Dos varas">
        <Cita fuente="Carta de Camacol Valle, pág. 2.">
          <p>
            Una consulta democrática sobre un texto que la ciudadanía no conoce no satisface la
            exigencia legal, y ese defecto puede comprometer seriamente la validez del Acuerdo que
            llegue a adoptarse.
          </p>
          <p>
            Omitir a una autoridad ambiental competente constituiría un segundo vicio de
            procedimiento, que es preferible prevenir ahora y no discutir después ante la justicia.
          </p>
        </Cita>
        <Texto
          label="En el punto 1 Camacol defiende que el proyecto sea público y que estén todas las autoridades ambientales. Comparen eso con la mesa que propone en el punto 2. ¿Es una contradicción? ¿Para qué le sirve al gremio cada uno de los dos argumentos?"
          valor={r.p2_contradiccion}
          onChange={(v) => set("p2_contradiccion", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Limite>
        Pedir opinión a los gremios está en la ley; lo que se discute aquí es la forma: una mesa
        de cuatro, por 30 días, propuesta por una de las partes. La carta es una propuesta: no
        sabemos si el alcalde la aceptó.
      </Limite>
    </>
  );
}
