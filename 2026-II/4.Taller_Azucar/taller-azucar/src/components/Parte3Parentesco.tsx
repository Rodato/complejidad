"use client";

import { CabezaParte, Campo, Definicion, Ejercicio, Opciones, Texto } from "./ui";
import { ENLACE_VACIO, type Enlace, type Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

const MAX_ENLACES = 10;

const VERIFICACION: { clave: Exclude<Enlace["verificado"], "">; nombre: string }[] = [
  { clave: "confirma", nombre: "La abrimos y lo confirma" },
  { clave: "no_confirma", nombre: "La abrimos y NO lo confirma" },
  { clave: "no_abre", nombre: "No pudimos abrirla" },
];

export default function Parte3Parentesco({ r, set }: Props) {
  const enlaces = r.p3_enlaces.length ? r.p3_enlaces : [ENLACE_VACIO];

  const cambiar = (i: number, campo: keyof Enlace, v: string) =>
    set(
      "p3_enlaces",
      enlaces.map((e, k) => (k === i ? { ...e, [campo]: v } : e)),
    );
  const agregar = () => set("p3_enlaces", [...enlaces, ENLACE_VACIO]);
  const quitar = (i: number) =>
    set(
      "p3_enlaces",
      enlaces.length === 1 ? [ENLACE_VACIO] : enlaces.filter((_, k) => k !== i),
    );

  return (
    <>
      <CabezaParte
        numero={3}
        titulo="Parentescos con IA"
        bajada="Los negocios no eran lo único que unía a estas familias."
      />

      <Definicion titulo="La IA como asistente, no como fuente">
        <p>
          Collins dice que la familia funcionó como «mecanismo de integración entre los grupos
          corporativos» y documenta cuatro matrimonios entre grupos (págs. 595–596). Ahora les
          toca a ustedes, con ayuda de la IA.
        </p>
        <p>
          Pero la IA inventa genealogías con mucha seguridad: nombres, fechas y matrimonios que
          nunca existieron. Por eso cada matrimonio que registren necesita una{" "}
          <strong>fuente que ustedes mismos abran</strong>: un libro, un artículo, un archivo,
          una genealogía publicada, una página con autor. «Me lo dijo la IA» no es una fuente.
        </p>
      </Definicion>

      <Ejercicio numero="3.1" titulo="Matrimonios entre los grupos del cuadro 7, 1930–1950">
        <p className="mb-3 text-[15px] leading-relaxed text-stone-600">
          Busquen con la ayuda de la IA enlaces matrimoniales entre miembros de los grupos
          familiares del cuadro 7 en el periodo 1930–1950.
        </p>
        <Texto
          label="¿Qué le preguntaron a la IA, y a cuál (ChatGPT, Gemini, Claude…)?"
          ayuda="Aquí sí pueden pegar su pregunta."
          valor={r.p3_pregunta_ia}
          onChange={(v) => set("p3_pregunta_ia", v)}
          filas={3}
          permitirPegar
        />

        <div className="mt-2 flex flex-col gap-4">
          {enlaces.map((e, i) => (
            <fieldset key={i} className="rounded-lg border border-stone-200 bg-stone-50 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <legend className="text-sm font-semibold text-stone-800">Matrimonio {i + 1}</legend>
                <button onClick={() => quitar(i)} className="text-xs text-stone-500 underline">
                  Quitar
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <Campo
                  label="Persona 1 (y su familia o grupo)"
                  valor={e.persona1}
                  onChange={(v) => cambiar(i, "persona1", v)}
                  placeholder="Nombre completo (familia)"
                />
                <Campo
                  label="Persona 2 (y su familia o grupo)"
                  valor={e.persona2}
                  onChange={(v) => cambiar(i, "persona2", v)}
                  placeholder="Nombre completo (familia)"
                />
                <Campo
                  label="Año (aproximado)"
                  valor={e.anio}
                  onChange={(v) => cambiar(i, "anio", v)}
                  numerico
                />
                <Campo
                  label="Fuente: autor, título y página, o el enlace"
                  valor={e.fuente}
                  onChange={(v) => cambiar(i, "fuente", v)}
                  permitirPegar
                />
                <div>
                  <p className="mb-1.5 text-[15px] font-medium text-stone-800">
                    ¿Qué pasó cuando abrieron la fuente?
                  </p>
                  <Opciones
                    opciones={VERIFICACION}
                    valor={e.verificado}
                    onChange={(v) => cambiar(i, "verificado", v)}
                    columnas
                  />
                </div>
              </div>
            </fieldset>
          ))}
        </div>
        {enlaces.length < MAX_ENLACES && (
          <button onClick={agregar} className="btn btn-secondary mt-3 w-full">
            + Agregar otro matrimonio
          </button>
        )}
      </Ejercicio>

      <Ejercicio numero="3.2" titulo="Lo que la IA se inventó">
        <Texto
          label="¿Qué les dijo la IA que resultó falso o que no pudieron verificar? ¿Coincide con los cuatro matrimonios que documenta Collins?"
          valor={r.p3_fallas_ia}
          onChange={(v) => set("p3_fallas_ia", v)}
          filas={5}
        />
      </Ejercicio>
    </>
  );
}
