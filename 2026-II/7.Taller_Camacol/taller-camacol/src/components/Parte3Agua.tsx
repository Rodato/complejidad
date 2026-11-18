"use client";

import { CabezaParte, Campo, Cita, Definicion, Ejercicio, Limite, Opciones, Texto } from "./ui";
import { QUIEN_ESTUDIOS } from "@/lib/carta";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte3Agua({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={3}
        titulo="El agua y el río Cauca"
        bajada="La carta pide más suelo para urbanizar y dice dónde: hacia el oriente, donde la ciudad llega al río Cauca."
      />

      <Cita fuente="Carta de Camacol Valle, pág. 4.">
        <p>
          Para lo anterior, y teniendo en cuenta que, del área total de 1.600 hectáreas propuesta
          como suelo de expansión, solo hay disponibles 622, sugerimos como opciones concretas la
          denominada «expansión oriental», adicionando 500 hectáreas al área de expansión
          concertada con la CVC, para desarrollar mediante un Master Plan del Oriente, y además la
          destinación de 80 hectáreas al control de borde en las laderas.
        </p>
      </Cita>

      <Ejercicio numero="3.1" titulo="Los estudios">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Según la carta (pág. 4), ¿quién le entregó al DAPD los estudios de la «expansión
          oriental»?
        </p>
        <Opciones
          opciones={[...QUIEN_ESTUDIOS]}
          valor={r.p3_estudios}
          onChange={(v) => set("p3_estudios", v)}
          columnas
        />
      </Ejercicio>

      <Definicion titulo="Clases agrológicas">
        <p>
          El IGAC clasifica los suelos de la clase I a la VIII según su capacidad de uso. Las clases
          I a III son las mejores para la agricultura; de la IV en adelante, los suelos tienen cada
          vez más limitaciones.
        </p>
        <p>
          La norma nacional pone los suelos de clase I, II y III entre las categorías de protección
          del suelo rural (Decreto 3600 de 2007, art. 4, hoy compilado en el Decreto 1077 de 2015,
          art. 2.2.2.2.1.3).
        </p>
      </Definicion>

      <Ejercicio numero="3.2" titulo="Clase IV">
        <Texto
          label="Entre los estudios entregados, la carta nombra una «reclasificación agrológica expedida por el IGAC (clase IV)». ¿Por qué le importa eso a la expansión oriental? ¿Qué cambia para ese suelo, y qué significa que el estudio lo haya entregado quien lo entregó (3.1)?"
          valor={r.p3_clase}
          onChange={(v) => set("p3_clase", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Ejercicio numero="3.3" titulo="El agua de la ciudad">
        <Cita fuente="Carta de Camacol Valle, pág. 3.">
          <p>
            El modelo propuesto impone un desarrollo progresivo según el cual los propietarios de
            algunas áreas de expansión deben esperar a que se complete la infraestructura de
            servicios públicos de la corona anterior para iniciar la urbanización de sus predios.
            […] En consecuencia, el gremio considera indispensable eliminar esta forma de
            regulación del desarrollo urbano.
          </p>
        </Cita>
        <Cita fuente="Carta de Camacol Valle, pág. 4.">
          <p>
            La propuesta se integraría, además, con un parque ecoturístico del río Cauca, con una
            dimensión cercana a 2.000 hectáreas […].
          </p>
        </Cita>
        <Texto
          label="Averigüen de dónde sale el agua que consume Cali: qué plantas de EMCALI la potabilizan y de qué ríos la toman. Con eso, ¿qué implica para el agua de la ciudad urbanizar 500 hectáreas más hacia el Cauca y, además, sin esperar a que estén las redes de la corona anterior?"
          valor={r.p3_agua}
          onChange={(v) => set("p3_agua", v)}
          filas={6}
          minPalabras={50}
          maxPalabras={180}
        />
        <div className="mt-4">
          <Campo
            label="¿De dónde sacaron lo del agua? (enlace o referencia)"
            valor={r.p3_fuente}
            onChange={(v) => set("p3_fuente", v)}
            placeholder="https://…"
            permitirPegar
          />
        </div>
      </Ejercicio>

      <Limite>
        La carta no trae mapa: no sabemos exactamente dónde quedan las 500 hectáreas ni qué tan
        cerca del río. De los estudios de inundación solo sabemos que existen y quién los
        entregó, no qué dicen.
      </Limite>
    </>
  );
}
