"use client";

import { CabezaParte, Cita, Contexto, Definicion, Ejercicio, Texto } from "./ui";
import { CARTA } from "@/lib/carta";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte1Origen({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={1}
        titulo="El lugar de enunciación"
        bajada="Una carta gremial dirigida al alcalde es también un registro de las relaciones entre actores. Antes de examinar sus propuestas, esta parte analiza desde dónde se enuncia, entre quiénes se gestó y quién tuvo la iniciativa."
      />

      <Definicion titulo="La carta">
        <p>
          Carta {CARTA.codigo} de {CARTA.remite}, fechada el {CARTA.fecha} y radicada en
          Planeación el {CARTA.radicado}. Va dirigida a {CARTA.destino}. La firman la presidenta,
          el primer y el segundo vicepresidente de la Junta Directiva y la gerente.
        </p>
        <p>
          Las páginas 1 a 6 del PDF son la carta. Las páginas 7 a 9 son el certificado de la firma
          electrónica (DocuSign). En ellas se tacharon los nombres de terceros, los teléfonos, las
          direcciones físicas y las direcciones IP; el resto del documento se conserva sin
          modificaciones.
        </p>
      </Definicion>

      <Contexto
        titulo="La figura del alcalde ad hoc"
        fuente={
          <>
            Fuente: Alcaldía de Cali,{" "}
            <a
              href="https://www.cali.gov.co/publicaciones/194748/por-que-cali-tiene-un-alcalde-ad-hoc-conozca-todos-los-detalles-de-la-medida/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              «¿Por qué Cali tiene un alcalde ad hoc?»
            </a>{" "}
            (octubre de 2026).
          </>
        }
      >
        <p>
          En octubre de 2024 el alcalde Alejandro Eder se declaró impedido para las decisiones del
          POT por «un eventual conflicto de intereses»: según la Alcaldía, sus familiares podrían
          tener inversiones en sectores como la construcción y la finca raíz. Desde entonces, esas
          decisiones, y solo esas, corresponden a un alcalde ad hoc. Nicolás Gómez Arenas, el
          tercero en ocupar el cargo, fue designado por el presidente de la República y se posesionó
          el 5 de octubre de 2026.
        </p>
      </Contexto>

      <Cita fuente="Carta de Camacol Valle, pág. 1.">
        <p>
          En nombre de la Junta Directiva y de los afiliados de CAMACOL VALLE, y en desarrollo de lo
          tratado en la reunión sostenida el pasado 10 de noviembre en el Club Colombia de Cali, con
          la participación del Departamento Administrativo de Planeación Distrital -DAPD- y de
          representantes del sector privado, nos permitimos presentar a usted formalmente las
          propuestas del gremio frente al trámite de ajuste del Plan de Ordenamiento Territorial
          -POT- de Cali.
        </p>
      </Cita>

      <Ejercicio numero="1.1" titulo="El origen de la propuesta">
        <Texto
          label="Según la carta, ¿dónde y entre qué actores se discutieron inicialmente estas propuestas? ¿Qué tipo de espacio es ese y qué actores públicos y sociales estuvieron ausentes de la reunión?"
          valor={r.p1_lugar}
          onChange={(v) => set("p1_lugar", v)}
          filas={4}
          minPalabras={30}
          maxPalabras={120}
        />
      </Ejercicio>

      <Ejercicio numero="1.2" titulo="El certificado de firma electrónica">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Consulten las páginas 7 a 9 del PDF. Corresponden al registro que genera DocuSign cuando
          un documento se firma electrónicamente: quién creó el sobre, a quiénes se envió, en qué
          orden firmaron y a qué hora.
        </p>
        <Texto
          label="¿Desde qué organización se creó el sobre? ¿A qué dominios pertenecen los correos de los firmantes? ¿Qué indica esa información sobre quiénes hacen parte de la Junta Directiva de Camacol y sobre quién gestionó el envío de la carta?"
          valor={r.p1_sobre}
          onChange={(v) => set("p1_sobre", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Ejercicio numero="1.3" titulo="La iniciativa">
        <Texto
          label="¿Quién tiene la iniciativa: la Alcaldía convoca al gremio, o el gremio le propone a la Alcaldía la agenda, los participantes y los plazos? Sustenten su respuesta con al menos dos citas textuales de la carta, con indicación de la página."
          valor={r.p1_iniciativa}
          onChange={(v) => set("p1_iniciativa", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>
    </>
  );
}
