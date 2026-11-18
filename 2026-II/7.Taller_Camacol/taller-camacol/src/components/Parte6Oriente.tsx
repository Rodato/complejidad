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
        titulo="¿Del suroeste al oriente?"
        bajada="El hilo del semestre: un desastre no lo produce un evento natural, sino la interacción lenta de decisiones humanas. ¿Se está armando el próximo?"
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
        titulo="Leer también lo que la carta no dice"
        fuente="Fuentes: Castañeda, «Cali ante el espejo del terremoto», introducción y sección 2 (Taller 1); TREQ (2022), págs. 15 y 45."
      >
        <p>
          Un texto también se analiza por lo que no dice. Sobre el abanico de Cañaveralejo hubo
          advertencias, y no venían de cartas de un gremio sino de estudios científicos, como la
          microzonificación de 2005 citada arriba. Castañeda lo resume así: la
          ciudad «produjo conocimiento científico suficiente para reconocer el peligro, delimitar
          los sectores críticos y construir modelos avanzados de pérdidas», pero «no ha demostrado
          haber convertido oportunamente ese conocimiento en una intervención sistemática de las
          edificaciones privadas más vulnerables».
        </p>
        <p>
          Para el oriente también hay estudios científicos, como el TREQ citado arriba. La carta no
          los menciona.
        </p>
      </Contexto>

      <Ejercicio numero="6.1" titulo="¿Se repite?">
        <Texto
          label="Una lectura crítica sostiene que la carta propone repetir en el oriente lo que se hizo en el suroeste con el río Cañaveralejo. Averigüen qué pasó con el Cañaveralejo y su abanico al urbanizarse. ¿Qué tendría que ser igual en los dos casos para que la comparación se sostenga: quién urbaniza, quién produce los estudios, qué pasa con el río, qué riesgo queda por fuera? Usen al menos un dato de la carta y uno del TREQ o de Castañeda."
          valor={r.p6_comparacion}
          onChange={(v) => set("p6_comparacion", v)}
          filas={7}
          minPalabras={60}
          maxPalabras={200}
        />
      </Ejercicio>

      <Ejercicio numero="6.2" titulo="La cadena">
        <Texto
          label="Supongan que dentro de 20 años hay un desastre en la expansión oriental. ¿Qué decisiones de esta carta, tomadas por quiénes y en qué orden, aparecerían en la explicación? Ordénenlas como una cadena."
          valor={r.p6_decisiones}
          onChange={(v) => set("p6_decisiones", v)}
          filas={6}
          minPalabras={50}
          maxPalabras={180}
        />
      </Ejercicio>
    </>
  );
}
