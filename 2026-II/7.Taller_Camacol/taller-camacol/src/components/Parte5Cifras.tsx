"use client";

import { CabezaParte, Campo, Cita, Ejercicio, Limite, Tabla, Texto } from "./ui";
import { CIFRAS, CUADRO_VIVIENDA, POBLACION_TREQ } from "@/lib/carta";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

const n = (v: number) => v.toLocaleString("es-CO");

export default function Parte5Cifras({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={5}
        titulo="La evidencia cuantitativa"
        bajada="La carta sustenta sus propuestas con cifras. Esta parte examina qué redistribución proponen, qué incluye la propuesta para el oriente y quién produce cada dato."
      />

      <Ejercicio numero="5.1" titulo="La distribución de la necesidad habitacional">
        <Tabla
          columnas={[
            { titulo: "Tipo de suelo" },
            { titulo: "Proyecto de Acuerdo", derecha: true },
            { titulo: "Camacol", derecha: true },
          ]}
          filas={CUADRO_VIVIENDA.filas.map((f) => [
            f.suelo,
            <span key="a" className="whitespace-nowrap">
              {f.acuerdo.pct} %
              <span className="block text-xs text-stone-500">{n(f.acuerdo.viviendas)}</span>
            </span>,
            <span key="c" className="whitespace-nowrap">
              {f.camacol.pct} %
              <span className="block text-xs text-stone-500">{n(f.camacol.viviendas)}</span>
            </span>,
          ])}
          pie={`Carta de Camacol Valle, pág. 4. Necesidad habitacional estimada por el DAPD: ${n(CUADRO_VIVIENDA.total)} viviendas.`}
        />
        <Texto
          label="¿Cuántas viviendas adicionales asigna Camacol al suelo de expansión frente al Proyecto de Acuerdo, y de qué tipos de suelo las retira?"
          valor={r.p5_viviendas}
          onChange={(v) => set("p5_viviendas", v)}
          filas={2}
        />
      </Ejercicio>

      <Ejercicio numero="5.2" titulo="El Master Plan del Oriente">
        <Cita fuente="Carta de Camacol Valle, pág. 4.">
          <p>
            …sugerimos como opciones concretas la denominada «expansión oriental», adicionando 500
            hectáreas al área de expansión concertada con la CVC, para desarrollar mediante un
            Master Plan del Oriente, y además la destinación de 80 hectáreas al control de borde en
            las laderas. […] La propuesta se integraría, además, con un parque ecoturístico del río
            Cauca, con una dimensión cercana a 2.000 hectáreas, que permitiría pasar de 3,8 m² a
            12,6 m² el índice de espacio público verde por habitante.
          </p>
        </Cita>
        <div className="mb-5">
          <Texto
            label="El Master Plan del Oriente es la propuesta central de la carta para esa zona de la ciudad. ¿Qué comprende: cuántas hectáreas, sobre qué suelo y en qué dirección? Según la carta, ¿quién lo formularía y quién lo aprobaría? ¿Cuáles son las implicaciones para los recursos hídricos, ambientales y paisajísticos de urbanizar el oriente de la ciudad hacia el río Cauca, tal como lo propone Camacol en su Master Plan del Oriente?"
            valor={r.p5_master}
            onChange={(v) => set("p5_master", v)}
            filas={7}
            minPalabras={60}
            maxPalabras={220}
          />
        </div>
        <div className="mb-4">
          <Campo
            label={`Con ${POBLACION_TREQ}, ¿cuántos m² de espacio verde por habitante agrega, por sí solo, un parque de 2.000 hectáreas? (1 hectárea = 10.000 m²)`}
            valor={r.p5_m2}
            onChange={(v) => set("p5_m2", v)}
            numerico
          />
        </div>
        <Texto
          label="Comparen su resultado con el aumento de 3,8 a 12,6 m². ¿Qué proporción de ese aumento explica el parque por sí solo? ¿Por qué la carta presenta el Master Plan del Oriente junto con un parque sobre el río, y qué cambia si ambas propuestas se analizan por separado?"
          valor={r.p5_parque}
          onChange={(v) => set("p5_parque", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Ejercicio numero="5.3" titulo="La procedencia de las cifras">
        <Tabla
          columnas={[{ titulo: "Cifra" }, { titulo: "Pág.", derecha: true }]}
          filas={CIFRAS.map((c) => [
            <span key="c">
              <span className="font-semibold text-stone-900">{c.cifra}</span> {c.que}
            </span>,
            c.pag,
          ])}
          pie="Cifras de la carta de Camacol Valle."
        />
        <Texto
          label="Para cada cifra, identifiquen quién la produce según la carta: el DAPD, el gremio, o si la carta no lo indica. ¿Cuáles pueden verificar ustedes y cuáles deben aceptarse sin posibilidad de verificación? En particular, ¿con qué propósito usa la carta la cifra de 147 mil hogares localizados irregularmente (pág. 3)?"
          valor={r.p5_fuentes}
          onChange={(v) => set("p5_fuentes", v)}
          filas={7}
          minPalabras={60}
          maxPalabras={200}
        />
      </Ejercicio>

      <Limite>
        El origen gremial de una cifra no la invalida, así como su origen oficial no la valida. La
        cuestión es si puede verificarse y con qué fuentes.
      </Limite>
    </>
  );
}
