"use client";

import { CabezaParte, Cita, Ejercicio, Texto } from "./ui";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte4Wright({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={4}
        titulo="¿Los dejaron solos?"
        bajada="Wright (1980) y Collins (1983) sobre el Estado y los capitalistas privados en los años de la Violencia."
      />

      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">Lo que dice Wright</h3>
      <Cita fuente="Wright (1980), «El papel del Estado y las políticas de acumulación de capital en Colombia», Cuadernos de Economía, pág. 59.">
        <p>
          La intervención de las Fuerzas Armadas terminó con un período de la historia
          colombiana que comenzó en 1926, durante el cual la lucha entre liberales y
          conservadores por el control del poder político había servido para incrementar la
          autonomía del proceso de acumulación independientemente del Estado. Ninguno de ellos
          fue capaz de ganar una hegemonía efectiva. La política tomó su propio curso y los
          capitalistas privados fueron dejados para arreglárselas por sí mismos.
        </p>
      </Cita>
      <Cita fuente="Wright (1980), págs. 59–60.">
        <p>
          Aun así, esta situación hasta acá descrita no produjo consecuencias económicas
          desastrosas. Por el contrario, los empresarios privados tuvieron éxito por dos razones
          básicas: Primera, más que afectar la economía en forma adversa, el proceso político
          favoreció a ciertos sectores mientras afectaba a otros muy pequeños. […]
        </p>
        <p>
          Segundo, los empresarios que realizaron diversas funciones en el proceso de
          acumulación se agruparon en poderosas asociaciones para regular las relaciones
          económicas entre ellos mismos. […] Estas asociaciones orquestaron el proceso de
          acumulación en ausencia de un aparato de Estado efectivo.
        </p>
      </Cita>

      <h3 className="mb-2 mt-5 text-sm font-bold uppercase tracking-wide text-stone-500">
        Cómo lo usa Collins
      </h3>
      <Cita fuente="Collins, pág. 598. Antes habla del «derrumbe parcial del Estado» asociado con la Violencia desde finales de los años cuarenta.">
        <p>
          En su interpretación de estos años Wright (1980: 244) ha indicado que el conflicto
          político y violento entre liberales y conservadores sirvió para aumentar «[…] la
          autonomía del proceso de acumulación del Estado. Ninguno de los contendientes podía
          ganar hegemonía efectiva, la política se despegó en su propia trayectoria y los
          capitalistas privados fueron dejados a defenderse solos».
        </p>
      </Cita>

      <div className="mt-5">
        <Ejercicio numero="4" titulo="¿Pasó lo mismo en el Valle?">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            Wright dice que entre 1926 y 1953, como ningún partido logró la hegemonía, «los
            capitalistas privados fueron dejados para arreglárselas por sí mismos», y que aun así
            les fue bien. Collins usa la frase para hablar de la Violencia. ¿Pasó lo mismo con
            los azucareros del Valle del Cauca? Investiguen un poco.
          </p>
          <Texto
            label="Su respuesta"
            ayuda="Apóyense en lo que cuenta Collins (págs. 597–617) y, si usan otras fuentes, digan cuáles."
            valor={r.p4_valle}
            onChange={(v) => set("p4_valle", v)}
            filas={9}
            minPalabras={120}
            maxPalabras={350}
          />
        </Ejercicio>
      </div>
    </>
  );
}
