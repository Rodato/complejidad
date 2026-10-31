"use client";

import { Calculo, CabezaParte, Cifra, Cita, Definicion, Ejercicio, Limite, Revelable, Tabla, Texto } from "./ui";
import { Cono40 } from "./graficas";
import { CUARENTA, num, pesos40 } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte4Municipio({ r, set }: Props) {
  const m = CUARENTA.municipio;
  const porcentaje = (100 * m.n) / CUARENTA.n;

  return (
    <>
      <CabezaParte
        numero={4}
        titulo="¿Quién vendía la tierra?"
        bajada="La renta va a quien es dueño del suelo. En la Cali de 1941–44, uno de los dueños más grandes era la ciudad misma."
      />

      <Definicion titulo="Los ejidos">
        <p>
          Los ejidos eran tierras comunales de la ciudad, administradas por el Municipio. Varios
          de los lotes que aparecen aquí estaban arrendados: quien vivía en el lote le pagaba al
          Municipio un arriendo, que es una renta del suelo en sentido literal. En estos años el
          Municipio los vendió, a veces a quien ya los ocupaba. En el Taller 3 ya lo vieron en
          la red: el Municipio es el gran distribuidor de suelo de la ciudad, vende mucho y casi
          no compra.
        </p>
      </Definicion>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Cifra valor={num(m.n)} etiqueta="ventas del Municipio" />
        <Cifra valor={pesos40(m.mediana)} etiqueta="mediana por m², ejidos" />
        <Cifra valor={pesos40(m.mediana_particulares)} etiqueta="mediana por m², lotes de particulares" />
      </div>
      <p className="mb-4 text-[15px] leading-relaxed text-stone-600">
        En {num(m.a_arrendatarios)} de esas {num(m.n)} escrituras se dice que el comprador ocupaba el
        lote como arrendatario. Cuando el lote ya tenía casa, la casa era del arrendatario, que la
        había levantado: por eso aquí todas las ventas del Municipio cuentan como venta de suelo.
      </p>

      <Cono40 municipio />

      <Tabla
        columnas={[
          { titulo: "Quién vende" },
          { titulo: "Ventas", derecha: true },
          { titulo: "Mediana lote", derecha: true },
          { titulo: "Dónde" },
        ]}
        filas={CUARENTA.vendedores.map((v) => [
          v.vendedor,
          v.n,
          pesos40(v.mediana),
          v.barrios.filter(Boolean).join(", ") || "—",
        ])}
        pie="Vendedores con cuatro o más compraventas en la muestra. Las urbanizadoras privadas venden los lotes de los barrios nuevos: San Fernando, Jorge Isaacs, Versalles, Santa Mónica."
      />

      <div className="mt-6">
        <Ejercicio numero="4.1" titulo="¿Cuánto vendía la ciudad?">
          <Calculo
            label="¿Qué porcentaje de las compraventas de la muestra hizo el Municipio?"
            valor={r.p4_porcentaje}
            onChange={(v) => set("p4_porcentaje", v)}
            esperado={porcentaje}
            tolerancia={0.04}
            placeholder="%"
            bien={`Bien: ${num(porcentaje, 1)} %, casi una de cada tres.`}
            mal={`Revisen: ventas del Municipio dividido por el total de la muestra (${num(CUARENTA.n)}), por cien.`}
          />
        </Ejercicio>

        <Ejercicio numero="4.2" titulo="¿Quién se quedó con la renta?">
          <Cita fuente="Harvey (1982), pág. 368. Traducción nuestra.">
            <p>
              Los dueños de la tierra no asumen en absoluto una posición pasiva en este caso.
              Desempeñan un papel activo en crear las condiciones que permiten apropiarse de
              rentas futuras.
            </p>
          </Cita>
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            El Municipio vendía sus ejidos a menos de la mitad del precio de los lotes de las
            urbanizadoras privadas, muchas veces a quien ya le pagaba arriendo por ellos. ¿Quién
            se quedó con la renta de esa tierra antes y después de la venta? ¿Quién se queda con
            las rentas futuras si la ciudad crece hacia esos barrios? Comparen al Municipio con
            las urbanizadoras de la tabla: ¿quién se comporta como el dueño «activo» de Harvey?
          </p>
          <Texto
            label="Su respuesta"
            valor={r.p4_municipio}
            onChange={(v) => set("p4_municipio", v)}
            filas={7}
            minPalabras={100}
            maxPalabras={300}
          />
          <Revelable habilitado={r.p4_municipio.trim().split(/\s+/).length >= 60} etiqueta="Ver comentario">
            <p className="text-sm leading-relaxed text-stone-700">
              Mientras arrendaba, el Municipio cobraba la renta; al vender, la cambió por un pago
              único y barato, y las rentas futuras pasaron a los compradores. Los ejidos están en
              barrios obreros (Obrero, El Cascajero, La Alameda, Belalcázar), mientras las
              urbanizadoras venden más caro en los barrios que estaban creando. La diferencia de
              precio puede venir del lugar, de la política del Municipio o de las dos cosas: con
              estos datos no se pueden separar.
            </p>
          </Revelable>
        </Ejercicio>
      </div>

      <Limite>
        Las escrituras no dicen por qué el Municipio vendía ni cuánto cobraba de arriendo antes.
        Para eso habría que ir a los acuerdos del Concejo y a las cuentas municipales de esos años.
      </Limite>
    </>
  );
}
