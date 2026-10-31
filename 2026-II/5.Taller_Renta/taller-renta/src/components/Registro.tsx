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
            {/* Un cono: el perfil del precio del suelo alrededor del centro. */}
            <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
              <path
                d="M3 26 C9 26 12 24 14 16 L16 6 L18 16 C20 24 23 26 29 26"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="eyebrow">Taller 5 · 2026-II</p>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-stone-900">
              La renta del suelo en Cali
            </h1>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed text-stone-600">
          ¿Cuánto valía un metro cuadrado de Cali en 1943 y cuánto vale hoy? ¿Dónde estaba el
          suelo caro y dónde está ahora? Con las escrituras de la Notaría 2 (1941–1944) y los
          avisos de venta de 2020–2026, leídos con David Harvey, <em>The Limits to Capital</em>{" "}
          (1982, cap. 11), y Neil Smith, «Toward a Theory of Gentrification» (1979).
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
          Son siete partes. Puedes cerrar la página y volver: tus respuestas quedan guardadas en
          este dispositivo mientras no las envíes.
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
