"use client";

import { CabezaParte, Cita, Definicion, Ejercicio, Limite, Opciones, Revelable, Selector, Tabla, Texto, Veredicto } from "./ui";
import { MapaCali, PerfilHoy } from "./graficas";
import { CUARENTA, HOY, millones, num } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

const OPCIONES_DONDE = [
  { clave: "centro", nombre: "Sí: el pico sigue en el centro" },
  { clave: "otra_parte", nombre: "No: el centro quedó cerca de la mediana y los picos están en otra parte" },
  { clave: "plano", nombre: "No hay ningún patrón: el precio es parejo" },
];

// Barrios con datos suficientes en las dos épocas para contar su historia.
const COMPARABLES = CUARENTA.barrios.filter((b) => b.n_lotes >= 3 && b.n_hoy >= 5);

export default function Parte5Roto({ r, set }: Props) {
  const elegido = COMPARABLES.find((b) => b.barrio === r.p5_barrio);

  return (
    <>
      <CabezaParte
        numero={5}
        titulo="El cono roto"
        bajada="Ochenta años después. Con avisos de venta de 2020 a 2024, ¿dónde está hoy el metro cuadrado más caro de Cali?"
      />

      <Definicion titulo="Los avisos de hoy">
        <p>
          Son {num(HOY.n)} avisos de venta de casas y apartamentos de Cali, con precio, área
          construida, barrio y coordenadas. Usamos los {num(HOY.n_ref)} de 2020 a 2024. Dos
          advertencias antes de mirar: son <strong>avisos</strong> (lo que el vendedor pide, no
          lo que se pagó), y es el precio del <strong>m² construido</strong>, no del suelo.
        </p>
        <p>
          Para comparar dos épocas con pesos tan distintos no se comparan pesos: cada lugar se
          compara con la mediana de su propia época. Un índice de 2 quiere decir «el doble de la
          mediana de la ciudad en ese momento».
        </p>
      </Definicion>

      <MapaCali />

      <PerfilHoy />

      <div className="mt-6">
        <Ejercicio numero="5.1" titulo="¿Sigue habiendo un cono?">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            Pasen el mapa de 1941–44 a 2020–24 y miren el perfil por sectores. ¿El pico del precio
            sigue en la Plaza de Caicedo?
          </p>
          <Opciones
            opciones={OPCIONES_DONDE}
            valor={r.p5_donde}
            onChange={(v) => set("p5_donde", v)}
            columnas
          />
          {r.p5_donde && (
            <Veredicto bien={r.p5_donde === "otra_parte"}>
              {r.p5_donde === "otra_parte"
                ? "Así es. Alrededor de la plaza los cuadros están cerca de la mediana de la ciudad. Los picos están en el sur lejano (Ciudad Jardín, Pance) y en la ladera del occidente; el oriente queda por debajo."
                : "Miren otra vez: comparen los cuadros que rodean la plaza con los del sur lejano y los del oriente."}
            </Veredicto>
          )}
        </Ejercicio>

        <Ejercicio numero="5.2" titulo="¿Dónde está la brecha?">
          <Cita fuente="Smith (1979), pág. 545. Traducción nuestra.">
            <p>
              La brecha de renta es la disparidad entre el nivel de la renta potencial del suelo
              y la renta efectivamente capitalizada con el uso actual del suelo.
            </p>
          </Cita>
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            Según Smith, la brecha crece donde el capital se fue (el centro viejo que se deja de
            mantener) mientras la ciudad sigue creciendo alrededor. ¿En qué zona de Cali
            esperarían la brecha más grande? Usen al menos una cifra del mapa o del perfil. ¿Qué
            tendría que pasar, según Smith, para que el capital vuelva a esa zona?
          </p>
          <Texto
            label="Su respuesta"
            valor={r.p5_brecha}
            onChange={(v) => set("p5_brecha", v)}
            filas={7}
            minPalabras={100}
            maxPalabras={300}
          />
          <Revelable habilitado={r.p5_brecha.trim().split(/\s+/).length >= 60} etiqueta="Ver comentario">
            <p className="text-sm leading-relaxed text-stone-700">
              La candidata obvia es el centro: en 1941–44 su suelo valía varias veces la mediana
              de la ciudad y hoy sus avisos están cerca de ella, aunque sigue teniendo la mejor
              localización relativa (Harvey, parte 2). Smith diría que la brecha no se cierra
              sola: hace falta que alguien compre barato, reconstruya y venda caro, y que vuelva
              el crédito. En Cali el Estado ha intentado hacerlo con planes de renovación urbana
              en el centro. Ojo: los avisos miden la renta capitalizada, no la potencial; la
              brecha es una inferencia, no un dato.
            </p>
          </Revelable>
        </Ejercicio>

        <Ejercicio numero="5.3" titulo="La historia de un barrio">
          <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
            Elijan un barrio que aparezca en las dos épocas y cuenten su historia con sus dos
            índices. ¿Ganó o perdió posición dentro de la ciudad? ¿Por qué creen? Digan cuántos
            datos hay detrás de cada índice.
          </p>
          <Selector
            label="Barrio"
            valor={r.p5_barrio}
            onChange={(v) => set("p5_barrio", v)}
            opciones={COMPARABLES.map((b) => ({ clave: b.barrio, nombre: b.barrio }))}
          />
          {elegido && (
            <div className="mt-3">
              <Tabla
                columnas={[{ titulo: "" }, { titulo: "1941–44", derecha: true }, { titulo: "2020–24", derecha: true }]}
                filas={[
                  ["Índice (veces la mediana)", num(elegido.indice_40, 2), num(elegido.indice_hoy, 2)],
                  ["Datos", `${elegido.n_lotes} lotes`, `${elegido.n_hoy} avisos`],
                  ["Mediana por m²", `$${num(elegido.lote_mediana, 2)}`, millones(elegido.mediana_hoy)],
                ]}
                pie={`Hoy: ${elegido.hoy}. A ${num(elegido.km, 1)} km de la plaza.`}
              />
            </div>
          )}
          <div className="mt-3">
            <Texto
              label="Su respuesta"
              valor={r.p5_barrio_relato}
              onChange={(v) => set("p5_barrio_relato", v)}
              filas={6}
              minPalabras={80}
              maxPalabras={250}
            />
          </div>
        </Ejercicio>
      </div>

      <Limite>
        Un aviso no es una venta, y casas y apartamentos no son lotes: el índice de 2020–24 mide
        suelo y construcción juntos. La comparación entre épocas es de posiciones relativas,
        no de precios. Y los barrios con pocos datos (mírenlo en la tabla) pueden cambiar mucho
        con una sola venta más.
      </Limite>
    </>
  );
}
