"use client";

import { useMemo, useState } from "react";
import {
  ANIO_TEMPORADA,
  ETIQUETA_PERSONAJE,
  FUENTE_GOT,
  N_TEMPORADAS,
  REFERENCIA_GOT,
  TEMPORADAS,
} from "@/lib/contenido";
import {
  crearRed,
  densidad,
  fmt,
  grado,
  intermediacion,
  puestos,
  type Arista,
} from "@/lib/red";
import type { Respuestas } from "@/lib/tipos";
import RedCanvas, { LeyendaCalor, colorCalor, tamanoNodo, type NodoCanvas } from "./RedCanvas";
import Trayectoria from "./Trayectoria";
import {
  CabezaActo,
  Cifra,
  Definicion,
  Ejercicio,
  Lienzo,
  Opciones,
  Revelable,
  Texto,
  Veredicto,
} from "./ui";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
  personaje: string;
};

type MedidaGot = "grado" | "intermediacion";
const MEDIDAS_GOT: { clave: MedidaGot; nombre: string }[] = [
  { clave: "grado", nombre: "Grado" },
  { clave: "intermediacion", nombre: "Intermediación" },
];

// Todo se calcula una vez al cargar: ocho redes de menos de 200 personajes.
const POR_TEMPORADA = TEMPORADAS.map((t) => {
  const aristas: Arista[] = t.map(([a, b]) => [a, b]);
  const nodos = [...new Set(aristas.flat())];
  const red = crearRed(nodos, aristas);
  const g = grado(red);
  const b = intermediacion(red);
  return {
    aristas,
    nodos: new Set(nodos),
    n: nodos.length,
    l: aristas.length,
    densidad: densidad(red),
    valores: { grado: g, intermediacion: b } as Record<MedidaGot, Record<string, number>>,
    puestos: { grado: puestos(g), intermediacion: puestos(b) } as Record<
      MedidaGot,
      Record<string, number>
    >,
  };
});

const nombre = (id: string) => ETIQUETA_PERSONAJE[id] ?? id;

/** Puesto en grado de un personaje en cada temporada (null si no aparece). */
const curva = (id: string) => POR_TEMPORADA.map((t) => t.puestos.grado[id] ?? null);

const MENOS = POR_TEMPORADA.reduce((m, t, i) => (t.n < POR_TEMPORADA[m].n ? i : m), 0);
const T1 = POR_TEMPORADA[0];
const TU = POR_TEMPORADA[N_TEMPORADAS - 1];

const OPCIONES_TEMP = Array.from({ length: N_TEMPORADAS }, (_, i) => ({
  clave: String(i + 1),
  nombre: `T${i + 1}`,
}));

const NED = "NED";
const PUESTO_NED_T6 = POR_TEMPORADA[5].puestos.grado[NED];
const GRADO_NED_T6 = POR_TEMPORADA[5].valores.grado[NED];

const EXPLICACIONES_NED = [
  { clave: "error", nombre: "Es un error de los datos: a Ned lo deberían haber borrado." },
  {
    clave: "vinculo",
    nombre:
      "El vínculo no exige estar vivo: basta con que alguien hable de él, o con que aparezca en un recuerdo o una visión.",
  },
  { clave: "dirigida", nombre: "Pasa porque la red no es dirigida." },
];

