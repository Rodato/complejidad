"use client";

import { CabezaParte, Cita, Ejercicio, Texto } from "./ui";
import { CUADRO_13, CUADRO_15 } from "@/lib/collins";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte5Caicedo({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={5}
        titulo="Hernando Caicedo, economista"
        bajada="Las quejas de los azucareros del Valle en la crisis de 1933, y lo que el mismo Caicedo dijo doce años después."
      />

      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">1933, en plena crisis</h3>
      <Cita fuente="Hernando Caicedo en Relator, 1 de febrero de 1933. Collins, pág. 611.">
        <p>
          Actualmente los ingenios están entregados a su propia suerte. Se hallan regidos por la
          ley ciega e inexorable de la oferta y la demanda. La marcha del negocio no da ningún
          signo de mejoría. Al contrario, los precios ya bajos han bajado más […]. El caso es de
          guerra a muerte, de competencia destructora.
        </p>
      </Cita>
      <Cita fuente="Caicedo, 1933. Collins, pág. 612.">
        <p>La única solución es la cooperación. La cooperación o la ruina.</p>
        <p>
          Hay que descartar la posibilidad de que los interesados aisladamente, sin la ayuda
          oficial, puedan solucionar un caso tan grave.
        </p>
      </Cita>

      <section className="mb-3 rounded-lg border border-stone-200 bg-stone-50 p-4 text-[15px] leading-relaxed text-stone-700">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          La propuesta de Caicedo, según Collins (págs. 612–613)
        </p>
        <p>
          En 1933 se producían 750.000 quintales y se consumían 500.000. Caicedo propone bajar
          la producción un 20 % y crear una entidad financiera del Estado, manejada por la Caja
          de Crédito Agrario o los Almacenes Generales de Depósito, que venda los 500.000
          quintales a $4,50 (un ingreso de $2.250.000) y les pague a los ingenios $1.500.000, o
          $2,50 el quintal. La ganancia, $750.000, se repartiría entre los ingenios después de
          los gastos, y la entidad guardaría los 100.000 quintales sobrantes. En sus palabras:
          «es un magnífico negocio».
        </p>
      </section>

      <h3 className="mb-2 mt-5 text-sm font-bold uppercase tracking-wide text-stone-500">1945</h3>
      <Cita fuente="Entrevista de Juan Lozano y Lozano a Hernando Caicedo, 1945. Collins, pág. 617.">
        <p>
          P. ¿Para ustedes, los grandes productores de azúcar, no ha representado un regalo el
          aumento de un centavo por libra que autorizó el Gobierno el año pasado?
        </p>
        <p>
          R. Qué va a ser un regalo. Si el mercado fuese libre, el precio del azúcar sería mayor,
          hoy cuando existe escasez y compensaría el precio menor que recibimos cuando
          disminuyen los consumos internos.
        </p>
      </Cita>

      <div className="mt-5">
        <Ejercicio numero="5.1" titulo="¿Son coherentes?">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            Lean las quejas de los productores de azúcar del Valle en las páginas 611–612 (y lo
            que sigue hasta la 617). Si les preguntaran qué piensan, como economistas, de los
            análisis de Hernando Caicedo, ¿ustedes qué dirían? ¿Son coherentes? ¿O no lo son?
            ¿Por qué? Expliquen.
          </p>
          <Texto
            label="Su respuesta"
            valor={r.p5_caicedo}
            onChange={(v) => set("p5_caicedo", v)}
            filas={9}
            minPalabras={150}
            maxPalabras={400}
          />
        </Ejercicio>

        <Ejercicio numero="5.2" titulo="¿Tan mal estaban?">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            El Estado congeló el precio interno del azúcar de 1946 a 1955. Según Collins, los
            ingenios «denunciaron la poca rentabilidad de sus inversiones, según lo indicado en
            el cuadro 13» (pág. 617). Miren el cuadro 13: ¿muestra baja rentabilidad? En el
            cuadro 15, la producción pasó de 82 mil toneladas en 1946 a 261 mil en 1956. ¿Eran
            las condiciones tan malas como decían Caicedo y los demás azucareros?
          </p>
          <Cuadro13 />
          <Cuadro15 />
          <Texto
            label="Su respuesta"
            valor={r.p5_produccion}
            onChange={(v) => set("p5_produccion", v)}
            filas={6}
          />
        </Ejercicio>

        <Ejercicio numero="5.3" titulo="Importaciones en el Frente Nacional">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            En 1958 y 1960, al comienzo del Frente Nacional, se importaron 43,8 y 66,6 mil
            toneladas de azúcar (cuadro 15, arriba), mientras la producción nacional seguía
            creciendo. ¿Por qué hubo importaciones tan grandes? Investiguen un poco.
          </p>
          <Texto
            label="Su respuesta"
            valor={r.p5_importaciones}
            onChange={(v) => set("p5_importaciones", v)}
            filas={5}
          />
        </Ejercicio>
      </div>
    </>
  );
}

