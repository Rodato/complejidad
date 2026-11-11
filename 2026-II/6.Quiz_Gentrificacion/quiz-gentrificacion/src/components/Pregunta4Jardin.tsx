"use client";

import { CabezaParte, Cifra, Cita, Ejercicio, Limite, Texto } from "./ui";
import { HOY, millones, num, signo } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

/** Barras horizontales: el m² de apartamento por grupo de barrios, y su cambio real. */
function Escalera() {
  const max = Math.max(...HOY.grupos.map((g) => g.apto));
  return (
    <figure className="mb-4 rounded-lg border border-stone-200 bg-white">
      <figcaption className="border-b border-stone-100 px-3 py-2 text-sm font-semibold text-stone-800">
        Precio del m² de apartamento en avisos de venta, 2022–2023
      </figcaption>
      <ul className="flex flex-col gap-3 px-3 py-3">
        {HOY.grupos.map((g) => (
          <li key={g.clave}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-stone-800">{g.titulo}</span>
              <span className="shrink-0 tabular-nums text-stone-700">{millones(g.apto, 1)}</span>
            </div>
            <div className="mt-1 h-2.5 rounded-full bg-stone-100">
              <div
                className="h-2.5 rounded-full bg-brand-500"
                style={{ width: `${(100 * g.apto) / max}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Cambio real 2022–{g.anio_real}: <span className="tabular-nums">{signo(g.real)}</span>
              {g.anio_real < 2024 ? " (no hay avisos suficientes de 2024)" : ""}
            </p>
          </li>
        ))}
      </ul>
      <p className="border-t border-stone-100 bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-500">
        Grupos armados por nosotros, por zona y precio. Cambio real: índice ajustado por barrio y
        tipo de vivienda, descontada la inflación (IPC a diciembre, DANE).
      </p>
    </figure>
  );
}

export default function Pregunta4Jardin({ r, set }: Props) {
  const n = HOY.nuevo;
  const pc22 = (100 * n.c22_nuevo) / n.c22_n;
  const pciudad = (100 * n.ciudad_nuevo) / n.ciudad_n;

  return (
    <>
      <CabezaParte
        numero={4}
        titulo="Ciudad Jardín, 1980 y hoy"
        bajada="En 1980 Mosquera y Aprile anunciaron que la élite pronto dejaría Ciudad Jardín. Cuarenta y cinco años después, ¿qué dicen los precios? Y, con Smith: ¿quién movió a quién?"
      />

      <Cita fuente="Mosquera y Aprile (1980), pág. 95.">
        <p>
          Ahora bien: ¿Qué pasó en Ciudad Jardín? 1) La oferta superó la demanda. [...] 2) Hoy,
          reunidas nuevas condiciones de un buen negocio, pasan a la ofensiva los parceladores y
          los compradores de lotes de «engorde». Engañando a los primeros compradores-residentes a
          los cuales se les prometió «la exclusividad» del sector en base a un loteo de 1.500,
          3.000 metros cuadrados o más, echan atrás y solicitan la disminución de estas normas.
          [...] 3) Desde luego encuentran la simpatía y el apoyo entusiasta de los altos
          funcionarios de la Oficina de Planeación Municipal, siendo que algunos de ellos ambicionan
          radicarse, con algún préstamo en UPACS, en el prestigioso criadero de zancudos.
        </p>
        <p>
          En cuanto a la oligarquía caleña, asediada por tenderos y contrabandistas, rodeada por
          mafiosos, lobos y proletariado de cuello blanco, no tardará en buscar otro «refugio».
        </p>
      </Cita>

      <Cita fuente="Smith (1979), pág. 540. Traducción nuestra.">
        <p>
          Una teoría más amplia de la gentrificación debe tener en cuenta el papel de los
          productores además del de los consumidores y, cuando se hace, parece que las necesidades
          de la producción —en particular la necesidad de obtener ganancias— son una iniciativa
          más decisiva detrás de la gentrificación que la preferencia del consumidor.
        </p>
      </Cita>

      <Escalera />

      <div className="mb-2 grid grid-cols-2 gap-2">
        <Cifra valor={`${num(pc22)} %`} etiqueta={`de los avisos de la comuna 22 (Ciudad Jardín, Pance…) son vivienda nueva: ${n.c22_nuevo} de ${n.c22_n}`} />
        <Cifra valor={`${num(pciudad)} %`} etiqueta={`de los avisos de toda la ciudad son vivienda nueva: ${num(n.ciudad_nuevo)} de ${num(n.ciudad_n)}`} />
      </div>
      <p className="mb-5 text-xs leading-relaxed text-stone-500">
        Avisos de venta de casas y apartamentos, 2020–2024. El resto se anuncia como usado.
      </p>

      <Ejercicio numero="4" titulo="¿Se cumplió la predicción?">
        <Texto
          label="¿Se cumplió lo que anunciaron Mosquera y Aprile en 1980? Digan qué muestran los precios de hoy. Y con Smith: lo que cuentan en la pág. 95 (parceladores, lotes de engorde, Planeación, préstamos UPAC), ¿es una historia de gente que quiere vivir en un lugar o de capital que busca ganancia?"
          valor={r.p4_prediccion}
          onChange={(v) => set("p4_prediccion", v)}
          filas={6}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Limite>
        Los precios dicen cuánto se pide por un metro cuadrado, no quién vive ahí ni de dónde
        llegó. Para saber si la élite se fue de Ciudad Jardín habría que seguir a las personas,
        como hace Smith con los compradores de Society Hill (tabla 1, pág. 539).
      </Limite>
    </>
  );
}
