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
        titulo="Actores incluidos y excluidos"
        bajada="El proyecto de POT debe surtir varias instancias antes de su aprobación. La carta propone una instancia de negociación propia y define quiénes participan en ella y quiénes no."
      />

      <Contexto
        titulo="Las instancias del POT según la Ley 388"
        fuente="Fuente: Ley 388 de 1997, artículos 24 y 25."
      >
        <p>
          Antes de su aprobación por el Concejo, el proyecto de POT debe surtir la concertación de
          los asuntos ambientales con la autoridad ambiental (en el Valle, la CVC), el concepto del
          Consejo Territorial de Planeación y la consulta a la ciudadanía. La misma ley dispone que
          la administración solicitará la opinión de los gremios económicos y realizará
          convocatorias públicas, con audiencias para las juntas administradoras locales.
        </p>
      </Contexto>

      <Ejercicio numero="2.1" titulo="La mesa técnica y jurídica">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          En el punto 2 (pág. 4), ¿qué actores conforman la «mesa técnica y jurídica» que propone
          el gremio? Seleccionen todos los que correspondan.
        </p>
        <Casillas opciones={ACTORES} valor={r.p2_mesa} onChange={(v) => set("p2_mesa", v)} />
      </Ejercicio>

      <Ejercicio numero="2.2" titulo="Los destinatarios de copia">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          ¿A quiénes se envía copia de la carta (pág. 6)? Seleccionen todos los que correspondan.
        </p>
        <Casillas opciones={ACTORES} valor={r.p2_copias} onChange={(v) => set("p2_copias", v)} />
      </Ejercicio>

      <Ejercicio numero="2.3" titulo="El lugar de la CVC">
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
          label="¿Qué papel le asigna la carta a la CVC? ¿Por qué solicitar delegados del gobierno nacional «con capacidad suficiente de interlocución ante» ella, en lugar de incluirla en la mesa? Si representan como red las relaciones que propone la carta, ¿qué ruta conecta al alcalde con la CVC y qué actores actúan como intermediarios?"
          valor={r.p2_cvc}
          onChange={(v) => set("p2_cvc", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Ejercicio numero="2.4" titulo="Dos criterios de participación">
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
          label="En el punto 1, Camacol exige que el proyecto sea público y que participen todas las autoridades ambientales competentes. Contrasten esa exigencia con la composición de la mesa que propone en el punto 2. ¿Se trata de una contradicción? ¿Qué función cumple cada argumento en la estrategia del gremio?"
          valor={r.p2_contradiccion}
          onChange={(v) => set("p2_contradiccion", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Limite>
        La Ley 388 contempla la consulta a los gremios; lo que aquí se examina es la forma que
        propone la carta: una mesa de cuatro actores, con un plazo de 30 días, propuesta por una de
        las partes interesadas. Se trata de una propuesta: no consta que el alcalde la haya
        aceptado.
      </Limite>
    </>
  );
}
