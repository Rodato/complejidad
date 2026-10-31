"use client";

import { Calculo, CabezaParte, Cita, Definicion, Ejercicio, Limite, Revelable, Tabla, Texto } from "./ui";
import { Cono40 } from "./graficas";
import { CUARENTA, num, pesos40 } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte3TierraCasa({ r, set }: Props) {
  const anillo = (tipo: "lote" | "casa", desde: number) =>
    CUARENTA.perfil.find((p) => p.tipo === tipo && p.desde === desde);
  const filas = [0, 1, 2].map((d) => ({ desde: d, lote: anillo("lote", d), casa: anillo("casa", d) }));
  const razon = (d: number) => anillo("casa", d)!.mediana / anillo("lote", d)!.mediana;

  return (
    <>
      <CabezaParte
        numero={3}
        titulo="Tierra y casa"
        bajada="No es lo mismo el precio del metro de tierra que el del espacio construido. Smith explica por qué hay que separarlos, y nuestras escrituras permiten hacerlo."
      />

      <Definicion titulo="Las cuatro categorías de Smith">
        <p>
          Smith (págs. 542–543) separa cuatro cosas que suelen ir revueltas en la palabra
          «precio»: el <strong>valor de la casa</strong> (el trabajo de construirla, que se
          deprecia con el uso), la <strong>renta del suelo capitalizada</strong> (la que el
          dueño se apropia con el uso actual), la <strong>renta potencial</strong> (la que podría
          apropiarse con el «mejor uso» de ese lugar) y el <strong>precio de venta</strong>.
        </p>
      </Definicion>

      <Cita fuente="Smith (1979), pág. 543. Traducción nuestra.">
        <p>Así, precio de venta = valor de la casa + renta del suelo capitalizada.</p>
      </Cita>

      <p className="mb-4 text-[15px] leading-relaxed text-stone-600">
        En 1941–44 tenemos las dos cosas por separado: lotes vacíos (solo suelo) y casas con su
        lote (suelo más construcción). Las escrituras dan el área del lote, no la construida, así
        que el m² de una casa es su precio dividido por el área del terreno.
      </p>

      <Cono40 casas />

      <Tabla
        columnas={[
          { titulo: "Distancia" },
          { titulo: "Lote", derecha: true },
          { titulo: "Casa", derecha: true },
        ]}
        filas={filas.map((f) => [
          `${f.desde} a ${f.desde + 1} km`,
          f.lote ? `${pesos40(f.lote.mediana)} (${f.lote.n})` : "—",
          f.casa ? `${pesos40(f.casa.mediana)} (${f.casa.n})` : "—",
        ])}
        pie="Mediana del precio por m² de terreno; entre paréntesis, cuántas ventas hay. Más allá de 3 km casi no hay casas ubicables."
      />

      <div className="mt-6">
        <Ejercicio numero="3.1" titulo="¿Cuánto pesa la casa?">
          <Calculo
            label="A menos de 1 km de la plaza, ¿cuántas veces vale más el m² de una casa que el de un lote?"
            valor={r.p3_razon_centro}
            onChange={(v) => set("p3_razon_centro", v)}
            esperado={razon(0)}
            tolerancia={0.08}
            placeholder="veces"
            bien={`Bien: unas ${num(razon(0), 1)} veces.`}
            mal="Revisen: mediana de las casas dividida por la de los lotes, en el mismo anillo."
          />
          <Calculo
            label="¿Y entre 1 y 2 km?"
            valor={r.p3_razon_afuera}
            onChange={(v) => set("p3_razon_afuera", v)}
            esperado={razon(1)}
            tolerancia={0.08}
            placeholder="veces"
            bien={`Bien: unas ${num(razon(1), 1)} veces.`}
            mal="Revisen: mediana de las casas dividida por la de los lotes, entre 1 y 2 km."
          />
        </Ejercicio>

        <Ejercicio numero="3.2" titulo="Separar el suelo de la casa">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            Con la ecuación de Smith: ¿dónde pesa más la casa en el precio de venta y dónde pesa
            más el suelo? ¿Qué dice eso de la renta del centro en 1941–44? Después piensen en
            hoy: la base de la parte 5 trae el precio del m² construido de casas y apartamentos.
            ¿Se puede separar ahí la casa del suelo? ¿Qué dato haría falta para hacerlo?
          </p>
          <Texto
            label="Su respuesta"
            valor={r.p3_casa}
            onChange={(v) => set("p3_casa", v)}
            filas={7}
            minPalabras={100}
            maxPalabras={300}
          />
          <Revelable habilitado={r.p3_casa.trim().split(/\s+/).length >= 60} etiqueta="Ver comentario">
            <p className="text-sm leading-relaxed text-stone-700">
              En el centro la casa apenas duplica el precio del lote: casi todo el precio es suelo,
              renta capitalizada. Afuera, el lote vale poco y la casa multiplica el precio: casi
              todo es construcción. Hoy no se puede separar con avisos de venta. Harían falta
              ventas de lotes vacíos en los mismos barrios, o el avalúo catastral, que registra
              por aparte el valor del terreno y el de la construcción.
            </p>
          </Revelable>
        </Ejercicio>
      </div>

      <Limite>
        Hay pocas casas: {CUARENTA.n_casas} en toda la muestra, y solo unas decenas ubicables. La
        razón entre medianas es una aproximación gruesa: las casas y los lotes de un mismo
        anillo no están en las mismas cuadras.
      </Limite>
    </>
  );
}
