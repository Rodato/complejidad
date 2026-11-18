"use client";

import { CabezaParte, Cita, Contexto, Ejercicio, Texto } from "./ui";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte6Oriente({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={6}
        titulo="Del suroeste al oriente"
        bajada="El hilo conductor del semestre sostiene que un desastre no es producto de un evento natural, sino de la interacción lenta de decisiones humanas. Esta parte examina si los efectos del terremoto obedecen a fallas de la planificación urbana y si la expansión oriental reproduce el proceso que precedió al daño en el abanico de Cañaveralejo. Cierra con una valoración de la carta."
      />

      <h3 className="mb-2 text-base font-bold text-stone-900">El suroeste: el abanico de Cañaveralejo</h3>
      <Cita fuente="Castañeda, «Cali ante el espejo del terremoto», secciones 2 y 9 (Taller 1).">
        <p>
          La microzonificación, terminada y entregada en diciembre de 2005, dividió la ciudad en
          diez zonas con comportamientos sísmicos diferentes. Entre ellas sobresalió la microzona
          4C, correspondiente al abanico de Cañaveralejo, con condiciones de amplificación local y
          parámetros de diseño particularmente exigentes.
        </p>
        <p>
          Los reportes iniciales señalaron una concentración importante de daños en sectores
          relacionados con el abanico de Cañaveralejo…
        </p>
      </Cita>

      <h3 className="mb-2 mt-6 text-base font-bold text-stone-900">El oriente: el valle del Cauca</h3>
      <Cita fuente="TREQ (2022), págs. 15 y 45.">
        <p>
          Cali está ubicada en una cuenca entre la Cordillera Occidental al oeste y el Río Cauca al
          este. […] el espesor de los depósitos aumenta de oeste a este, alcanzando cientos de
          metros en el este de la ciudad.
        </p>
        <p>
          Torres-Tovar (2009) ubica los asentamientos más vulnerables de la zona urbana cerca de las
          laderas de la Cordillera Occidental y a lo largo de la ribera del río Cauca, donde están
          expuestos a deslizamientos e inundaciones.
        </p>
      </Cita>

      <Contexto
        titulo="Las omisiones como objeto de análisis"
        fuente="Fuentes: Castañeda, «Cali ante el espejo del terremoto», introducción y sección 2 (Taller 1); TREQ (2022), págs. 15 y 45."
      >
        <p>
          Un texto también se analiza por lo que omite. Sobre el abanico de Cañaveralejo hubo
          advertencias, y no provenían de comunicaciones gremiales sino de estudios científicos,
          como la microzonificación de 2005 citada arriba. Castañeda lo sintetiza así: la
          ciudad «produjo conocimiento científico suficiente para reconocer el peligro, delimitar
          los sectores críticos y construir modelos avanzados de pérdidas», pero «no ha demostrado
          haber convertido oportunamente ese conocimiento en una intervención sistemática de las
          edificaciones privadas más vulnerables».
        </p>
        <p>
          También sobre el oriente existen estudios científicos, como el TREQ citado arriba, y la
          carta no los menciona.
        </p>
      </Contexto>

      <Ejercicio numero="6.1" titulo="¿Falla de planificación o golpe de la naturaleza?">
        <Texto
          label="¿Fueron los efectos catastróficos y anunciados del terremoto del 10 de agosto de 2026 una falla de la planificación urbana del distrito de Santiago de Cali? ¿O fueron producto de un «milagro» o de un golpe de la naturaleza? Planteen razones concretas y documentadas."
          valor={r.p6_falla}
          onChange={(v) => set("p6_falla", v)}
          filas={7}
          minPalabras={60}
          maxPalabras={200}
        />
      </Ejercicio>

      <Ejercicio numero="6.2" titulo="¿Una repetición del proceso?">
        <Texto
          label="Una lectura crítica sostiene que la carta propone repetir en el oriente lo que se hizo en el suroeste con el río Cañaveralejo. Investiguen qué ocurrió con el Cañaveralejo y su abanico durante el proceso de urbanización. ¿Qué condiciones tendrían que coincidir en ambos casos para que la comparación se sostenga: quién urbaniza, quién produce los estudios, qué ocurre con el río y qué riesgos quedan excluidos del análisis? Utilicen al menos un dato de la carta y uno del TREQ o de Castañeda."
          valor={r.p6_comparacion}
          onChange={(v) => set("p6_comparacion", v)}
          filas={7}
          minPalabras={60}
          maxPalabras={200}
        />
      </Ejercicio>

      <Ejercicio numero="6.3" titulo="La secuencia de decisiones">
        <Texto
          label="Supongan que dentro de 20 años ocurre un desastre en la zona de expansión oriental. ¿Qué decisiones propuestas en esta carta formarían parte de su explicación, qué actores las tomarían y en qué orden? Preséntenlas como una secuencia causal."
          valor={r.p6_decisiones}
          onChange={(v) => set("p6_decisiones", v)}
          filas={6}
          minPalabras={50}
          maxPalabras={180}
        />
      </Ejercicio>

      <Ejercicio numero="6.4" titulo="Valoración de la carta">
        <Texto
          label="¿Qué valoración hacen de la carta de Camacol? Fundamenten su juicio en lo trabajado en este control de lectura."
          valor={r.p6_valoracion}
          onChange={(v) => set("p6_valoracion", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>
    </>
  );
}
