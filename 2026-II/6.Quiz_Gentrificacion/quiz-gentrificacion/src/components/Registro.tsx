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
            {/* Una casa y una flecha que sale: el bastión que se muda. */}
            <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
              <path
                d="M4 27V15l8-7 8 7v12H4ZM10 27v-6h4v6M22 12h7m0 0-3-3m3 3-3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="eyebrow">Quiz · 2026-II</p>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-stone-900">
              Renta, gentrificación y segregación
            </h1>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed text-stone-600">
          ¿A dónde se fue la élite de Cali y qué pasó con los barrios que dejó? Cinco preguntas
          que aplican Gilma Mosquera y Jacques Aprile-Gniset, «Notas sobre el proceso de
          segregación social en el espacio urbano» (1980), y Neil Smith, «Toward a Theory of
          Gentrification» (1979), a las escrituras de la Notaría 2 (1941–1944) y a los avisos de
          venta de 2020–2024.
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
