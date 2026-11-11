"use client";

import { Campo, CabezaParte, Cita, Ejercicio, Limite, Tabla, Texto } from "./ui";
import { CUARENTA, num, pesos40 } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Pregunta1Curva({ r, set }: Props) {
  const anillos = CUARENTA.perfil.filter((p) => p.hasta <= 3);

  return (
    <>
      <CabezaParte
        numero={1}
        titulo="La doble curva"
        bajada="Mosquera y Aprile encuentran en los archivos coloniales dos maneras en que el precio del suelo cae: con la distancia a la plaza y, dentro de la cuadra, con la distancia a la esquina. ¿Siguen ahí en las escrituras de 1941–44?"
      />

      <Cita fuente="Mosquera y Aprile (1980), págs. 70–71.">
        <p>
          Existen en la ciudad española desde muy temprano, estos variados tipos de rentas de
          alquileres. Y muy temprano los documentos asocian esquina con renta máxima.
        </p>
      </Cita>
      <Cita fuente="Mosquera y Aprile (1980), pág. 72.">
        <p>
          Así vemos como muy temprano rige en la ciudad «de españoles» una doble curva de precios:
          primero, a escala urbana, desde la Plaza Mayor y sus esquinas, hacia el ejido exterior,
          y segundo, en la misma cuadra, desde los ángulos, hacia el centro de la manzana.
        </p>
      </Cita>

      <h3 className="mb-2 mt-6 text-base font-bold text-stone-900">
        La primera curva: distancia a la Plaza de Caicedo
      </h3>
      <Tabla
        columnas={[
          { titulo: "Distancia" },
          { titulo: "Lotes", derecha: true },
          { titulo: "Mediana por m²", derecha: true },
        ]}
        filas={anillos.map((a) => [`${a.desde} a ${a.hasta} km`, num(a.n), pesos40(a.mediana)])}
        pie={`Compraventas de lotes en la Notaría 2, 1941–1944, en pesos de la época. Cada escritura se ubica en el centro de su barrio. La mediana de todos los lotes es ${pesos40(CUARENTA.mediana_lotes)}.`}
      />

      <h3 className="mb-2 mt-6 text-base font-bold text-stone-900">
        La segunda curva: los lotes «de esquina»
      </h3>
      <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
        De los {num(CUARENTA.n_esquina + CUARENTA.n_resto)} lotes, solo {CUARENTA.n_esquina}{" "}
        dicen en la escritura que quedan en una esquina. Su mediana es{" "}
        <strong>{pesos40(CUARENTA.mediana_esquina)}</strong> por m²; la de los otros{" "}
        {num(CUARENTA.n_resto)} es <strong>{pesos40(CUARENTA.mediana_resto)}</strong>.
      </p>
      <Tabla
        columnas={[{ titulo: "Año" }, { titulo: "Dónde" }, { titulo: "m²", derecha: true }, { titulo: "Por m²", derecha: true }]}
        filas={CUARENTA.esquinas.map((e) => [e.anio, e.donde, num(e.area), pesos40(e.pm2)])}
        pie="Los seis lotes que la escritura llama «esquina». Las dos últimas filas no traen barrio, solo la dirección; la de la carrera 3ª con calle 9ª queda a pocas cuadras de la Plaza de Caicedo."
      />

      <Ejercicio numero="1" titulo="¿Siguen vivas las dos curvas?">
        <div className="mb-4">
          <Campo
            label="¿Cuántas veces más caro es el m² de un lote de esquina que el de los demás lotes? Comparen las dos medianas."
            valor={r.p1_esquina}
            onChange={(v) => set("p1_esquina", v)}
            placeholder="veces"
            numerico
          />
        </div>
        <Texto
          label="¿Se ven en 1941–44 las dos curvas de Mosquera y Aprile? Digan cuál se sostiene con estos datos y por qué la de la esquina no se puede afirmar con estos seis lotes: miren dónde queda cada uno."
          valor={r.p1_curva}
          onChange={(v) => set("p1_curva", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Limite>
        La ubicación es la del barrio, no la del predio, y las escrituras no siempre dicen si el
        lote es esquinero: que no lo digan no prueba que no lo sea.
      </Limite>
    </>
  );
}
