"use client";

import EditorRed, { type EstadoEditor } from "./EditorRed";
import PanelDistribucion from "./PanelDistribucion";
import type { GrafoSimple, Regimen } from "@/lib/tipos";

export default function Acto2ConstruyeRed({
  grafo,
  onCambio,
  onRegimen,
  codigo,
}: {
  grafo: GrafoSimple;
  onCambio: (e: EstadoEditor) => void;
  onRegimen?: (r: Regimen) => void;
  codigo: string;
}) {
  return (
    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
      <div className="h-[560px]">
        <EditorRed onCambio={onCambio} codigo={codigo} />
      </div>
      <div className="card p-5">
        <PanelDistribucion grafo={grafo} onRegimen={onRegimen} />
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs leading-relaxed text-slate-600">
            <strong className="text-slate-700">La flecha va del vendedor al comprador.</strong> El
            grado que cuenta son las <em>compras</em> (la tierra que recibe cada actor).
            Prueba <em>Estrella</em> (todos le venden a uno → acumula tierra → cola larga) y
            luego <em>Anillo</em> (cada quien compra una vez → campana). ¿Qué proceso histórico
            produciría cada forma?
          </p>
        </div>
      </div>
    </div>
  );
}
