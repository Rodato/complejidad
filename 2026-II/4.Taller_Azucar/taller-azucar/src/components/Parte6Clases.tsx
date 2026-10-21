"use client";

import { CabezaParte, Cita, Ejercicio, Texto } from "./ui";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte6Clases({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={6}
        titulo="¿Lucha de clases con quién?"
        bajada="Collins cierra su artículo hablando de lucha de clases. ¿Dónde está la otra clase?"
      />

      <Cita fuente="Collins, «Anotaciones finales», pág. 627.">
        <p>
          Más aún, el proceso formativo ocurre en un contexto conflictivo con otros grupos
          sociales así que, si bien la formación de clases afecta la forma en que se realiza la
          lucha de clases, este último también establece el contexto en el cual el mismo
          proceso formativo se realiza (Wright, 1978).
        </p>
      </Cita>

      <div className="mt-5">
        <Ejercicio numero="6" titulo="La clase que falta">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            ¿Cuál sería la clase con la que se enfrentó la burguesía azucarera por la tierra y el
            control de la producción? En el artículo casi no aparece: los trabajadores salen de
            paso, vistos por los dueños y las autoridades como «inseguridad social» (págs.
            606–609). Contrasten esa ausencia con el relato de Jacques Aprile-Gniset en «Cuatro
            pistas para el estudio del espacio urbano caleño», que ya leyeron.
          </p>
          <Texto
            label="Su respuesta"
            valor={r.p6_clases}
            onChange={(v) => set("p6_clases", v)}
            filas={8}
            minPalabras={120}
            maxPalabras={350}
          />
        </Ejercicio>
      </div>
    </>
  );
}
