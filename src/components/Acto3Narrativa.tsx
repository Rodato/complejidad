"use client";

import { useEffect, useState } from "react";
import { estadisticasGrado, regimen as calcularRegimen } from "@/lib/red";
import type { EstadoEditor } from "./EditorRed";
import type { DatosRegistro } from "./Registro";
import type { Accion, PayloadGuardar, Regimen } from "@/lib/tipos";

const LS_NARRATIVA = "taller5-narrativa";
const LS_GRAFO = "taller5-grafo";
const LS_ULTIMO = "taller5-ultimo-envio";

export default function Acto3Narrativa({
  registro,
  estado,
  regimen,
}: {
  registro: DatosRegistro;
  estado: EstadoEditor | null;
  regimen?: Regimen | null;
}) {
  const [narrativa, setNarrativa] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null);

  // Restaurar el borrador de narrativa al montar.
  useEffect(() => {
    try {
      const draft = localStorage.getItem(LS_NARRATIVA);
      if (draft) setNarrativa(draft);
    } catch {}
  }, []);

  function onNarrativa(v: string) {
    setNarrativa(v);
    try {
      localStorage.setItem(LS_NARRATIVA, v);
    } catch {}
  }

  const grafo = estado?.grafo ?? { nodos: [], aristas: [] };
  const stats = estadisticasGrado(grafo);
  // Usa el régimen que el estudiante VIO en el Acto 2 (misma histéresis); si por
  // alguna razón no llegó, lo recalcula.
  const reg = regimen ?? calcularRegimen(grafo);
  const listoParaGuardar = stats.n >= 2 && narrativa.trim().length >= 20;

  async function guardar() {
    if (!estado) return;
    setGuardando(true);
    setResultado(null);
    const payload: PayloadGuardar = {
      nombre: registro.nombre,
      codigo: registro.codigo,
      companeros: registro.companeros,
      n_nodos: stats.n,
      n_aristas: stats.m,
      grado_max: stats.gradoMax,
      grado_promedio: Number(stats.gradoPromedio.toFixed(2)),
      regimen: reg.etiqueta,
      regimen_clave: reg.clave,
      secuencia_construccion: estado.acciones,
      grafo: estado.guardar,
      narrativa: narrativa.trim(),
    };
    // Red de seguridad: guarda el envío localmente antes de mandarlo.
    try {
      localStorage.setItem(LS_ULTIMO, JSON.stringify(payload));
    } catch {}

    try {
      const r = await fetch("/api/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.destino !== "sheets") {
        throw new Error(
          data?.error ?? "El guardado remoto no está disponible. Tu trabajo quedó respaldado en este navegador.",
        );
      }
      setGuardado(true);
      setResultado({ ok: true, msg: "¡Guardado en la hoja del curso!" });
      try {
        localStorage.removeItem(LS_GRAFO);
        localStorage.removeItem(LS_NARRATIVA);
      } catch {}
      setTimeout(() => setGuardado(false), 2500);
    } catch (e) {
      setResultado({ ok: false, msg: (e as Error).message });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
      <div>
        <p className="mb-2 text-[15px] text-slate-600">
          Mira lo que dibujaste: <strong>{stats.n}</strong> actores,{" "}
          <strong>{stats.m}</strong> vínculos, y una distribución que tu red empuja hacia{" "}
          <strong>{reg.etiqueta.toLowerCase()}</strong>.
        </p>
        <p className="mb-3 text-[15px] text-slate-600">
          Ahora cuenta <strong>la historia detrás del proceso</strong>: ¿qué representa
          cada actor? ¿Por qué conectaste como conectaste? ¿Qué mecanismo de la Cali de
          esos años (familia, capital, banca, posición política) produciría esta forma?
        </p>
        <textarea
          value={narrativa}
          onChange={(e) => onNarrativa(e.target.value)}
          rows={9}
          aria-label="Tu narrativa"
          placeholder="Dibujé una estrella alrededor de un actor porque imaginé a un gran terrateniente que… Esto produce una cola larga porque…"
          className="field resize-y"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={guardar}
            disabled={!listoParaGuardar || guardando || guardado}
            className="btn btn-primary"
          >
            {guardando && <Spinner />}
            {guardando ? "Guardando…" : guardado ? "Guardado ✓" : "Guardar mi red y narrativa"}
          </button>
          {!listoParaGuardar && (
            <span className="text-xs text-slate-500">
              Dibuja al menos 2 actores y escribe unas frases (≥20 caracteres).
            </span>
          )}
        </div>
        {resultado && (
          <div
            className={`anim-in mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
              resultado.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {resultado.ok ? <IconoCheck /> : <IconoAlerta />}
            <span>{resultado.msg}</span>
          </div>
        )}
      </div>

      <div className="card bg-slate-50 p-4">
        <h4 className="eyebrow mb-2">Tu proceso de construcción</h4>
        <p className="mb-3 text-xs text-slate-500">
          Registramos el orden en que colocaste nodos y vínculos — es parte de tu
          narrativa.
        </p>
        <ol className="max-h-72 space-y-1 overflow-auto font-mono text-xs text-slate-600">
          {(estado?.acciones ?? []).length === 0 && (
            <li className="text-slate-400">Aún no has dibujado nada.</li>
          )}
          {(estado?.acciones ?? []).map((a) => (
            <li key={a.orden}>
              {String(a.orden).padStart(2, "0")}. {etiquetaAccion(a.tipo)} {a.detalle}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function etiquetaAccion(tipo: Accion["tipo"]): string {
  return (
    {
      "add-nodo": "＋ actor",
      "add-arista": "— vínculo",
      "del-nodo": "✕ actor",
      "del-arista": "✕ vínculo",
      "rename-nodo": "✎ renombrar",
      plantilla: "⌗ plantilla",
      limpiar: "⟲ limpiar",
    }[tipo] ?? tipo
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function IconoCheck() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z" clipRule="evenodd" />
    </svg>
  );
}
function IconoAlerta() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.3 2.3a2 2 0 0 1 3.4 0l6.5 11A2 2 0 0 1 16.5 16h-13a2 2 0 0 1-1.7-2.7l6.5-11ZM11 13a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-1-6a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Z" clipRule="evenodd" />
    </svg>
  );
}
