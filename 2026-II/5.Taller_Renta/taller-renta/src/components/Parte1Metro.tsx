"use client";

import { Calculo, CabezaParte, Cifra, Cita, Definicion, Ejercicio, Limite, Tabla, Texto } from "./ui";
import { PreciosPorAnio } from "./graficas";
import { CUARENTA, fechaLarga, num, pesos40 } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

// Las dos escrituras del ejercicio 1.1. Se buscan por su contenido, no por posición,
// para que regenerar los datos no las cambie.
const PLAZA = CUARENTA.escrituras.find((e) => e.lugar.includes("Plaza de Caicedo"))!;
const EJIDO = CUARENTA.escrituras.find(
  (e) => e.fecha === "1942-01-14" && e.comprador.startsWith("Octavio Rico"),
)!;

export default function Parte1Metro({ r, set }: Props) {
  const anual = [1941, 1942, 1943, 1944].map((a) => ({
    anio: a,
    lote: CUARENTA.resumen_anual.find((x) => x.anio === a && x.tipo === "lote"),
    casa: CUARENTA.resumen_anual.find((x) => x.anio === a && x.tipo === "casa"),
  }));

  return (
    <>
      <CabezaParte
        numero={1}
        titulo="Un metro de Cali en 1943"
        bajada="Las escrituras de la Notaría 2 dicen cuánto se pagó y, muchas veces, cuántos metros tenía el predio. Con eso se calcula el precio del metro cuadrado. Pero ¿eso es la renta del suelo?"
      />

      <Definicion titulo="Renta y precio no son lo mismo">
        <p>
          La <strong>renta del suelo</strong> es lo que el dueño de la tierra cobra por dejar que
          otros la usen: el arriendo de un lote, la parte de la cosecha, lo que paga quien
          construye. El <strong>precio</strong> de la tierra es otra cosa: es lo que alguien paga
          hoy por quedarse con esa renta en el futuro.
        </p>
        <p>
          Nuestras escrituras dan precios, no rentas. Por eso este taller mide precios del metro
          cuadrado y discute qué tanto dicen de la renta.
        </p>
      </Definicion>

      <Cita fuente="Harvey, The Limits to Capital (1982), cap. 11, pág. 367. Traducción nuestra.">
        <p>
          La renta del suelo, capitalizada como el interés sobre algún capital imaginario,
          constituye el «valor» de la tierra. Lo que se compra y se vende no es la tierra, sino
          el título a la renta que ella produce.
        </p>
      </Cita>

      <h3 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-stone-500">
        Los datos
      </h3>
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <Cifra valor={num(CUARENTA.n)} etiqueta="compraventas con precio y área" />
        <Cifra valor={num(CUARENTA.n_lotes)} etiqueta="lotes" />
        <Cifra valor={num(CUARENTA.n_casas)} etiqueta="casas con su lote" />
      </div>
      <p className="mb-4 text-[15px] leading-relaxed text-stone-600">
        Salen de dos fuentes: la base de la Notaría 2 que ya conocen y la lectura nueva de los
        tomos escaneados del Archivo Histórico de Cali (1941–1944). Solo quedan las compraventas
        que dicen precio y área. Se sacaron las retroventas (en realidad eran préstamos con la
        casa de garantía), las hipotecas y las ventas de una parte del predio (una mitad, una
        cuota), porque en esas no se sabe a qué área corresponde el precio.
      </p>

      <PreciosPorAnio />

      <Tabla
        columnas={[
          { titulo: "Año" },
          { titulo: "Lotes", derecha: true },
          { titulo: "Mediana lote", derecha: true },
          { titulo: "Casas", derecha: true },
          { titulo: "Mediana casa", derecha: true },
        ]}
        filas={anual.map((a) => [
          a.anio,
          a.lote?.n ?? 0,
          pesos40(a.lote?.mediana),
          a.casa?.n ?? 0,
          pesos40(a.casa?.mediana),
        ])}
        pie="Pesos corrientes por metro cuadrado. La mediana es el valor del medio: la mitad de las ventas está por encima y la otra mitad por debajo."
      />

      <div className="mt-6">
        <Ejercicio numero="1.1" titulo="Calcular el metro cuadrado">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            El {fechaLarga(PLAZA.fecha)} Irma, Francisco, Eduardo, José, Pedro Pablo y Ruth Caicedo vendieron
            la casa de la calle 11 sobre la Plaza de Caicedo, de {num(PLAZA.area, 1)} m², por{" "}
            {pesos40(PLAZA.valor)}. El {fechaLarga(EJIDO.fecha)} el
            Municipio de Cali le vendió a {EJIDO.comprador} un lote ejido de {num(EJIDO.area, 1)} m²
            en el barrio Obrero por {pesos40(EJIDO.valor)}.
          </p>
          <Calculo
            label="¿Cuánto costó el m² de la casa de la plaza?"
            valor={r.p1_m2_plaza}
            onChange={(v) => set("p1_m2_plaza", v)}
            esperado={PLAZA.pm2}
            tolerancia={0.02}
            placeholder="pesos por m²"
            bien={`Bien: ${pesos40(PLAZA.pm2)} por m². Es la venta más cara de toda la muestra.`}
            mal="Revisen: es el precio dividido por el área."
          />
          <Calculo
            label="¿Y el m² del lote ejido del barrio Obrero?"
            valor={r.p1_m2_ejido}
            onChange={(v) => set("p1_m2_ejido", v)}
            esperado={EJIDO.pm2}
            tolerancia={0.03}
            placeholder="pesos por m²"
            bien={`Bien: ${pesos40(EJIDO.pm2)} por m². El de la plaza vale unas ${num(PLAZA.pm2 / EJIDO.pm2)} veces más por metro.`}
            mal="Revisen: precio dividido por área, con dos decimales."
          />
        </Ejercicio>

        <Ejercicio numero="1.2" titulo="¿Eso es la evolución de la renta?">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            La mediana del m² de lote pasó de {pesos40(anual[0].lote?.mediana)} en 1941 a{" "}
            {pesos40(anual[3].lote?.mediana)} en 1944. ¿Podemos decir que esa es la evolución de la
            renta del suelo en Cali? Usen la cita de Harvey y la gráfica: ¿qué falta para
            afirmarlo? Piensen en cuántas ventas hay cada año, en qué se vendió cada año y en qué
            le pasó al peso.
          </p>
          <Texto
            label="Su respuesta"
            valor={r.p1_evolucion}
            onChange={(v) => set("p1_evolucion", v)}
            filas={7}
            minPalabras={100}
            maxPalabras={300}
          />
        </Ejercicio>
      </div>

      <Limite>
        Son pesos corrientes de cada año, no ajustados por inflación, y la muestra es la de una
        sola notaría de las que había en Cali. 1941 tiene pocas ventas y 1944 también: los
        tomos que se alcanzaron a leer son los que el Archivo tenía escaneados.
      </Limite>
    </>
  );
}
