"use client";

import { useMemo, useState } from "react";
import {
  ARISTAS_GOT,
  CANDIDATOS_PUENTE,
  ETIQUETA_PERSONAJE,
  FUENTE_GOT,
  PERSONAJES,
} from "@/lib/contenido";
import { MEDIDAS, crearRed, fmt, puestos, todasLasMetricas, type Medida } from "@/lib/red";
import type { Respuestas } from "@/lib/tipos";
import Red from "./Red";
import {
  CabezaActo,
  Definicion,
  Ejercicio,
  Lienzo,
  Opciones,
  Texto,
  Veredicto,
} from "./ui";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

const RED = crearRed(
  PERSONAJES.map((p) => p.id),
  ARISTAS_GOT,
);
const M = todasLasMetricas(RED);
const PUESTOS = Object.fromEntries(MEDIDAS.map((d) => [d.clave, puestos(M[d.clave])])) as Record<
  Medida,
  Record<string, number>
>;
const NODOS = PERSONAJES.map((p) => ({ id: p.id, etiqueta: p.etiqueta, x: p.x, y: p.y }));
const N = PERSONAJES.length;

const PRIMERO = Object.entries(M.grado).sort((a, b) => b[1] - a[1])[0][0];
const OPCIONES_PRIMERO = ["Eddard-Stark", "Tyrion-Lannister", "Jon-Snow", "Daenerys-Targaryen"];

/** El candidato que es puente sin estar en el núcleo: top 10 en intermediación, 40+ en vector propio. */
const PUENTE = CANDIDATOS_PUENTE.find(
  (c) => PUESTOS.intermediacion[c] <= 10 && PUESTOS.vectorPropio[c] >= 40,
)!;

const nombre = (id: string) => ETIQUETA_PERSONAJE[id] ?? id;