const celda = "px-2 py-1.5 text-right tabular-nums";
const cabeza = "px-2 py-2 text-right font-semibold";

function Cuadro13() {
  return (
    <div className="mb-4 overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <p className="border-b border-stone-100 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-600">
        Cuadro 13 (pág. 619). Sociedades anónimas productoras de azúcar, 1948–1955
      </p>
      <table className="w-full min-w-[34rem] text-left text-sm">
        <thead className="bg-stone-50 text-[11px] uppercase tracking-wide text-stone-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Año</th>
            <th className={cabeza}>Soc.</th>
            <th className={cabeza}>Activo total</th>
            <th className={cabeza}>Activo neto</th>
            <th className={cabeza}>Capital pagado</th>
            <th className={cabeza}>Utilidad líquida</th>
            <th className={cabeza}>Impuestos directos</th>
            <th className="px-3 py-2 text-right font-semibold">Utilidad ÷ patrimonio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {CUADRO_13.map((f) => (
            <tr key={f.anio}>
              <td className="px-3 py-1.5 font-medium text-stone-800">{f.anio}</td>
              <td className={celda}>{f.sociedades}</td>
              <td className={celda}>{f.activoTotal}</td>
              <td className={celda}>{f.activoNeto}</td>
              <td className={celda}>{f.capitalPagado}</td>
              <td className={celda}>{f.utilidad}</td>
              <td className={celda}>{f.impuestos}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{f.relacion} %</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-stone-100 bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-500">
        Cifras como las imprime Collins; el cuadro no dice la unidad. «Soc.» es el número de
        sociedades de cada año. La última columna es la utilidad líquida dividida por el activo
        neto. Se omiten la reserva legal y el good will. Desliza la tabla hacia la izquierda
        para verla completa.
      </p>
    </div>
  );
}

function Cuadro15() {
  const num = (x: number) => x.toFixed(1).replace(".", ",");
  return (
    <div className="mb-4 overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <p className="border-b border-stone-100 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-600">
        Cuadro 15 (pág. 622). Azúcar en miles de toneladas, 1946–1961
      </p>
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 text-[11px] uppercase tracking-wide text-stone-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Año</th>
            <th className={cabeza}>Producción</th>
            <th className="px-3 py-2 text-right font-semibold">Importación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {CUADRO_15.map((f) => (
            <tr key={f.anio} className={f.anio === 1958 || f.anio === 1960 ? "bg-brand-50" : undefined}>
              <td className="px-3 py-1.5 font-medium text-stone-800">{f.anio}</td>
              <td className={celda}>{num(f.produccion)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">
                {f.importacion === null ? "–" : num(f.importacion)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-stone-100 bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-500">
        Selección de las columnas de producción e importación. Collins también trae consumo,
        exportación y existencias desde 1934.
      </p>
    </div>
  );
}
