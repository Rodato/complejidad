"use client";

import { useMemo, useState } from "react";
import {
  ANIOS,
  CANDIDATOS_ROL,
  ETIQUETA_ACTOR,
  FUENTE_NOTARIA,
  MUNICIPIO,
  NEGOCIOS,
  SEBASTIAN,
} from "@/lib/contenido";
import {
  ANIO_MAS,
  ESCRITURAS_POR_ANIO,
  PCT_GIGANTE,
  PCT_GIGANTE_T8,
  TOTAL,
  flechasDe,
  periodo,
  porAnio,
  top,
  type Modo,
} from "@/lib/notaria";
import { fmt, miles } from "@/lib/red";
import type { Respuestas } from "@/lib/tipos";
import RedCanvas, { LeyendaCalor, colorCalor, tamanoNodo, type NodoCanvas } from "./RedCanvas";
import {
  CabezaActo,
  Campo,
  Cifra,
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
  actor: string;
};

const nombre = (id: string) => ETIQUETA_ACTOR[id] ?? id;

const OPCIONES_ANIO = ANIOS.map((y) => ({ clave: String(y), nombre: String(y) }));
const MODOS: { clave: Modo; nombre: string }[] = [
  { clave: "acumulado", nombre: "Acumulado desde 1938" },
  { clave: "anio", nombre: "Solo ese año" },
];

// Filtro estructural del Taller 5 y del parcial: por tamaño de componente, no por grado,
// para que los grupos se vean completos y ningún actor quede visible pero suelto.
type Filtro = "conectados" | "todos" | "nucleos";
const FILTROS: { clave: Filtro; nombre: string; desc: string; min: number }[] = [
  {
    clave: "conectados",
    nombre: "Conectados",
    desc: "Grupos de 3 o más actores. Se ocultan las parejas que firmaron una sola escritura entre ellas.",
    min: 3,
  },
  {
    clave: "todos",
    nombre: "Toda la red",
    desc: "Todos los actores, incluidas las parejas sueltas.",
    min: 1,
  },
  {
    clave: "nucleos",
    nombre: "Núcleos",
    desc: "Solo grupos de 4 o más actores conectados entre sí: los racimos más densos.",
    min: 4,
  },
];

const ACUMULA = top(TOTAL.entrada, 1)[0][0];
const REPARTE = top(TOTAL.salida, 1)[0][0];
const COMPRAS_SEB = porAnio(SEBASTIAN).filter((x) => x.compras > 0);

const MAX_ESCRITURAS = Math.max(...ESCRITURAS_POR_ANIO);

const OPCIONES_ARCHIVO = [
  { clave: "exploto", nombre: `En ${ANIO_MAS} el mercado de tierras de Cali explotó.` },
  {
    clave: "mejor_conocido",
    nombre: `${ANIO_MAS} es el año que mejor conocemos, pero el número de escrituras no se puede comparar entre años.`,
  },
  { clave: "no_sirven", nombre: "Con datos tan desparejos no se puede afirmar nada." },
];

const leerPct = (s: string) => Number(s.replace("%", "").replace(",", ".").trim());