export default function Acto5Thrones({ r, set }: Props) {
  const [medida, setMedida] = useState<Medida>("grado");
  const [tocado, setTocado] = useState<string | null>(null);
  const [ampliada, setAmpliada] = useState(false);

  const tamanos = useMemo(() => {
    const v = M[medida];
    const max = Math.max(...Object.values(v)) || 1;
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x / max]));
  }, [medida]);
  const top = useMemo(
    () => Object.entries(M[medida]).sort((a, b) => b[1] - a[1]).slice(0, 10),
    [medida],
  );
  const marcados = [...top.slice(0, 5).map(([id]) => id), ...(tocado ? [tocado] : [])];

  return (
    <div>
      <CabezaActo
        numero={5}
        titulo="Cuando la red no cabe en la mano"
        bajada="Florencia tenía 15 familias y 20 matrimonios: se puede contar con el dedo. La red de compraventas de Cali que vamos a estudiar tiene cientos de actores. A esa escala ya no se cuenta a mano: se calcula. Antes de llegar a Cali, un ensayo con una red que muchos conocen."
      />

      <Definicion titulo="La red de Juego de tronos">
        <p>
          Dos matemáticos, Andrew Beveridge y Jie Shan, tomaron el primer libro de la saga de
          George R. R. Martin (el de la primera temporada de la serie) y unieron a dos personajes
          cada vez que sus nombres aparecían a menos de 15 palabras uno del otro. Salió una red
          no dirigida de <strong>{N} personajes</strong> y{" "}
          <strong>{ARISTAS_GOT.length} vínculos</strong>.
        </p>
        <p>
          Las cuatro medidas son las mismas del Acto 4. La diferencia es que ahora las calcula el
          computador: tú lees los resultados.
        </p>
      </Definicion>

      <Ejercicio numero="5.1" titulo="Explorar la red">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Elige una medida: los personajes crecen según su valor y se nombran los cinco primeros.
          Toca un punto para saber quién es y en qué puesto queda en cada medida.
        </p>
        <div className="mb-3">
          <Opciones<Medida>
            opciones={MEDIDAS.map((d) => ({ clave: d.clave, nombre: d.nombre }))}
            valor={medida}
            onChange={setMedida}
          />
        </div>
        <Lienzo pie={FUENTE_GOT}>
          <div className={ampliada ? "overflow-auto" : ""}>
            <div className={ampliada ? "w-[260%]" : ""}>
              <Red
                nodos={NODOS}
                aristas={ARISTAS_GOT}
                tamanos={tamanos}
                marcados={marcados}
                etiquetas="marcados"
                radioBase={1.1}
                densa
                onToque={(id) => setTocado((t) => (t === id ? null : id))}
                titulo={`Red de personajes de Juego de tronos, tamaño según ${medida}`}
              />
            </div>
          </div>
        </Lienzo>
        <button onClick={() => setAmpliada((v) => !v)} className="btn btn-secondary mb-3 w-full">
          {ampliada ? "Ver la red completa" : "Ampliar (y deslizar para recorrerla)"}
        </button>

        {tocado && (
          <div className="mb-3 rounded-lg border border-brand-200 bg-brand-50 p-3">
            <p className="font-semibold text-stone-900">{nombre(tocado)}</p>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm text-stone-700">
              {MEDIDAS.map((d) => (
                <p key={d.clave}>
                  {d.nombre}: <strong>puesto {PUESTOS[d.clave][tocado]}</strong>
                </p>
              ))}
            </div>
          </div>
        )}

        <p className="mb-1 text-sm font-semibold text-stone-800">
          Los 10 primeros en {MEDIDAS.find((d) => d.clave === medida)!.nombre.toLowerCase()}
        </p>
        <ol className="mb-5 text-sm">
          {top.map(([id, v], i) => (
            <li key={id} className="flex items-center gap-2 border-b border-stone-200 py-1">
              <span className="w-5 text-right tabular-nums text-stone-400">{i + 1}</span>
              <button
                onClick={() => setTocado(id)}
                className="flex-1 text-left text-stone-800 underline decoration-stone-300 underline-offset-2"
              >
                {nombre(id)}
              </button>
              <span className="tabular-nums text-stone-600">
                {medida === "grado" ? v : fmt(v)}
              </span>
            </li>
          ))}
        </ol>

        <p className="mb-2 text-[15px] font-medium text-stone-800">
          ¿Quién queda primero en las cuatro medidas?
        </p>
        <Opciones<string>
          opciones={OPCIONES_PRIMERO.map((id) => ({ clave: id, nombre: nombre(id) }))}
          valor={r.a5_numero_uno}
          onChange={(v) => set("a5_numero_uno", v)}
        />
        {r.a5_numero_uno && (
          <Veredicto bien={r.a5_numero_uno === PRIMERO}>
            {r.a5_numero_uno === PRIMERO
              ? `Sí: ${nombre(PRIMERO)} es primero en todo. En el libro 1 casi todas las historias pasan por él. Cuando un nodo gana en todas las medidas, las medidas no discuten; lo interesante está en los que no coinciden.`
              : "Revisa las cuatro tablas: hay uno que está primero en todas."}
          </Veredicto>
        )}
      </Ejercicio>

      <Ejercicio numero="5.2" titulo="Un puente fuera del núcleo">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Busca un personaje que esté entre los 10 primeros en <strong>intermediación</strong>{" "}
          pero muy abajo (puesto 40 o peor) en <strong>vector propio</strong>. Toca a los
          candidatos en la red o en las tablas para ver sus puestos.
        </p>
        <Opciones<string>
          opciones={CANDIDATOS_PUENTE.map((id) => ({ clave: id, nombre: nombre(id) }))}
          valor={r.a5_puente}
          onChange={(v) => set("a5_puente", v)}
        />
        {r.a5_puente && (
          <Veredicto bien={r.a5_puente === PUENTE}>
            {nombre(r.a5_puente)}: puesto {PUESTOS.intermediacion[r.a5_puente]} en intermediación y{" "}
            {PUESTOS.vectorPropio[r.a5_puente]} en vector propio.{" "}
            {r.a5_puente === PUENTE
              ? "Ese es."
              : "No cumple las dos condiciones. Prueba con otro."}
          </Veredicto>
        )}
        <div className="mt-4">
          <Texto
            label={`¿Por qué ${nombre(PUENTE)} es tan buen puente y tan poco «importante» para el núcleo? ¿A qué familia florentina se parece? Y Petyr Baelish (Meñique) es lo contrario: puesto ${PUESTOS.vectorPropio["Petyr-Baelish"]} en vector propio y ${PUESTOS.intermediacion["Petyr-Baelish"]} en intermediación. ¿A quién se parece él?`}
            ayuda="Piensa en dónde transcurre la historia de cada personaje y con quién habla. Si no conoces la saga, fíjate en dónde queda cada uno en el dibujo de la red."
            valor={r.a5_puente_porque}
            onChange={(v) => set("a5_puente_porque", v)}
            filas={6}
            placeholder="Escribe aquí…"
          />
        </div>
      </Ejercicio>

      <Ejercicio numero="5.3" titulo="De vuelta a Cali">
        <Texto
          label="La próxima semana trabajamos con la red de compraventas de la Notaría Segunda, 1938–1944: cientos de actores y cientos de escrituras. Si quisieras encontrar a «los Medici de Cali», ¿qué medida mirarías y por qué? ¿Y cuál usarías para encontrar a quien más tierra acumula?"
          ayuda="Tres o cuatro frases. Recuerda que esa red, a diferencia de la de Florencia, es dirigida."
          valor={r.a5_cali}
          onChange={(v) => set("a5_cali", v)}
          filas={5}
          placeholder="Escribe aquí…"
        />
      </Ejercicio>
    </div>
  );
}
