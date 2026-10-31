"use client";

import { useState } from "react";
import { Calculo, CabezaParte, Cita, Definicion, Ejercicio, Limite, Tabla, Texto } from "./ui";
import { num } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

// Uribe y Vásquez, tabla 1 (pág. 44): rentabilidad efectiva anual, septiembre de 1976.
const TABLA_1 = [
  ["Títulos de Participación", "90 días", "22,1"],
  ["CDT (bancos)", "90 días", "25,6"],
  ["CDT (corporaciones financieras)", "90 días", "26,8"],
  ["Cuentas de ahorros (bancos)", "90 días", "19,3"],
  ["Títulos de Participación", "180 días", "22,7"],
  ["P. A. S.", "180 días", "26,8"],
  ["Cédulas Confiables BCH", "1 año", "23,2"],
  ["T. A. C.¹", "3 años", "37,7"],
  ["Cuentas UPAC²", "90 días", "22,7"],
  ["Certificados UPAC", "180 días", "23,9"],
];

/** Renta anual del lote del ejercicio, en millones de pesos de hoy. */
const RENTA = 12;

export default function Parte7Ficticio({ r, set }: Props) {
  const [tasa, setTasa] = useState(10);
  const precio = RENTA / (tasa / 100);

  return (
    <>
      <CabezaParte
        numero={7}
        titulo="La tierra como capital ficticio"
        bajada="Si el precio de la tierra es renta capitalizada, depende de dos cosas: la renta que se espera y la tasa de interés. Harvey saca de ahí sus conclusiones más fuertes."
      />

      <Cita fuente="Harvey (1982), pág. 367. Traducción nuestra.">
        <p>
          El comprador adquiere un derecho sobre ingresos futuros anticipados, un derecho sobre
          los frutos futuros del trabajo. El título de propiedad de la tierra se vuelve, en suma,
          una forma de capital ficticio.
        </p>
        <p>
          Las fuerzas básicas que regulan el precio de la tierra y de lo que tiene encima son la
          tasa de interés y las rentas futuras anticipadas. […] Las tendencias de largo plazo a
          una tasa de interés decreciente, o las plétoras temporales de capital-dinero, darán por
          lo general valores del suelo más altos (con las rentas constantes).
        </p>
      </Cita>
      <Cita fuente="Harvey (1982), págs. 367–368, citando a Marx. Traducción nuestra.">
        <p>
          En la construcción de vivienda en ciudades que crecen rápido, la ganancia de construir
          es extremadamente pequeña y «la ganancia principal viene de subir la renta del suelo», de modo
          que es «la renta del suelo, y no la casa, el verdadero objeto de la especulación
          inmobiliaria».
        </p>
      </Cita>

      <Definicion titulo="La cuenta de Harvey">
        <p>
          Si un lote da una renta de <strong>R</strong> pesos al año y el dinero, en otro lado,
          rinde una tasa <strong>i</strong>, nadie pagará por el lote más que lo que, invertido a
          esa tasa, daría lo mismo: <strong>precio = R ÷ i</strong>.
        </p>
      </Definicion>

      <section className="card mb-5 p-4 sm:p-5">
        <p className="mb-2 text-[15px] text-stone-700">
          Un lote que se arrienda por <strong>${num(RENTA)} millones al año</strong>. Muevan la tasa
          de interés:
        </p>
        <label className="flex items-center gap-3">
          <input
            type="range"
            min={2}
            max={30}
            step={0.5}
            value={tasa}
            onChange={(e) => setTasa(Number(e.target.value))}
            className="flex-1 accent-brand-600"
            aria-label="Tasa de interés anual"
          />
          <span className="w-16 text-right text-lg font-bold tabular-nums text-stone-900">{num(tasa, 1)} %</span>
        </label>
        <p className="mt-3 text-sm text-stone-500">Precio que tendría sentido pagar por el lote:</p>
        <p className="text-2xl font-bold tabular-nums text-stone-900">${num(precio, 1)} millones</p>
      </section>

      <p className="mb-2 text-[15px] leading-relaxed text-stone-600">
        En los años setenta la tasa con la que se comparaba la tierra era altísima. José Ignacio
        Uribe y Edgar Vásquez, en «La expansión urbana y la actividad constructora en Cali
        (1970–1980)», muestran lo que rendía el dinero en 1976 y cuentan cómo, desde 1972, el
        plan de «Las Cuatro Estrategias» y el sistema UPAC canalizaron el ahorro privado hacia
        la construcción, que el plan trataba como sector líder (págs. 42–43).
      </p>
      <Tabla
        columnas={[{ titulo: "Activo" }, { titulo: "Plazo" }, { titulo: "Rentab. %", derecha: true }]}
        filas={TABLA_1}
        pie="Uribe y Vásquez, tabla 1 (pág. 44): rentabilidad efectiva anual de algunos activos financieros, septiembre de 1976. Fuente original: revista Banca y Finanzas n.º 154. ¹ Rendimiento en Bolsa. ² Corrección monetaria máxima del 18 %."
      />

      <div className="mt-6">
        <Ejercicio numero="7.1" titulo="El precio de la renta">
          <Calculo
            label="Si la alternativa es un CDT de banco de 1976 (25,6 %), ¿cuánto se pagaría por el lote, en millones?"
            valor={r.p7_precio_alto}
            onChange={(v) => set("p7_precio_alto", v)}
            esperado={[RENTA / 0.256, (RENTA / 0.256) * 1e6]}
            tolerancia={0.03}
            placeholder="millones"
            bien={`Bien: unos $${num(RENTA / 0.256, 1)} millones.`}
            mal="Revisen: renta anual dividida por la tasa (25,6 % = 0,256)."
          />
          <Calculo
            label="¿Y si la tasa baja al 6 %?"
            valor={r.p7_precio_bajo}
            onChange={(v) => set("p7_precio_bajo", v)}
            esperado={[RENTA / 0.06, (RENTA / 0.06) * 1e6]}
            tolerancia={0.03}
            placeholder="millones"
            bien={`Bien: $${num(RENTA / 0.06)} millones. La renta no cambió y el precio se multiplicó por ${num(0.256 / 0.06, 1)}.`}
            mal="Revisen: renta anual dividida por 0,06."
          />
        </Ejercicio>

        <Ejercicio numero="7.2" titulo="¿Renta o expectativa?">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            Con Harvey y con Uribe y Vásquez: ¿qué le pasa al precio de la tierra cuando el ahorro
            se canaliza masivamente hacia la construcción, como con el UPAC desde 1972? Y hoy: el
            m² de Pance o de Ciudad Jardín (parte 5), ¿paga una renta que ya existe o una
            expectativa de renta futura? ¿Qué diferencia hay, para quien compra, entre las dos?
          </p>
          <Texto
            label="Su respuesta"
            valor={r.p7_ficticio}
            onChange={(v) => set("p7_ficticio", v)}
            filas={8}
            minPalabras={120}
            maxPalabras={350}
          />
        </Ejercicio>
      </div>

      <Limite>
        La cuenta R ÷ i supone una renta constante para siempre y no distingue tasas nominales
        de reales: en 1976 buena parte de ese 25 % era inflación. Es una herramienta para
        pensar, no para tasar un lote. Y de Uribe y Vásquez solo tenemos por ahora las primeras
        tres páginas.
      </Limite>
    </>
  );
}