export default function Acto1Poniente({ r, set, personaje }: Props) {
  const [t, setT] = useState(0);
  const [medida, setMedida] = useState<MedidaGot>("grado");
  const [tocado, setTocado] = useState<string | null>(null);

  const temp = POR_TEMPORADA[t];
  // Solo los personajes de la temporada; tamaño y color según la medida elegida.
  const nodos: NodoCanvas[] = useMemo(() => {
    const v = temp.valores[medida];
    const max = Math.max(...Object.values(v)) || 1;
    return [...temp.nodos].map((id) => ({
      id,
      etiqueta: nombre(id),
      size: tamanoNodo(v[id], max, 6, 18),
      color: colorCalor(v[id], max),
    }));
  }, [temp, medida]);
  const aristas = useMemo(
    () => temp.aristas.map(([a, b]) => ({ source: a, target: b })),
    [temp],
  );
  const top = useMemo(
    () => Object.entries(temp.valores[medida]).sort((a, b) => b[1] - a[1]).slice(0, 10),
    [temp, medida],
  );
  const marcados = useMemo(
    () => [personaje, ...top.slice(0, 5).map(([id]) => id)],
    [personaje, top],
  );

  const curvaTuyo = curva(personaje);
  const mejor = Math.min(...curvaTuyo.filter((v): v is number => v !== null));
  const piso = Math.max(...curvaTuyo.filter((v): v is number => v !== null));
  const picos = curvaTuyo.flatMap((v, i) => (v === mejor ? [i + 1] : []));
  const tope = Math.max(80, piso);

  return (
    <div>
      <CabezaActo
        numero={1}
        titulo="Poniente, temporada a temporada"
        bajada="Muchos ya vieron Juego de tronos y saben cómo termina. Aquí la vas a leer de otra manera: como ocho redes, una por temporada. La pregunta es qué historia cuentan los datos y en qué se parece, o no, a la que recuerdas."
      />

      <Definicion titulo="Un relato con datos">
        <p>
          Una red quieta dice quién es central. Una red que cambia en el tiempo cuenta una
          historia: quién entra, quién sale, quién sube, cuándo se rompe algo. Armar un{" "}
          <strong>relato a partir de datos</strong> es contar esa historia sin inventar nada que
          los datos no muestren. Un buen relato tiene cuatro piezas:
        </p>
        <ol className="mb-3 list-decimal space-y-1 pl-5">
          <li>
            <strong>Un patrón</strong>: algo que se repite, una estructura que se repite o una
            forma que tiene la red.
          </li>
          <li>
            <strong>Un quiebre</strong>: un evento que cambia el relato, como una ruptura entre
            personajes o un choque armado, y que se nota en la red.
          </li>
          <li>
            <strong>Protagonistas</strong> con nombre propio, y cifras que los ubican.
          </li>
          <li>
            <strong>Un límite</strong>: lo que el dato no puede decir, por la manera en que se
            construyó.
          </li>
        </ol>
        <p>
          Los datos de este acto: Andrew Beveridge leyó los guiones de la serie y unió a dos
          personajes cada vez que <em>interactúan</em> en una escena. Eso incluye hablar uno
          después del otro, que uno hable del otro, o que alguien hable de los dos. Es una red{" "}
          <strong>no dirigida</strong>. Las dos medidas son las del Taller 2: el{" "}
          <strong>grado</strong> (con cuántos personajes interactúa) y la{" "}
          <strong>intermediación</strong> (cuántos caminos cortos pasan por él).
        </p>
      </Definicion>

      <Ejercicio numero="1.1" titulo="Recorrer las ocho temporadas">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Elige una temporada y mira cómo se reacomoda la red: los que siguen conservan su lugar
          y los nuevos llegan desde el centro. Se nombran los cinco primeros y tu personaje,{" "}
          <strong>{nombre(personaje)}</strong>. Toca a cualquiera para saber quién es; con dos
          dedos (o con + y −) acercas la red.
        </p>
        <div className="mb-3">
          <Opciones<string>
            opciones={OPCIONES_TEMP}
            valor={String(t + 1)}
            onChange={(v) => {
              setT(Number(v) - 1);
              setTocado(null);
            }}
          />
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2 text-center">
          <Cifra valor={String(temp.n)} etiqueta="personajes" />
          <Cifra valor={String(temp.l)} etiqueta="vínculos" />
          <Cifra valor={fmt(temp.densidad, 3)} etiqueta="densidad" />
        </div>
        <p className="mb-3 text-sm leading-relaxed text-stone-500">
          Temporada {t + 1}, emitida en {ANIO_TEMPORADA[t]}. La <strong>densidad</strong> es la
          fracción de vínculos posibles que de verdad existen: 1 sería que todos interactúan con
          todos.
        </p>

        <div className="mb-3">
          <Opciones<MedidaGot> opciones={MEDIDAS_GOT} valor={medida} onChange={setMedida} />
        </div>
        <Lienzo pie={FUENTE_GOT}>
          <RedCanvas
            nodos={nodos}
            aristas={aristas}
            marcados={marcados}
            seleccionado={tocado && temp.nodos.has(tocado) ? tocado : null}
            onToque={setTocado}
            detalle={(id) => `puesto ${temp.puestos[medida][id]}`}
            distancia={45}
            carga={-90}
            leyenda={
              <LeyendaCalor
                que={`${medida === "grado" ? "grado" : "intermediación"}: poco → mucho`}
                nota="borde naranja = nombrados"
              />
            }
            titulo={`Red de la temporada ${t + 1} de Juego de tronos, tamaño según ${medida}`}
          />
        </Lienzo>

        {tocado && temp.nodos.has(tocado) && (
          <div className="mb-3 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-stone-700">
            <p className="text-[15px] font-semibold text-stone-900">{nombre(tocado)}</p>
            <p className="mt-1">
              En la T{t + 1}: grado {temp.valores.grado[tocado]} (puesto{" "}
              {temp.puestos.grado[tocado]}) · intermediación {fmt(temp.valores.intermediacion[tocado])}{" "}
              (puesto {temp.puestos.intermediacion[tocado]}).
            </p>
          </div>
        )}

        <p className="mb-1 text-sm font-semibold text-stone-800">
          Los 10 primeros de la T{t + 1} en {medida === "grado" ? "grado" : "intermediación"}
        </p>
        <ol className="mb-5 text-sm">
          {top.map(([id, v], i) => (
            <li key={id} className="flex items-center gap-2 border-b border-stone-200 py-1">
              <span className="w-5 text-right tabular-nums text-stone-400">{i + 1}</span>
              <button
                onClick={() => setTocado(id)}
                className={`flex-1 text-left underline decoration-stone-300 underline-offset-2 ${
                  id === personaje ? "font-semibold text-brand-700" : "text-stone-800"
                }`}
              >
                {nombre(id)}
              </button>
              <span className="tabular-nums text-stone-600">{medida === "grado" ? v : fmt(v)}</span>
            </li>
          ))}
        </ol>

        <p className="mb-2 text-[15px] font-medium text-stone-800">
          ¿En qué temporada aparecen menos personajes?
        </p>
        <Opciones<string>
          opciones={OPCIONES_TEMP}
          valor={r.a1_menos}
          onChange={(v) => set("a1_menos", v)}
        />
        {r.a1_menos && (
          <Veredicto bien={r.a1_menos === String(MENOS + 1)}>
            {r.a1_menos === String(MENOS + 1)
              ? `Sí: la T${MENOS + 1}, con ${POR_TEMPORADA[MENOS].n} personajes. Ahora mira los vínculos: tiene casi los mismos que la T1 con muchos menos personajes.`
              : `La T${r.a1_menos} tiene ${POR_TEMPORADA[Number(r.a1_menos) - 1].n}. Recorre las ocho y compara.`}
          </Veredicto>
        )}
        <div className="mt-4">
          <Texto
            label={`Compara la T1 (${T1.n} personajes, ${T1.l} vínculos, densidad ${fmt(T1.densidad, 3)}) con la T8 (${TU.n} personajes, ${TU.l} vínculos, densidad ${fmt(TU.densidad, 3)}). ¿Qué le pasa a la red al final de la serie? ¿Qué historia cuenta esa forma?`}
            ayuda="Tres o cuatro frases. Fíjate también en cómo se ve el dibujo de la T8 frente al de la T1."
            valor={r.a1_final}
            onChange={(v) => set("a1_final", v)}
            filas={5}
            placeholder="Escribe aquí…"
          />
        </div>
      </Ejercicio>

      <Ejercicio numero="1.2" titulo={`La curva de ${nombre(personaje)}`}>
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          A tu pareja le tocó seguir a <strong>{nombre(personaje)}</strong>. La curva muestra su
          puesto en <strong>grado</strong> en cada temporada (1 = el personaje con más
          interacciones). En gris, {nombre(REFERENCIA_GOT)}, la referencia que todos comparan.
          Toca una temporada para verla también en la red de arriba.
        </p>
        <Lienzo pie="Puesto en grado por temporada. Si la línea se corta, el personaje no aparece en esa temporada.">
          <Trayectoria
            series={[
              { etiqueta: nombre(personaje), valores: curvaTuyo, principal: true },
              { etiqueta: nombre(REFERENCIA_GOT), valores: curva(REFERENCIA_GOT), principal: false },
            ]}
            elegida={t}
            onElegir={setT}
            tope={tope}
            titulo={`Puesto de ${nombre(personaje)} y de ${nombre(REFERENCIA_GOT)} en cada temporada`}
          />
        </Lienzo>
        <p className="mb-4 text-sm text-stone-600">
          T{t + 1}: {nombre(personaje)}{" "}
          {curvaTuyo[t] === null ? "no aparece" : `puesto ${curvaTuyo[t]}, grado ${temp.valores.grado[personaje]}`}{" "}
          · {nombre(REFERENCIA_GOT)} puesto {temp.puestos.grado[REFERENCIA_GOT]}.
        </p>

        <p className="mb-2 text-[15px] font-medium text-stone-800">
          ¿En qué temporada llega {nombre(personaje)} a su mejor puesto?
        </p>
        <Opciones<string>
          opciones={OPCIONES_TEMP}
          valor={r.a1_pico}
          onChange={(v) => set("a1_pico", v)}
        />
        {r.a1_pico && (
          <Veredicto bien={picos.includes(Number(r.a1_pico))}>
            {picos.includes(Number(r.a1_pico))
              ? `Sí: puesto ${mejor}${picos.length > 1 ? ` (lo alcanza en ${picos.map((p) => `T${p}`).join(" y ")})` : ""}.`
              : `En la T${r.a1_pico} está en el puesto ${curvaTuyo[Number(r.a1_pico) - 1] ?? "— (no aparece)"}. Busca el punto más alto de la curva.`}
          </Veredicto>
        )}
        <div className="mt-4">
          <Texto
            label={`Cuenta la curva de ${nombre(personaje)} en datos: ¿cuándo sube, cuándo cae, cuándo se queda quieta? ¿Coincide con lo que recuerdas de la serie, o la red cuenta otra cosa?`}
            ayuda="Usa al menos dos puestos con su temporada. Si no viste la serie, di qué hipótesis te sugiere la curva: también vale."
            valor={r.a1_trayectoria}
            onChange={(v) => set("a1_trayectoria", v)}
            filas={6}
            placeholder="Escribe aquí…"
          />
        </div>
      </Ejercicio>

      <Ejercicio numero="1.3" titulo="Los muertos que siguen hablando">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Ned Stark muere al final de la primera temporada. Sin embargo, en la T6 tiene grado{" "}
          {GRADO_NED_T6} y queda en el <strong>puesto {PUESTO_NED_T6}</strong>: más conectado que
          casi todos los vivos.
        </p>
        <Lienzo pie="Puesto en grado de Ned Stark por temporada.">
          <Trayectoria
            series={[
              { etiqueta: "Ned", valores: curva(NED), principal: true },
              { etiqueta: nombre(REFERENCIA_GOT), valores: curva(REFERENCIA_GOT), principal: false },
            ]}
            elegida={5}
            onElegir={setT}
            titulo="Puesto de Ned Stark en cada temporada"
          />
        </Lienzo>
        <p className="mb-2 text-[15px] font-medium text-stone-800">¿Cómo se explica?</p>
        <Opciones<string>
          opciones={EXPLICACIONES_NED}
          valor={r.a1_ned}
          onChange={(v) => set("a1_ned", v)}
          columnas
        />
        <Revelable habilitado={Boolean(r.a1_ned)} etiqueta="Ver la explicación">
          <p className="text-sm leading-relaxed text-stone-700">
            {r.a1_ned === "vinculo" ? "Exacto. " : "No es eso. "}
            Repasa la definición: dos personajes quedan unidos si uno habla del otro, o si alguien
            habla de los dos. En la T6 se habla mucho de Ned (es el pasado que todos invocan) y
            además aparece en las visiones de Bran. Para estos datos, ser recordado cuenta igual que
            estar presente.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Esto es el <strong>límite</strong> del que hablaba la definición. El dato no está mal:
            mide otra cosa de la que uno cree. Antes de contar una historia con una red, hay que
            saber cómo se construyó el vínculo. Con las escrituras de Cali va a pasar lo mismo.
          </p>
        </Revelable>
      </Ejercicio>

      <Ejercicio numero="1.4" titulo="Tu relato de Poniente">
        <Texto
          label={`Escribe el relato de ${nombre(personaje)} contado por la red, o el de la serie entera si te parece más interesante. Tiene que tener las cuatro piezas: un patrón, un quiebre, cifras que ubiquen a los protagonistas y un límite de los datos.`}
          ayuda="Entre 150 y 250 palabras. No resumas la trama: cuenta lo que muestran los números, aunque contradiga lo que recuerdas. Sí puedes usar la trama para explicar un cambio que viste en la red."
          valor={r.a1_relato}
          onChange={(v) => set("a1_relato", v)}
          filas={10}
          minPalabras={150}
          maxPalabras={250}
          placeholder="Escribe aquí…"
        />
      </Ejercicio>
    </div>
  );
}
