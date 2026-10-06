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
            <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
              <path
                d="M8 9 L16 16 L25 10 M16 16 L12 25 M16 16 L24 23"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="16" cy="16" r="3.6" fill="currentColor" />
              <circle cx="8" cy="9" r="2.6" fill="currentColor" />
              <circle cx="25" cy="10" r="2.6" fill="currentColor" />
              <circle cx="12" cy="25" r="2.6" fill="currentColor" />
              <circle cx="24" cy="23" r="2.6" fill="currentColor" />
            </svg>
          </span>
          <div>
            <p className="eyebrow">Taller 3 · 2026-II</p>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-stone-900">
              Lo que la red cuenta
            </h1>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed text-stone-600">
          Una red que cambia en el tiempo cuenta una historia. En este taller vas a aprender a
          contarla sin inventar nada: primero con las ocho temporadas de Juego de tronos, donde
          puedes comparar con lo que viste, y después con la red de compraventas de la Cali de
          1938 a 1944, donde no hay serie con qué comparar.
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
          Son cuatro actos. Puedes cerrar la página y volver: tus respuestas quedan guardadas en
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
            <span className="text-sm text-stone-500">
              De este código depende qué personaje de Juego de tronos y qué actor de Cali les
              toca seguir.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] font-medium text-stone-800">
              Tu pareja: nombre y código
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
              El taller se hace en parejas. Envíen una sola respuesta entre los dos.
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
