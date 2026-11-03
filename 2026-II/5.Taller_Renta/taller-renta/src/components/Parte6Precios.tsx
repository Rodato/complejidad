"use client";

import { Calculo, CabezaParte, Definicion, Ejercicio, Limite, Revelable, Tabla, Texto } from "./ui";
import { Composicion, Indices } from "./graficas";
import { HOY, millones, num } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

// Variación anual del IPC a diciembre, DANE.
const IPC = [
  { anio: 2021, var: 5.62 },
  { anio: 2022, var: 13.12 },
  { anio: 2023, var: 9.28 },
  { anio: 2024, var: 5.2 },
];
const IPC_ACUMULADO = 100 * (IPC.reduce((p, x) => p * (1 + x.var / 100), 1) - 1);

export default function Parte6Precios({ r, set }: Props) {
  const casa = (a: number) => HOY.ingenuas.find((x) => x.anio === a && x.tipo === "Casa")!;
  const salto = 100 * (casa(2026).mediana / casa(2024).mediana - 1);
  const nominal = HOY.indice.find((x) => x.anio === 2024)!.indice - 100;
  const real = 100 * ((1 + nominal / 100) / (1 + IPC_ACUMULADO / 100) - 1);
  const n2026 = HOY.ingenuas.filter((x) => x.anio === 2026).reduce((s, x) => s + x.n, 0);

  return (
    <>
      <CabezaParte
        numero={6}
        titulo="¿Subieron los precios?"
        bajada="La pregunta parece fácil: se toma la mediana de cada año y se comparan. Esta parte muestra por qué así no se mide la evolución de los precios."
      />

      <Definicion titulo="Una mediana mezcla dos cosas">
        <p>
          Si la mediana de un año sube, puede ser porque los inmuebles valen más o porque ese año
          se vendieron (o se anunciaron) inmuebles de barrios más caros. Lo segundo es un efecto
          composición. Para separar las dos cosas se compara cada inmueble solo con otros del
          mismo barrio y del mismo tipo.
        </p>
      </Definicion>

      <Tabla
        columnas={[{ titulo: "Año" }, { titulo: "Avisos de casas", derecha: true }, { titulo: "Mediana por m²", derecha: true }]}
        filas={[2020, 2021, 2022, 2023, 2024, 2026].map((a) => [a, num(casa(a).n), millones(casa(a).mediana)])}
        pie={`2025 no viene en la base. En 2026 hay ${num(n2026)} avisos, pero solo de casas y casas campestres: ningún apartamento.`}
      />

      <div className="mt-2">
        <Ejercicio numero="6.1" titulo="El salto de 2026">
          <Calculo
            label="Con la mediana simple de la tabla, ¿cuánto subió el m² de las casas entre 2024 y 2026, en porcentaje?"
            valor={r.p6_salto}
            onChange={(v) => set("p6_salto", v)}
            esperado={salto}
            tolerancia={0.04}
            placeholder="%"
            bien={`Bien: ${num(salto)} %. El precio de las casas se habría duplicado en dos años.`}
            mal="Revisen: (mediana 2026 ÷ mediana 2024 − 1) × 100."
          />
        </Ejercicio>
      </div>

      <Indices />
      <Composicion />

      <Ejercicio numero="6.2" titulo="¿Se duplicó?">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          ¿Se duplicó el precio de las casas en Cali entre 2024 y 2026? Expliquen con la gráfica de
          composición: ¿de qué comunas vienen los avisos de 2026 y de cuáles los de antes? ¿Qué
          muestra la línea azul que no muestra la naranja, incluso en 2026?
        </p>
        <Texto
          label="Su respuesta"
          valor={r.p6_composicion}
          onChange={(v) => set("p6_composicion", v)}
          filas={6}
          minPalabras={80}
          maxPalabras={250}
        />
        <Revelable habilitado={r.p6_composicion.trim().split(/\s+/).length >= 50} etiqueta="Ver comentario">
          <p className="text-sm leading-relaxed text-stone-700">
            No se puede decir. En 2026 más de la mitad de los avisos vienen de las comunas 17, 22
            y 2, que están entre las más caras, mientras que el oriente casi desaparece: la
            mediana sube porque cambió la muestra. Comparando dentro del mismo barrio la subida
            es menor, pero aun así grande. Eso sugiere que 2026 se recogió de otra forma (otra
            fuente, otros filtros, casas más grandes o más lujosas), y es una de las preguntas que
            hay que hacerle a quien armó la base.
          </p>
        </Revelable>
      </Ejercicio>

      <Ejercicio numero="6.3" titulo="Pesos de hoy y pesos de ayer">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Comparando dentro del mismo barrio y tipo, el m² subió {num(nominal, 1)} % entre 2020 y
          2024. En ese mismo período el índice de precios al consumidor subió así:
        </p>
        <Tabla
          columnas={[{ titulo: "Año" }, { titulo: "IPC, variación anual", derecha: true }]}
          filas={[...IPC.map((x) => [x.anio, `${num(x.var, 2)} %`]), ["2021–2024", `${num(IPC_ACUMULADO, 1)} %`]]}
          pie="DANE, variación del IPC a diciembre de cada año. El acumulado multiplica los cuatro años: 1,0562 × 1,1312 × 1,0928 × 1,0520."
        />
        <Calculo
          label="¿Cuánto cambió el precio real del m² entre 2020 y 2024, en porcentaje?"
          valor={r.p6_real}
          onChange={(v) => set("p6_real", v)}
          esperado={real}
          tolerancia={0.2}
          placeholder="%"
          bien={`Bien: ${num(real, 1)} %. En pesos de 2020, el m² valía un poco menos en 2024.`}
          mal={`Revisen: (1 + ${num(nominal / 100, 3)}) ÷ (1 + ${num(IPC_ACUMULADO / 100, 3)}) − 1, por cien. Ojo con el signo.`}
        />
      </Ejercicio>

      <Ejercicio numero="6.4" titulo="Avisos, no ventas">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Los datos de 2020–2026 son el precio que pide el vendedor en un aviso, no el que se
          pagó. Las escrituras de 1941–44 son precios pagados. ¿En qué dirección sesga eso las
          cifras de hoy? ¿Qué inmuebles nunca aparecen en un portal de avisos, y qué barrios
          quedan entonces mal representados?
        </p>
        <Texto
          label="Su respuesta"
          valor={r.p6_avisos}
          onChange={(v) => set("p6_avisos", v)}
          filas={6}
          minPalabras={80}
          maxPalabras={250}
        />
      </Ejercicio>

      <Limite>
        El IPC es de diciembre a diciembre y los avisos solo tienen el año, así que el cálculo
        real es aproximado. Y la comparación dentro del barrio corrige la mezcla de barrios, no
        la de tamaños o calidades dentro de un mismo barrio.
      </Limite>
    </>
  );
}
