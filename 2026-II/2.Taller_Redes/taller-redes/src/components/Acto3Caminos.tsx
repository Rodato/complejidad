"use client";

import { useMemo, useState } from "react";
import { ARISTAS_MEDICI, FAMILIAS } from "@/lib/contenido";
import { agrupamiento, componentes, crearRed, distanciasDesde, fmt, triangulos } from "@/lib/red";
import type { Respuestas } from "@/lib/tipos";
import { NODOS_FAMILIAS } from "./Acto1Red";
import Red from "./Red";
import {
  CabezaActo,
  Campo,
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
  familia: string;
};

const ORIGEN = "Pazzi";
const DESTINO = "Lamberteschi";
const IDS = FAMILIAS.map((f) => f.id);
const RED = crearRed(IDS, ARISTAS_MEDICI);
const sinFamiliaQuitada = (q: string) => componentes(crearRed(IDS, ARISTAS_MEDICI, [q]));
const SIN_MEDICI = sinFamiliaQuitada("Medici");
const SIN_STROZZI = sinFamiliaQuitada("Strozzi");
const CC = agrupamiento(RED);
const DIST_MINIMA = distanciasDesde(RED, ORIGEN).get(DESTINO)!;

export default function Acto3Caminos({ r, set, familia }: Props) {
  const [quitada, setQuitada] = useState<string>("");
  const [tocada, setTocada] = useState<string | null>(null);

  const distMinima = DIST_MINIMA;
  const camino = r.a3_camino.length ? r.a3_camino : [ORIGEN];
  const ultimo = camino[camino.length - 1];
  const llego = ultimo === DESTINO;
  const pasos = camino.length - 1;

  const sinMedici = SIN_MEDICI;
  const sinStrozzi = SIN_STROZZI;
  const sinFamilia = useMemo(() => sinFamiliaQuitada(familia), [familia]);
  const cc = CC;
  const tMedici = triangulos(RED, "Medici");
  const tStrozzi = triangulos(RED, "Strozzi");
  const tFamilia = triangulos(RED, familia);

  function tocarCamino(id: string) {
    if (id === ultimo && camino.length > 1) {
      set("a3_camino", camino.slice(0, -1)); // tocar el último lo deshace
      return;
    }
    if (llego || camino.includes(id)) return;
    if (!RED.vecinos.get(ultimo)!.has(id)) return; // solo se avanza por un vínculo
    set("a3_camino", [...camino, id]);
  }

  return (
    <div>
      <CabezaActo
        numero={3}
        titulo="Caminos, puentes y huecos"
        bajada="El grado solo mira a los vecinos inmediatos. Pero en una red las cosas viajan: la información, los favores, la tierra. Para entender el poder de los Medici hay que mirar por dónde se puede ir de una familia a otra."
      />

      <Definicion titulo="Camino y distancia">
        <p>
          Un <strong>camino</strong> es una secuencia de nodos en la que cada uno está unido al
          siguiente. La <strong>distancia</strong> entre dos nodos es el número de vínculos del
          camino más corto que los une. Si los Pazzi están casados con los Salviati y los
          Salviati con los Medici, entre Pazzi y Medici hay distancia 2.
        </p>
      </Definicion>

      <Ejercicio numero="3.1" titulo="De los Pazzi a los Lamberteschi">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Arma el camino más corto tocando familias, una por una, desde los{" "}
          <strong>Pazzi</strong> hasta los <strong>Lamberteschi</strong>. Solo puedes avanzar a
          una familia casada con la última que elegiste (se ven resaltadas). Para deshacer, toca
          la última.
        </p>
        <Lienzo
          pie={
            <>
              <span className="font-semibold text-stone-700">
                {camino.join(" → ")}
              </span>{" "}
              · {pasos} paso{pasos === 1 ? "" : "s"}
            </>
          }
        >
          <Red
            nodos={NODOS_FAMILIAS}
            aristas={ARISTAS_MEDICI}
            camino={camino}
            seleccionado={llego ? null : ultimo}
            marcados={[DESTINO]}
            onToque={tocarCamino}
            titulo="Arma un camino de los Pazzi a los Lamberteschi"
          />
        </Lienzo>
        {llego && (
          <Veredicto bien={pasos === distMinima}>
            {pasos === distMinima
              ? `Llegaste en ${pasos} pasos, y no hay un camino más corto: la distancia entre Pazzi y Lamberteschi es ${distMinima}.`
              : `Llegaste en ${pasos} pasos, pero hay un camino más corto. Deshaz y busca otro.`}
          </Veredicto>
        )}
        {camino.length > 1 && (
          <button
            onClick={() => set("a3_camino", [])}
            className="btn btn-ghost mt-2 w-full text-sm"
          >
            Empezar el camino de nuevo
          </button>
        )}
        <div className="mt-4">
          <Campo
            label="¿Cuántos caminos más cortos distintos hay entre Pazzi y Lamberteschi?"
            valor={r.a3_n_caminos}
            onChange={(v) => set("a3_n_caminos", v)}
            numerico
          />
        </div>
        <Revelable
          habilitado={llego && r.a3_n_caminos.trim() !== ""}
          etiqueta="Ver la respuesta"
        >
          <p className="text-sm leading-relaxed text-stone-600">
            Hay <strong>dos</strong>, los dos de {distMinima} pasos: Pazzi → Salviati → Medici →{" "}
            <em>Albizzi</em> → Guadagni → Lamberteschi, y el mismo pero pasando por los{" "}
            <em>Tornabuoni</em>. Fíjate en que los dos pasan por los Medici. Eso es justo lo que
            mide la intermediación, que viene en el Acto 4.
          </p>
        </Revelable>
      </Ejercicio>

      <Definicion titulo="Componentes">
        <p>
          Un <strong>componente</strong> es un grupo de nodos que se pueden alcanzar entre sí por
          algún camino. La red de Florencia es hoy un solo componente: de cualquier familia se
          puede llegar a cualquier otra. La pregunta es qué pasa si una familia desaparece
          (por un destierro, una quiebra o una muerte sin herederos).
        </p>
      </Definicion>

      <Ejercicio numero="3.2" titulo="Quitar una familia">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Quita una familia de la red y cuenta en cuántos pedazos (componentes) queda. Una
          familia que queda sola cuenta como un componente.
        </p>
        <div className="mb-3">
          <Opciones<string>
            opciones={[
              { clave: "", nombre: "Ninguna" },
              { clave: "Medici", nombre: "Medici" },
              { clave: "Strozzi", nombre: "Strozzi" },
              { clave: familia, nombre: familia },
            ]}
            valor={quitada}
            onChange={setQuitada}
          />
        </div>
        <Lienzo
          pie={quitada ? `Red sin los ${quitada}.` : "La red completa: un solo componente."}
        >
          <Red
            nodos={NODOS_FAMILIAS}
            aristas={ARISTAS_MEDICI}
            ocultos={quitada ? [quitada] : []}
            titulo={quitada ? `Red sin los ${quitada}` : "Red completa"}
          />
        </Lienzo>
        <div className="grid grid-cols-3 gap-3">
          <Campo
            label="Componentes sin Medici"
            valor={r.a3_comp_sin_medici}
            onChange={(v) => set("a3_comp_sin_medici", v)}
            numerico
          />
          <Campo
            label="Componentes sin Strozzi"
            valor={r.a3_comp_sin_strozzi}
            onChange={(v) => set("a3_comp_sin_strozzi", v)}
            numerico
          />
          <Campo
            label={`Componentes sin ${familia}`}
            valor={r.a3_comp_sin_familia}
            onChange={(v) => set("a3_comp_sin_familia", v)}
            numerico
          />
        </div>
        <Revelable
          habilitado={[r.a3_comp_sin_medici, r.a3_comp_sin_strozzi, r.a3_comp_sin_familia].every(
            (v) => v.trim(),
          )}
          etiqueta="Ver las respuestas"
        >
          <ul className="space-y-2 text-sm leading-relaxed text-stone-600">
            {[
              ["Medici", sinMedici],
              ["Strozzi", sinStrozzi],
              [familia, sinFamilia],
            ].map(([f, comps]) => (
              <li key={f as string}>
                <strong className="text-stone-800">
                  Sin {f as string}: {(comps as string[][]).length} componente
                  {(comps as string[][]).length === 1 ? "" : "s"}.
                </strong>{" "}
                {(comps as string[][]).length > 1 &&
                  `Quedan sueltos: ${(comps as string[][])
                    .slice(1)
                    .map((c) => c.join(" y "))
                    .join("; ")}.`}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Sin los Medici, los Acciaiuoli y la pareja Pazzi–Salviati quedan desconectados del
            resto de la élite. Sin los Strozzi no pasa nada: todas sus familias aliadas siguen
            unidas por otros caminos. Un nodo cuya salida parte la red se llama{" "}
            <strong>punto de corte</strong>, y es la forma más pura de ser un puente.
          </p>
        </Revelable>
      </Ejercicio>

      <Definicion titulo="Triángulos y agrupamiento">
        <p>
          Si A está casado con B y con C, ¿están B y C casados entre sí? Cuando sí, se forma un{" "}
          <strong>triángulo</strong>. El <strong>coeficiente de agrupamiento</strong> de un nodo
          es la fracción de sus pares de vecinos que están unidos entre sí: 1 si todos sus
          aliados se conocen, 0 si ninguno. Un nodo con agrupamiento bajo conecta a gente que no
          se habla entre sí: es el único canal entre ellos.
        </p>
      </Definicion>

      <Ejercicio numero="3.3" titulo="¿Los aliados se conocen entre sí?">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Toca a los Medici: se resaltan sus seis aliados. Cuenta cuántos matrimonios hay{" "}
          <em>entre esos aliados</em> (sin contar los que van a los Medici). Haz lo mismo con los
          Strozzi.
        </p>
        <Lienzo pie={tocada ? `Aliados de los ${tocada}.` : "Toca una familia."}>
          <Red
            nodos={NODOS_FAMILIAS}
            aristas={ARISTAS_MEDICI}
            seleccionado={tocada}
            onToque={(id) => setTocada((t) => (t === id ? null : id))}
            titulo="Red de matrimonios: toca una familia para ver a sus aliados"
          />
        </Lienzo>
        <div className="grid grid-cols-2 gap-3">
          <Campo
            label="Matrimonios entre los aliados de los Medici"
            valor={r.a3_vinculos_medici}
            onChange={(v) => set("a3_vinculos_medici", v)}
            numerico
          />
          <Campo
            label="Matrimonios entre los aliados de los Strozzi"
            valor={r.a3_vinculos_strozzi}
            onChange={(v) => set("a3_vinculos_strozzi", v)}
            numerico
          />
        </div>
        <Revelable
          habilitado={Boolean(r.a3_vinculos_medici.trim() && r.a3_vinculos_strozzi.trim())}
          etiqueta="Ver las respuestas"
        >
          <ul className="space-y-2 text-sm leading-relaxed text-stone-600">
            <li>
              <strong className="text-stone-800">Medici:</strong> {tMedici.entreVecinos}{" "}
              matrimonio entre sus aliados (Ridolfi–Tornabuoni), de {tMedici.posibles} posibles.
              Agrupamiento = {tMedici.entreVecinos}/{tMedici.posibles} ={" "}
              {fmt(cc.Medici!, 2)}.
            </li>
            <li>
              <strong className="text-stone-800">Strozzi:</strong> {tStrozzi.entreVecinos}{" "}
              matrimonios entre sus aliados (Castellani–Peruzzi y Peruzzi–Bischeri), de{" "}
              {tStrozzi.posibles} posibles. Agrupamiento = {tStrozzi.entreVecinos}/
              {tStrozzi.posibles} = {fmt(cc.Strozzi!, 2)}.
            </li>
            <li>
              <strong className="text-brand-700">{familia}:</strong>{" "}
              {tFamilia.posibles === 0
                ? "tiene un solo vínculo, así que no hay pares de aliados que comparar: el agrupamiento no se puede calcular."
                : `${tFamilia.entreVecinos} de ${tFamilia.posibles} posibles. Agrupamiento = ${fmt(cc[familia]!, 2)}.`}
            </li>
          </ul>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Los aliados de los Strozzi están casados entre sí: forman un bloque. Los de los Medici,
            casi nunca. Para que un Albizzi y un Barbadori se pusieran de acuerdo, tenían que pasar
            por los Medici.
          </p>
        </Revelable>
      </Ejercicio>

      <Ejercicio numero="3.4" titulo="El poder de estar en el hueco">
        <Texto
          label="Padgett y Ansell, los investigadores que armaron estos datos, resumen así su hallazgo (lo cita Jackson): «el control político de los Medici se produjo por los huecos en la red de la élite, que solo los Medici cruzaban». Explica esa frase con tus palabras."
          ayuda="Usa dos cifras de este acto: lo que pasó al quitar a los Medici (3.2) y el agrupamiento de Medici frente al de Strozzi (3.3)."
          valor={r.a3_huecos}
          onChange={(v) => set("a3_huecos", v)}
          filas={6}
          placeholder="Escribe aquí…"
        />
      </Ejercicio>
    </div>
  );
}
