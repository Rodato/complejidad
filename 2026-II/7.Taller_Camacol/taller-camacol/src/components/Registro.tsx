"use client";

import { useState } from "react";
import type { Registro } from "@/lib/tipos";

export default function FormularioRegistro({
  onListo,
}: {
  onListo: (d: Registro) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [pareja, setPareja] = useState("");
  const [error, setError] = useState("");

  function entrar() {
    if (!nombre.trim() || !codigo.trim()) {
      setError("Nombre y código son obligatorios.");
      return;
    }
    onListo({ nombre: nombre.trim(), codigo: codigo.trim(), pareja: pareja.trim() });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <div className="card w-full p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            {/* Un sobre: la carta. */}
            <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
              <path
                d="M5 9h22v15H5V9Zm0 1 11 8 11-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="eyebrow">Taller 6 · 2026-II</p>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-stone-900">
              Quién ordena Cali
            </h1>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed text-stone-600">
          El 12 de noviembre de 2026, tres meses después del terremoto, Camacol Valle dirigió al
          alcalde ad hoc una carta con sus propuestas para el ajuste del POT. Este control de
          lectura la examina en seis partes: el lugar de enunciación, los actores incluidos y
          excluidos, la expansión oriental y el agua, el silencio sobre el terremoto, la evidencia
          cuantitativa y la comparación entre el oriente y el abanico de Cañaveralejo.
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
          Ten a mano el PDF de la carta: las preguntas remiten a sus páginas.
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
          Puedes cerrar la página y volver: tus respuestas quedan guardadas en este dispositivo
          mientras no las envíes.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] font-medium text-stone-800">Tu nombre completo *</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={120}
              autoComplete="name"
              className="field"
              placeholder="Tu nombre"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] font-medium text-stone-800">Tu código Univalle *</span>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              maxLength={30}
              inputMode="numeric"
              className="field"
              placeholder="2030456"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] font-medium text-stone-800">
              Si trabajas en grupo: nombres y códigos de los demás
            </span>
            <textarea
              value={pareja}
              onChange={(e) => setPareja(e.target.value)}
              maxLength={200}
              rows={2}
              className="field resize-y"
              placeholder="María García (2034567)"
            />
            <span className="text-sm text-stone-500">
              Envíen una sola respuesta por grupo.
            </span>
          </label>

          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

          <button onClick={entrar} className="btn btn-primary mt-1">
            Empezar
          </button>
        </div>
      </div>
    </main>
  );
}