export default function Acto3Cali({ r, set, actor }: Props) {
  const [anio, setAnio] = useState(1938);
  const [modo, setModo] = useState<Modo>("acumulado");
  const [filtro, setFiltro] = useState<Filtro>("conectados");
  const [tocado, setTocado] = useState<string | null>(null);

  const p = periodo(anio, modo);
  const filtroActivo = FILTROS.find((f) => f.clave === filtro)!;
  // Lo que se dibuja: tamaño y color por compras (rampa del Taller 5).
  const { nodos, aristas, visibles } = useMemo(() => {
    const min = FILTROS.find((f) => f.clave === filtro)!.min;
    const vis = new Set([...p.actores].filter((id) => (p.tamComp.get(id) ?? 1) >= min));
    const max = Math.max(1, ...Object.values(p.entrada));
    const nodos: NodoCanvas[] = [...vis].map((id) => {
      const c = p.entrada[id] ?? 0;
      return { id, etiqueta: nombre(id), size: tamanoNodo(c, max, 7, 26), color: colorCalor(c, max) };
    });
    const aristas = p.flechas
      .filter(([a, b]) => vis.has(a) && vis.has(b))
      .map(([a, b]) => ({ source: a, target: b }));
    return { nodos, aristas, visibles: vis };
  }, [p, filtro]);
  const compradores = top(p.entrada, 5);
  const vendedores = top(p.salida, 5);
  const marcados = useMemo(
    () => [actor, ...compradores.slice(0, 3).map(([id]) => id), ...vendedores.slice(0, 1).map(([id]) => id)],
    [actor, compradores, vendedores],
  );

  const tuyo = porAnio(actor);
  const tusFlechas = flechasDe(actor);
  const comprasTuyas = tusFlechas.filter((f) => f[1] === actor).length;
  const ventasTuyas = tusFlechas.length - comprasTuyas;

  const pct = leerPct(r.a3_gigante);
  const pctBien = r.a3_gigante.trim() !== "" && Math.abs(pct - PCT_GIGANTE) < 0.6;

  return (
    <div>
      <CabezaActo
        numero={3}
        titulo="Cali, año por año"
        bajada={`Las seis escrituras eran un pedazo. La red completa de la Notaría Segunda entre 1938 y 1944 tiene ${miles(TOTAL.actores.size)} actores y ${miles(TOTAL.escrituras)} escrituras. Vas a recorrerla como recorriste Poniente: en el tiempo, buscando patrones, quiebres y protagonistas.`}
      />

      <Definicion titulo="Cómo leer esta red">
        <p>
          Cada punto es un actor: una persona, una familia, una empresa, un banco o el Municipio.
          Cada flecha es una escritura en la que la tierra pasa de una parte a otra, de quien
          vende a quien compra: la flecha sigue a la tierra, no al dinero.
        </p>
        <p>
          El <strong>tamaño y el color</strong> de cada punto son sus compras, su{" "}
          <strong>grado de entrada</strong>. Un punto grande y rojo acumuló tierra; uno azul
          claro compró poco o solo vendió. Toca a cualquiera para ver quién es.
        </p>
      </Definicion>

      <Ejercicio numero="3.1" titulo="Recorrer los siete años">
        <div className="mb-2">
          <Opciones<string>
            opciones={OPCIONES_ANIO}
            valor={String(anio)}
            onChange={(v) => {
              setAnio(Number(v));
              setTocado(null);
            }}
          />
        </div>
        <div className="mb-3">
          <Opciones<Modo> opciones={MODOS} valor={modo} onChange={setModo} />
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2 text-center">
          <Cifra valor={miles(p.escrituras)} etiqueta="escrituras" />
          <Cifra valor={miles(p.actores.size)} etiqueta="actores" />
          <Cifra
            valor={`${fmt((100 * p.gigante) / Math.max(p.actores.size, 1), 1)} %`}
            etiqueta="en el grupo más grande"
          />
        </div>
        <p className="mb-3 text-sm leading-relaxed text-stone-500">
          {modo === "anio" ? `Solo ${anio}.` : `De 1938 a ${anio}.`} «En el grupo más grande» es
          el porcentaje de actores que están en el componente más grande: los que se pueden
          alcanzar unos a otros siguiendo flechas, sin importar su sentido.
        </p>

        <div className="mb-2">
          <Opciones<Filtro>
            opciones={FILTROS.map((f) => ({ clave: f.clave, nombre: f.nombre }))}
            valor={filtro}
            onChange={setFiltro}
          />
        </div>
        <p className="mb-3 text-sm leading-relaxed text-stone-500">
          <span className="font-medium text-stone-600">{filtroActivo.nombre}:</span>{" "}
          {filtroActivo.desc} Se ven {miles(visibles.size)} de {miles(p.actores.size)} actores.
        </p>

        <Lienzo pie={FUENTE_NOTARIA}>
          <RedCanvas
            nodos={nodos}
            aristas={aristas}
            dirigida
            marcados={marcados}
            seleccionado={tocado && visibles.has(tocado) ? tocado : null}
            onToque={setTocado}
            detalle={(id) => `${p.entrada[id] ?? 0} compras · ${p.salida[id] ?? 0} ventas`}
            alto={460}
            leyenda={
              <LeyendaCalor
                que="compras: pocas → muchas"
                nota="la flecha va del vendedor al comprador"
              />
            }
            titulo={`Red de compraventas de la Notaría Segunda, ${modo === "anio" ? anio : `1938 a ${anio}`}`}
          />
        </Lienzo>

        {tocado && p.actores.has(tocado) && (
          <div className="mb-3 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-stone-700">
            <p className="text-[15px] font-semibold text-stone-900">{nombre(tocado)}</p>
            <p className="mt-1">
              {modo === "anio" ? `En ${anio}` : `De 1938 a ${anio}`}: compra {p.entrada[tocado] ?? 0}{" "}
              · vende {p.salida[tocado] ?? 0}.
            </p>
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TablaTop titulo="Los que más compran (entrada)" filas={compradores} actor={actor} onToque={setTocado} />
          <TablaTop titulo="Los que más venden (salida)" filas={vendedores} actor={actor} onToque={setTocado} />
        </div>

        <p className="mb-2 text-[15px] font-medium text-stone-800">
          ¿En qué año hay más escrituras?
        </p>
        <Opciones<string>
          opciones={OPCIONES_ANIO}
          valor={r.a3_anio_mas}
          onChange={(v) => set("a3_anio_mas", v)}
        />
        {r.a3_anio_mas && (
          <Veredicto bien={r.a3_anio_mas === String(ANIO_MAS)}>
            {r.a3_anio_mas === String(ANIO_MAS)
              ? `Sí: ${ANIO_MAS}, con ${ESCRITURAS_POR_ANIO[ANIOS.indexOf(ANIO_MAS)]} de las ${TOTAL.escrituras} escrituras. Más de la mitad de toda la base cae en un solo año.`
              : `${r.a3_anio_mas} tiene ${ESCRITURAS_POR_ANIO[ANIOS.indexOf(Number(r.a3_anio_mas))]}. Recorre los siete años en «Solo ese año».`}
          </Veredicto>
        )}
      </Ejercicio>

      <Ejercicio numero="3.2" titulo="¿Creció Cali o creció el archivo?">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Antes de contar una historia con números hay que mirar cuántos datos hay detrás de
          cada año. Estas son las escrituras por año en la base del curso:
        </p>
        <figure className="mb-4" aria-label="Escrituras por año en la base del curso">
          <ul className="space-y-1.5">
            {ANIOS.map((y, i) => {
              const v = ESCRITURAS_POR_ANIO[i];
              return (
                <li key={y} className="flex items-center gap-2 text-sm">
                  <span className="w-9 shrink-0 tabular-nums text-stone-500">{y}</span>
                  <span className="flex-1">
                    <span
                      className={`block h-4 rounded-r ${y === ANIO_MAS ? "bg-brand-600" : "bg-stone-400"}`}
                      style={{ width: `${(100 * v) / MAX_ESCRITURAS}%`, minWidth: 3 }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right font-medium tabular-nums text-stone-800">
                    {v}
                  </span>
                </li>
              );
            })}
          </ul>
        </figure>

        <div className="mb-4 rounded-lg border border-stone-300 bg-stone-50 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Ficha técnica de la base
          </p>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-stone-700">
            <li>
              <strong>1938 a 1941:</strong> una transcripción antigua y parcial de los protocolos
              de la Notaría Segunda.
            </li>
            <li>
              <strong>1942 y 1944:</strong> dos tablas transcritas aparte.
            </li>
            <li>
              <strong>{ANIO_MAS}:</strong> se volvió a transcribir completo. En la versión
              anterior de esta misma base, {ANIO_MAS} tenía 66 escrituras.
            </li>
            <li>Todo viene de una sola notaría; Cali tenía otras.</li>
          </ul>
        </div>

        <p className="mb-2 text-[15px] font-medium text-stone-800">
          Con la gráfica y la ficha, ¿qué se puede afirmar?
        </p>
        <Opciones<string>
          opciones={OPCIONES_ARCHIVO}
          valor={r.a3_archivo_op}
          onChange={(v) => set("a3_archivo_op", v)}
          columnas
        />
        {r.a3_archivo_op && (
          <Veredicto bien={r.a3_archivo_op === "mejor_conocido"}>
            {r.a3_archivo_op === "mejor_conocido"
              ? `Eso. El salto a ${ESCRITURAS_POR_ANIO[ANIOS.indexOf(ANIO_MAS)]} lo produjo la transcripción: con la base vieja, ${ANIO_MAS} tenía 66, como los demás años. Por eso no se puede llamar «crecimiento» a la diferencia entre años. Pero los datos sí sirven: ${ANIO_MAS} es el año que mejor conocemos.`
              : r.a3_archivo_op === "exploto"
                ? `Mira la ficha: en la versión anterior de la base, ${ANIO_MAS} tenía 66 escrituras. ¿Qué cambió, el mercado o la transcripción?`
                : "Los datos no se vuelven inútiles por tener un límite. La pregunta es qué se puede afirmar con ellos y qué no."}
          </Veredicto>
        )}

        <div className="mt-4">
          <Texto
            label="Si no se puede comparar cuántas escrituras hay cada año, ¿qué sí se puede comparar entre años? Da un ejemplo de una afirmación sobre la Cali de 1938 a 1944 que estos datos permiten hacer, y otra que no."
            ayuda="Tres o cuatro frases. Piensa en quién compra y quién vende, más que en cuánto."
            valor={r.a3_archivo}
            onChange={(v) => set("a3_archivo", v)}
            filas={5}
            placeholder="Escribe aquí…"
          />
        </div>
      </Ejercicio>

      <Ejercicio numero="3.3" titulo="Un bazar, no una red">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Elige «Acumulado desde 1938», el año 1944 y «Toda la red»: es la red completa, con
          las parejas sueltas incluidas.
        </p>
        <Campo
          label="¿Qué porcentaje de los actores está en el grupo más grande?"
          valor={r.a3_gigante}
          onChange={(v) => set("a3_gigante", v)}
          placeholder="Por ejemplo: 12,5"
          numerico
        />
        {r.a3_gigante.trim() !== "" && (
          <Veredicto bien={pctBien}>
            {pctBien
              ? `Eso: ${fmt(PCT_GIGANTE, 1)} %. En la T8 de Poniente, el grupo más grande tenía al ${fmt(PCT_GIGANTE_T8, 0)} % de los personajes.`
              : "Revisa que estés en «Acumulado desde 1938» con el año 1944, y lee la tercera cifra."}
          </Veredicto>
        )}
        <div className="mt-4">
          <Texto
            label="Casi todos los actores de Cali están en grupos pequeños y sueltos: parejas que firman una sola escritura y no vuelven a aparecer. ¿Por qué crees que la red está tan partida? Da una explicación sobre la Cali de esos años y otra sobre los datos."
            ayuda="Tres o cuatro frases. Pista para la segunda: ¿cuántas notarías había en Cali? ¿Cuántos años cubre la base?"
            valor={r.a3_bazar}
            onChange={(v) => set("a3_bazar", v)}
            filas={5}
            placeholder="Escribe aquí…"
          />
        </div>
      </Ejercicio>

      <Ejercicio numero="3.4" titulo="Quién acumula, quién reparte">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Sigue en la red completa (acumulado hasta 1944) y mira las dos tablas.
        </p>
        <p className="mb-2 text-[15px] font-medium text-stone-800">¿Quién acumula más tierra?</p>
        <Opciones<string>
          opciones={CANDIDATOS_ROL.map((id) => ({ clave: id, nombre: nombre(id) }))}
          valor={r.a3_acumula}
          onChange={(v) => set("a3_acumula", v)}
          columnas
        />
        {r.a3_acumula && (
          <Veredicto bien={r.a3_acumula === ACUMULA}>
            {nombre(r.a3_acumula)}: {TOTAL.entrada[r.a3_acumula] ?? 0} compras y{" "}
            {TOTAL.salida[r.a3_acumula] ?? 0} ventas.{" "}
            {r.a3_acumula === ACUMULA
              ? `Es el de mayor grado de entrada. Y compra en varios años: ${COMPRAS_SEB.map((x) => `${x.anio} (${x.compras})`).join(", ")}. No depende del salto de ${ANIO_MAS}.`
              : "Acumular es comprar: busca el mayor grado de entrada."}
          </Veredicto>
        )}

        <p className="mb-2 mt-5 text-[15px] font-medium text-stone-800">¿Quién reparte más tierra?</p>
        <Opciones<string>
          opciones={CANDIDATOS_ROL.map((id) => ({ clave: id, nombre: nombre(id) }))}
          valor={r.a3_reparte}
          onChange={(v) => set("a3_reparte", v)}
          columnas
        />
        {r.a3_reparte && (
          <Veredicto bien={r.a3_reparte === REPARTE}>
            {nombre(r.a3_reparte)}: {TOTAL.salida[r.a3_reparte] ?? 0} ventas y{" "}
            {TOTAL.entrada[r.a3_reparte] ?? 0} compras.{" "}
            {r.a3_reparte === REPARTE
              ? `El Municipio es el gran distribuidor de suelo de la ciudad: vende ${TOTAL.salida[MUNICIPIO]} veces y casi no compra.`
              : "Repartir es vender: busca el mayor grado de salida."}
          </Veredicto>
        )}
      </Ejercicio>

      <Ejercicio numero="3.5" titulo={`Las escrituras de ${nombre(actor)}`}>
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          A tu pareja le tocó <strong>{nombre(actor)}</strong>: {comprasTuyas} compra
          {comprasTuyas === 1 ? "" : "s"} y {ventasTuyas} venta{ventasTuyas === 1 ? "" : "s"} entre
          1938 y 1944. Así se reparten en el tiempo:
        </p>
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-stone-300 text-xs uppercase tracking-wide text-stone-500">
                <th className="py-1 text-left font-semibold">Año</th>
                <th className="py-1 text-right font-semibold">Compras</th>
                <th className="py-1 text-right font-semibold">Ventas</th>
              </tr>
            </thead>
            <tbody>
              {tuyo.map((x) => (
                <tr key={x.anio} className="border-b border-stone-200">
                  <td className="py-1 text-stone-700">{x.anio}</td>
                  <td className="py-1 text-right text-stone-900">{x.compras || "·"}</td>
                  <td className="py-1 text-right text-stone-900">{x.ventas || "·"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details className="mb-4 rounded-lg border border-stone-200 bg-white">
          <summary className="cursor-pointer px-3 py-2.5 text-[15px] font-medium text-stone-800">
            Leer sus {tusFlechas.length} escrituras
          </summary>
          <ol className="max-h-96 space-y-2.5 overflow-y-auto border-t border-stone-100 px-3 py-3 text-sm">
            {tusFlechas.map(([de, a, y, reg], i) => (
              <li key={`${reg}-${i}`}>
                <p className="font-semibold text-stone-800">
                  {y} · {de === actor ? `vende a ${nombre(a)}` : `compra a ${nombre(de)}`}
                </p>
                {NEGOCIOS[String(reg)] && (
                  <p className="mt-0.5 leading-relaxed text-stone-600">«{NEGOCIOS[String(reg)]}»</p>
                )}
              </li>
            ))}
          </ol>
        </details>

        <Texto
          label={`¿Qué papel juega ${nombre(actor)} en la red? ¿Acumula, reparte, liquida un patrimonio, financia? ¿Cuándo actúa? ¿Qué dicen sus escrituras que los números no dicen?`}
          ayuda="Cuatro o cinco frases. Usa al menos una cifra de la tabla y una escritura concreta."
          valor={r.a3_actor_lectura}
          onChange={(v) => set("a3_actor_lectura", v)}
          filas={6}
          placeholder="Escribe aquí…"
        />
      </Ejercicio>
    </div>
  );
}

function TablaTop({
  titulo,
  filas,
  actor,
  onToque,
}: {
  titulo: string;
  filas: [string, number][];
  actor: string;
  onToque: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-stone-800">{titulo}</p>
      <ol className="text-sm">
        {filas.map(([id, v], i) => (
          <li key={id} className="flex items-center gap-2 border-b border-stone-200 py-1">
            <span className="w-4 text-right tabular-nums text-stone-400">{i + 1}</span>
            <button
              onClick={() => onToque(id)}
              className={`min-w-0 flex-1 truncate text-left underline decoration-stone-300 underline-offset-2 ${
                id === actor ? "font-semibold text-brand-700" : "text-stone-800"
              }`}
            >
              {nombre(id)}
            </button>
            <span className="tabular-nums text-stone-600">{v}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
