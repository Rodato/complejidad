"use client";

import { Calculo, CabezaParte, Cita, Definicion, Ejercicio, Limite, Revelable, Tabla, Texto } from "./ui";
import { Cono40 } from "./graficas";
import { CUARENTA, num, pesos40 } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Parte2Cono({ r, set }: Props) {
  const anillos = CUARENTA.perfil.filter((p) => p.tipo === "lote");
  const centro = anillos.find((p) => p.desde === 0)!;
  const segundo = anillos.find((p) => p.desde === 1)!;
  const lejanos = CUARENTA.escrituras.filter((e) => e.tipo === "lote" && e.km !== null && e.km > 5).length;

  return (
    <>
      <CabezaParte
        numero={2}
        titulo="El cono de 1943"
        bajada="Si cada lote se pone según su distancia a la Plaza de Caicedo, ¿el precio del metro baja a medida que uno se aleja del centro?"
      />

      <Definicion titulo="La forma cónica de Hoyt">
        <p>
          En 1933 Homer Hoyt midió el valor del suelo en Chicago desde 1830 y encontró una forma
          que se repetía: un pico en el centro y una pendiente que baja hacia la periferia. Neil
          Smith parte de esa figura para su teoría de la gentrificación.
        </p>
      </Definicion>

      <Cita fuente="Smith (1979), «Toward a Theory of Gentrification», pág. 541. Traducción nuestra.">
        <p>
          Durante el siglo XIX, en la mayoría de las ciudades del este [de Estados Unidos], los
          valores del suelo mostraban la clásica forma cónica: un pico en el centro urbano, con
          un gradiente que baja en todas direcciones hacia la periferia.
        </p>
      </Cita>
      <p className="mb-4 text-sm leading-relaxed text-stone-500">
        La figura 1 de Smith (pág. 542) dibuja ese perfil para Chicago en 1873, 1892 y 1928. Tenla
        a mano para el ejercicio 2.2.
      </p>

      <Cono40 />

      <Tabla
        columnas={[
          { titulo: "Distancia a la plaza" },
          { titulo: "Lotes", derecha: true },
          { titulo: "Mediana por m²", derecha: true },
        ]}
        filas={anillos.map((p) => [`${num(p.desde)} a ${num(p.hasta)} km`, p.n, pesos40(p.mediana)])}
        pie={`Solo ${CUARENTA.n_ubicadas} de las ${CUARENTA.n} compraventas nombran un barrio o paraje que se pueda ubicar hoy. Más allá de 5 km hay apenas ${lejanos} lotes, así que ese anillo no se resume.`}
      />

      <div className="mt-6">
        <Ejercicio numero="2.1" titulo="¿Cuánto más cerca de la plaza?">
          <Calculo
            label="¿Cuántas veces más caro era el m² de lote a menos de 1 km de la plaza que entre 1 y 2 km?"
            valor={r.p2_razon}
            onChange={(v) => set("p2_razon", v)}
            esperado={centro.mediana / segundo.mediana}
            tolerancia={0.08}
            placeholder="veces"
            bien={`Bien: unas ${num(centro.mediana / segundo.mediana, 1)} veces (${pesos40(centro.mediana)} contra ${pesos40(segundo.mediana)}).`}
            mal="Revisen: es la mediana del primer anillo dividida por la del segundo."
          />
        </Ejercicio>

        <Ejercicio numero="2.2" titulo="¿Tenía Cali un cono?">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            Comparen la gráfica con la figura 1 de Smith. ¿Tiene Cali en 1941–44 algo parecido a
            un cono? ¿Qué explica el pico? Usen la cita de Harvey de abajo. Y digan qué no permite
            afirmar esta gráfica: cuántos datos hay en cada anillo y cómo se ubicó cada escritura.
          </p>
          <Cita fuente="Harvey (1982), pág. 369. Traducción nuestra.">
            <p>
              Si la renta depende de la localización relativa, y la localización relativa puede
              transformarse con mejoras en el transporte, entonces la inversión en transporte
              tiende a aumentar el valor de la tierra en las zonas cercanas a ella.
            </p>
          </Cita>
          <Texto
            label="Su respuesta"
            valor={r.p2_cono}
            onChange={(v) => set("p2_cono", v)}
            filas={7}
            minPalabras={100}
            maxPalabras={300}
          />
          <Revelable habilitado={r.p2_cono.trim().split(/\s+/).length >= 60} etiqueta="Ver comentario">
            <p className="text-sm leading-relaxed text-stone-700">
              Hay un pico claro en el primer kilómetro (los lotes de La Merced, Centenario,
              Granada, Santa Rosa, Juanambú) y después una meseta baja, sin la pendiente suave de
              Chicago. Dentro del pico también hay lotes baratos: los ejidos de la Loma de la Cruz,
              en San Antonio, que vende el Municipio (se ven en la parte 4). Más que un cono es un pico con una base ancha y plana. Ojo con dos
              cosas: los puntos están en el centro del barrio, no en su predio, y fuera de los
              3 km casi no hay escrituras ubicables.
            </p>
          </Revelable>
        </Ejercicio>
      </div>

      <Limite>
        La distancia es la del centro del barrio de hoy, no la del predio. Barrios como Vilachí,
        El Sindicato o los terrenos sin barrio no se pudieron ubicar y quedan fuera de esta
        gráfica.
      </Limite>
    </>
  );
}
