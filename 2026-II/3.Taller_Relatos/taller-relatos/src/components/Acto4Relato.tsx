"use client";

import { ANIOS, ETIQUETA_ACTOR, MUNICIPIO, PIEZAS_RELATO, SEBASTIAN } from "@/lib/contenido";
import { ANIO_MAS, ESCRITURAS_POR_ANIO, PCT_GIGANTE, TOTAL, flechasDe, porAnio } from "@/lib/notaria";
import { fmt, miles } from "@/lib/red";
import type { Respuestas } from "@/lib/tipos";
import { CabezaActo, Definicion, Ejercicio, Texto } from "./ui";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
  actor: string;
};

const nombre = (id: string) => ETIQUETA_ACTOR[id] ?? id;

export default function Acto4Relato({ r, set, actor }: Props) {
  const tus = flechasDe(actor);
  const compras = tus.filter((f) => f[1] === actor).length;
  const anios = porAnio(actor)
    .filter((x) => x.compras + x.ventas > 0)
    .map((x) => x.anio);

  // La chuleta: las cifras que el estudiante ya vio, juntas, para no tener que volver
  // atrás en el celular mientras escribe.
  const cifras = [
    `${miles(TOTAL.actores.size)} actores y ${miles(TOTAL.escrituras)} escrituras entre 1938 y 1944.`,
    `Escrituras por año: ${ANIOS.map((y, i) => `${y}: ${ESCRITURAS_POR_ANIO[i]}`).join(" · ")}. ${ANIO_MAS} es el único año transcrito completo.`,
    `El grupo conectado más grande reúne al ${fmt(PCT_GIGANTE, 1)} % de los actores.`,
    `${nombre(SEBASTIAN)}: ${TOTAL.entrada[SEBASTIAN]} compras y ${TOTAL.salida[SEBASTIAN] ?? 0} ventas.`,
    `${nombre(MUNICIPIO)}: ${TOTAL.salida[MUNICIPIO]} ventas y ${TOTAL.entrada[MUNICIPIO] ?? 0} compras.`,
    `${nombre(actor)} (tu actor): ${compras} compras y ${tus.length - compras} ventas, en ${anios.join(", ")}.`,
  ];

  const marcadas = PIEZAS_RELATO.filter((p) => r.a4_chequeo[p.id]).length;

  return (
    <div>
      <CabezaActo
        numero={4}
        titulo="El relato de Cali"
        bajada="Con Poniente tenías con qué comparar: la serie. Si la red contaba algo raro, podías revisar lo que pasó. Con la Cali de 1938 a 1944 no hay serie: lo que tienes son las escrituras. Ahora el relato lo escribes tú."
      />

      <Definicion titulo="Sin serie con qué comparar">
        <p>
          Esa es la posición de quien hace historia con datos: no hay una versión oficial contra
          la cual verificar. Por eso pesa más el <strong>límite</strong>. Ya viste dos: el
          vínculo de Poniente que cuenta a los muertos, y el año de Cali que parece un auge y es
          un archivo más completo. Un buen relato no esconde esos límites: los nombra y dice qué
          se puede afirmar a pesar de ellos.
        </p>
        <p>
          No hace falta que tu relato sea sobre toda la ciudad. Puede ser sobre tu actor, sobre
          el contraste entre quien acumula y quien reparte, o sobre la forma de la red. Lo que
          sí hace falta es que cada afirmación tenga detrás algo que viste en el taller.
        </p>
      </Definicion>

      <Ejercicio numero="4.1" titulo="Las cifras a la mano">
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-stone-700">
          {cifras.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-stone-500">
          Puedes volver al Acto 3 para buscar otras: un año concreto, otro actor, las escrituras
          de tu actor. Lo que llevas escrito no se pierde.
        </p>
      </Ejercicio>

      <Ejercicio numero="4.2" titulo="Tu relato">
        <Texto
          label="Escribe un relato sobre el mercado de tierras de Cali entre 1938 y 1944 a partir de la red. Tiene que tener las cinco piezas de la lista de abajo."
          ayuda="Entre 250 y 400 palabras. Ponle un título. Escribe para alguien que no hizo el taller: que entienda qué pasó y cómo lo sabes."
          valor={r.a4_relato}
          onChange={(v) => set("a4_relato", v)}
          filas={14}
          minPalabras={250}
          maxPalabras={400}
          placeholder="Título…"
        />
        <p className="mb-2 mt-4 text-[15px] font-medium text-stone-800">
          Antes de enviar, revisa: ¿tu relato tiene…?
        </p>
        <ul className="space-y-2">
          {PIEZAS_RELATO.map((p) => (
            <li key={p.id}>
              <label className="flex items-start gap-2.5 text-[15px] leading-snug text-stone-700">
                <input
                  type="checkbox"
                  checked={Boolean(r.a4_chequeo[p.id])}
                  onChange={(e) => set("a4_chequeo", { ...r.a4_chequeo, [p.id]: e.target.checked })}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
                />
                {p.texto}
              </label>
            </li>
          ))}
        </ul>
        {marcadas > 0 && marcadas < PIEZAS_RELATO.length && (
          <p className="mt-3 text-sm text-brand-700">
            Te faltan {PIEZAS_RELATO.length - marcadas}. Vuelve al texto antes de enviar.
          </p>
        )}
      </Ejercicio>

      <Ejercicio numero="4.3" titulo="Dos relatos, dos posiciones">
        <Texto
          label="¿Qué fue distinto entre escribir el relato de Poniente y el de Cali? ¿En cuál confiaste más en tus conclusiones, y por qué?"
          ayuda="Tres o cuatro frases."
          valor={r.a4_comparacion}
          onChange={(v) => set("a4_comparacion", v)}
          filas={5}
          placeholder="Escribe aquí…"
        />
      </Ejercicio>
    </div>
  );
}
