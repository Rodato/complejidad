"use client";

import { CabezaParte, Cita, Definicion, Ejercicio, Limite, ListaVentas, Tabla, Texto } from "./ui";
import { CUARENTA, HOY, fechaCorta, millones, num, pesos40 } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Pregunta5Brecha({ r, set }: Props) {
  const sa = HOY.san_antonio;
  const pos40 = CUARENTA.san_antonio.length
    ? [...CUARENTA.san_antonio].sort((a, b) => a.pm2 - b.pm2)
    : [];
  const med40 =
    pos40.length % 2
      ? pos40[(pos40.length - 1) / 2].pm2
      : (pos40[pos40.length / 2 - 1].pm2 + pos40[pos40.length / 2].pm2) / 2;
  const anios = Object.keys(sa.por_anio);

  return (
    <>
      <CabezaParte
        numero={5}
        titulo="San Antonio: ¿brecha de renta?"
        bajada="San Antonio, al lado del centro, es el barrio que todos nombran cuando se habla de gentrificación en Cali. ¿Qué dicen los datos, leídos con Smith?"
      />

      <Definicion titulo="Gentrificación y brecha de renta, según Smith">
        <p>
          «La gentrificación es el proceso de convertir áreas de clase trabajadora en barrios de
          clase media mediante la rehabilitación del parque de vivienda del barrio» (nota 1, pág.
          547).
        </p>
        <p>
          «La brecha de renta es la disparidad entre el nivel potencial de renta del suelo y la
          renta del suelo efectivamente capitalizada bajo el uso actual del suelo» (pág. 545). Es
          decir: lo que el suelo podría rendir con su mejor uso, contra lo que rinde hoy.
        </p>
        <p className="text-xs text-stone-500">Traducción nuestra.</p>
      </Definicion>

      <Cita fuente="Smith (1979), pág. 546. Traducción nuestra.">
        <p>
          Si esta teoría de la gentrificación como brecha de renta es correcta, se esperaría que la
          rehabilitación empezara donde la brecha era mayor y los rendimientos más altos, es decir,
          en barrios particularmente cercanos al centro de la ciudad y en barrios donde la
          secuencia de valores en descenso ya casi había seguido su curso.
        </p>
      </Cita>

      <h3 className="mb-2 mt-6 text-base font-bold text-stone-900">San Antonio en 1942</h3>
      <ListaVentas
        filas={CUARENTA.san_antonio.map((v) => ({
          fecha: fechaCorta(v.fecha),
          detalle: `${num(v.area)} m²`,
          precio: `${pesos40(v.pm2)}/m²`,
          vendedor: v.vendedor,
          comprador: v.comprador,
        }))}
        pie={`Lotes ejidos que vende el Municipio. Mediana: ${pesos40(med40)} por m², una posición de ${num(med40 / CUARENTA.mediana_lotes, 2)} frente a la mediana de la ciudad (${pesos40(CUARENTA.mediana_lotes)}).`}
      />

      <h3 className="mb-2 mt-6 text-base font-bold text-stone-900">El centro hoy</h3>
      <Tabla
        columnas={[
          { titulo: "Barrio" },
          { titulo: "Por m²", derecha: true },
          { titulo: "Posición", derecha: true },
          { titulo: "Aptos", derecha: true },
        ]}
        filas={HOY.centro.map((c) => [
          <span key="b" className={c.barrio === "San Antonio" ? "font-semibold text-stone-900" : ""}>
            {c.barrio}
            <span className="block text-xs font-normal text-stone-400">{num(c.n)} avisos</span>
          </span>,
          <span key="p" className="whitespace-nowrap">{millones(c.pm2, 1)}</span>,
          num(c.pos, 2),
          `${num(c.apto_pct)} %`,
        ])}
        pie={`Avisos de venta 2020–2024; posición frente a la mediana de la ciudad (${millones(HOY.mediana)} por m²). En San Antonio los ${sa.n} avisos son de ${anios[0]} a ${anios[anios.length - 1]}: ${sa.casas} casas, todas usadas, de ${num(sa.area)} m² en mediana.${HOY.centro.every((c) => c.nuevo_pct === 0) ? " Ninguno de los cuatro barrios tiene avisos de vivienda nueva." : ""}`}
      />

      <Ejercicio numero="5" titulo="¿Encaja San Antonio en lo que espera Smith?">
        <Texto
          label="¿San Antonio encaja en lo que espera Smith? Digan qué parte de los datos apoya su teoría y qué dato les falta para hablar de brecha de renta."
          valor={r.p5_brecha}
          onChange={(v) => set("p5_brecha", v)}
          filas={6}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Limite>
        En 1942 se compara el precio de un lote ejido y hoy el de una casa con su lote. Y un
        aviso dice cuánto pide el dueño, no quién compra ni para qué: no dice si la casa se va a
        rehabilitar, a convertir en hostal o a tumbar.
      </Limite>
    </>
  );
}
