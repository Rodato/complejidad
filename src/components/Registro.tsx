"use client";

import { useState } from "react";

export type DatosRegistro = { nombre: string; codigo: string; companeros: string };

export default function Registro({
  onListo,
}: {
  onListo: (d: DatosRegistro) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [companeros, setCompaneros] = useState("");
  const [error, setError] = useState("");

  function entrar() {
    if (!nombre.trim() || !codigo.trim()) {
      setError("Nombre y código son obligatorios.");
      return;
    }
    onListo({
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      companeros: companeros.trim(),
    });
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg items-center px-4 py-16">
      <div className="card w-full p-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="1.5">
                <circle cx="5" cy="6" r="1.8" />
                <circle cx="19" cy="7" r="1.8" />
                <circle cx="6" cy="18" r="1.8" />
                <path d="M12 12 5 6M12 12l7-5M12 12l-6 6" />
              </g>
            </svg>
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Taller de redes</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Vas a explorar una red histórica de la Notaría 2 de Cali,{" "}
          <strong>dibujar la tuya</strong> y ver emerger su distribución de grado, y luego
          narrar el proceso. Primero, identifícate.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <Campo label="Nombre completo *">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={120}
              className="field"
              placeholder="Tu nombre"
            />
          </Campo>
          <Campo label="Código Univalle *">
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              maxLength={30}
              className="field"
              placeholder="2030456"
            />
          </Campo>
          <Campo label="Compañeros de grupo (opcional)">
            <textarea
              value={companeros}
              onChange={(e) => setCompaneros(e.target.value)}
              maxLength={400}
              rows={2}
              className="field resize-y"
              placeholder="Juan Pérez (2030456), María García (2034567)…"
            />
          </Campo>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button onClick={entrar} className="btn btn-primary mt-2">
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
