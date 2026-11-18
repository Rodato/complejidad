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
        titulo="Desde dónde se escribe"
        bajada="Una carta de un gremio al alcalde también es un mapa de quién habla con quién. Antes de leer lo que propone, miren desde dónde se escribe, entre quiénes y por iniciativa de quién."
      />

      <Definicion titulo="La carta">
        <p>
          Carta {CARTA.codigo} de {CARTA.remite}, fechada el {CARTA.fecha} y radicada en
          Planeación el {CARTA.radicado}. Va dirigida a {CARTA.destino}. La firman la presidenta,
          el primer y el segundo vicepresidente de la Junta Directiva y la gerente.
        </p>
        <p>
          Las páginas 1 a 6 del PDF son la carta. Las páginas 7 a 9 son el certificado de la firma
          electrónica (DocuSign). Allí tachamos nombres de terceros, teléfonos, direcciones e IP;
          lo demás está como llegó.
        </p>
      </Definicion>

      <Contexto
        titulo="¿Por qué hay un alcalde ad hoc?"
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
          tener inversiones en sectores como la construcción y la finca raíz. Desde entonces esas
          decisiones, y solo esas, las toma un alcalde ad hoc. Nicolás Gómez Arenas, el tercero, fue
          designado por el presidente de la República y se posesionó el 5 de octubre de 2026.
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

      <Ejercicio numero="1.1" titulo="Dónde empezó la conversación">
        <Texto
          label="Según la carta, ¿dónde y entre quiénes se discutieron primero estas propuestas? ¿Qué clase de lugar es ese, y a quién no se ve en esa reunión?"
          valor={r.p1_lugar}
          onChange={(v) => set("p1_lugar", v)}
          filas={4}
          minPalabras={30}
          maxPalabras={120}
        />
      </Ejercicio>

      <Ejercicio numero="1.2" titulo="El certificado de la firma">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Vayan a las páginas 7 a 9 del PDF. Es el registro que genera DocuSign cuando un documento
          se firma en línea: quién creó el sobre, a quién se le envió, en qué orden firmaron y a qué
          hora.
        </p>
        <Texto
          label="¿Desde qué organización se creó el sobre? ¿De qué dominios son los correos de quienes firman? ¿Qué les dice eso sobre quiénes hacen parte de la Junta Directiva de Camacol y sobre quién movió la carta?"
          valor={r.p1_sobre}
          onChange={(v) => set("p1_sobre", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Ejercicio numero="1.3" titulo="La iniciativa">
        <Texto
          label="¿Quién toma la iniciativa: la Alcaldía convoca al gremio, o el gremio le propone a la Alcaldía qué hacer, con quién y en cuánto tiempo? Citen al menos dos frases de la carta, con su página, que lo muestren."
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
