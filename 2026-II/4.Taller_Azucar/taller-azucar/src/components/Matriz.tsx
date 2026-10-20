"use client";

import { useState } from "react";
import { EMPRESA, EMPRESAS_C7, GRUPO, GRUPOS_C7, PERSONA, PERSONAS_C7, marca } from "@/lib/collins";

type Seleccion = { tipo: "fila" | "columna"; id: string } | null;

/**
 * El cuadro 7 tal como lo imprimió Collins, pero con las columnas arriba y las filas en
 * el orden de su explicación (A1 primero). Tocar una fila o una columna la resalta y
 * abre su ficha. En el celular la cuadrícula se desplaza de lado y los nombres quedan fijos.
 */
export default function Matriz() {
  const [sel, setSel] = useState<Seleccion>(null);

  const elegir = (tipo: "fila" | "columna", id: string) =>
    setSel((s) => (s?.tipo === tipo && s.id === id ? null : { tipo, id }));

  const filaSel = sel?.tipo === "fila" ? sel.id : null;
  const colSel = sel?.tipo === "columna" ? sel.id : null;

  return (
    <div className="mb-4">
      {/* Dos bloques con las mismas alturas de fila: los nombres quedan fijos a la izquierda
          y solo la cuadrícula se desplaza de lado. Con una columna «sticky» dentro de una
          tabla, las ✕ de las columnas desplazadas se asomaban por encima de los nombres. */}
      <div className="flex overflow-hidden rounded-lg border border-stone-200 bg-white text-xs">
        <div className="w-[9.5rem] shrink-0 border-r border-stone-200">
          <div className="flex h-8 items-center border-b border-stone-200 bg-stone-50 px-2 font-semibold text-stone-500">
            Fila \ Empresa
          </div>
          {GRUPOS_C7.map((g) => (
            <div key={g.id}>
              <div className="flex h-6 items-center truncate border-b border-stone-200 bg-stone-100 px-2 text-[11px] font-semibold uppercase tracking-wide text-stone-600">
                Grupo {g.id} · {g.corto}
              </div>
              {PERSONAS_C7.filter((p) => p.grupo === g.id).map((p) => (
                <button
                  key={p.id}
                  onClick={() => elegir("fila", p.id)}
                  aria-pressed={filaSel === p.id}
                  className={`block h-7 w-full truncate border-b border-stone-100 px-2 text-left ${
                    filaSel === p.id ? "bg-brand-500 text-white" : "text-stone-800 hover:bg-stone-100"
                  }`}
                >
                  <span className="font-bold">{p.id}</span> {p.nombre}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div style={{ width: `${EMPRESAS_C7.length * 1.75}rem` }}>
            <div className="flex h-8 border-b border-stone-200 bg-stone-50">
              {EMPRESAS_C7.map((e) => (
                <button
                  key={e.id}
                  onClick={() => elegir("columna", e.id)}
                  aria-pressed={colSel === e.id}
                  aria-label={`Empresa ${e.id}: ${e.nombre}`}
                  className={`h-8 w-7 shrink-0 font-bold ${
                    colSel === e.id ? "bg-brand-500 text-white" : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {e.id}
                </button>
              ))}
            </div>
            {GRUPOS_C7.map((g) => (
              <div key={g.id}>
                <div className="h-6 border-b border-stone-200 bg-stone-100" />
                {PERSONAS_C7.filter((p) => p.grupo === g.id).map((p) => (
                  <div
                    key={p.id}
                    className={`flex h-7 border-b border-stone-100 ${filaSel === p.id ? "bg-brand-50" : ""}`}
                  >
                    {EMPRESAS_C7.map((e) => {
                      const x = marca(p.id, e.id);
                      const enFoco = filaSel === p.id || colSel === e.id;
                      return (
                        <div
                          key={e.id}
                          className={`flex h-full w-7 shrink-0 items-center justify-center border-r border-stone-100 font-bold ${
                            colSel === e.id ? "bg-brand-50" : ""
                          } ${x ? (enFoco ? "text-brand-700" : "text-stone-700") : ""}`}
                        >
                          {x ? "✕" : ""}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
        Desliza la cuadrícula hacia la izquierda para ver todas las columnas. Toca un nombre o
        una letra de columna para ver su ficha.
      </p>

      {sel?.tipo === "columna" && <FichaEmpresa id={sel.id} onCerrar={() => setSel(null)} />}
      {sel?.tipo === "fila" && <FichaPersona id={sel.id} onCerrar={() => setSel(null)} />}
    </div>
  );
}

function Ficha({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-semibold text-stone-900">{titulo}</p>
        <button onClick={onCerrar} aria-label="Cerrar ficha" className="shrink-0 px-1 text-stone-500 hover:text-stone-800">
          ✕
        </button>
      </div>
      <div className="mt-1.5 text-sm leading-relaxed text-stone-700">{children}</div>
    </div>
  );
}

function FichaEmpresa({ id, onCerrar }: { id: string; onCerrar: () => void }) {
  const e = EMPRESA.get(id)!;
  const quienes = PERSONAS_C7.filter((p) => p.empresas.includes(id));
  const grupos = [...new Set(quienes.map((p) => p.grupo))];
  return (
    <Ficha titulo={`Empresa ${e.id}: ${e.nombre}`} onCerrar={onCerrar}>
      <p>{e.nota}</p>
      <p className="mt-1 text-xs text-stone-500">Collins, pág. {e.pagina}.</p>
      <p className="mt-2 font-medium text-stone-800">
        Con ✕ en el cuadro ({quienes.length}), de {grupos.length} grupo{grupos.length === 1 ? "" : "s"}:
      </p>
      <ul className="mt-0.5 space-y-0.5">
        {quienes.map((p) => (
          <li key={p.id}>
            · <strong>{p.id}</strong> {p.nombre}{" "}
            <span className="text-stone-500">({GRUPO.get(p.grupo)?.corto})</span>
          </li>
        ))}
      </ul>
    </Ficha>
  );
}

function FichaPersona({ id, onCerrar }: { id: string; onCerrar: () => void }) {
  const p = PERSONA.get(id)!;
  const g = GRUPO.get(p.grupo)!;
  return (
    <Ficha titulo={`${p.id}: ${p.nombre}`} onCerrar={onCerrar}>
      <p>
        Fila del grupo {g.id}: {g.nombre}.
      </p>
      <p className="mt-2 font-medium text-stone-800">Empresas con ✕ ({p.empresas.length}):</p>
      <ul className="mt-0.5 space-y-0.5">
        {[...p.empresas].map((l) => (
          <li key={l}>
            · <strong>{l}</strong> {EMPRESA.get(l)?.nombre}
          </li>
        ))}
      </ul>
    </Ficha>
  );
}
