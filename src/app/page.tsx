"use client";

import { useCallback, useEffect, useState } from "react";
import Registro, { type DatosRegistro } from "@/components/Registro";
import RedRealExplorer from "@/components/RedRealExplorer";
import Acto2ConstruyeRed from "@/components/Acto2ConstruyeRed";
import Acto3Narrativa from "@/components/Acto3Narrativa";
import type { EstadoEditor } from "@/components/EditorRed";
import type { GrafoSimple, Regimen } from "@/lib/tipos";

const CLAVE_LS = "taller5-registro";
const ACTOS = [
  { n: 1, corto: "Explora" },
  { n: 2, corto: "Construye" },
  { n: 3, corto: "Narra" },
];

export default function Home() {
  const [registro, setRegistro] = useState<DatosRegistro | null>(null);
  const [hidratado, setHidratado] = useState(false);
  const [estado, setEstado] = useState<EstadoEditor | null>(null);
  const [regimenActual, setRegimenActual] = useState<Regimen | null>(null);
  const [activo, setActivo] = useState(1);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_LS);
      if (guardado) setRegistro(JSON.parse(guardado));
    } catch {}
    setHidratado(true);
  }, []);

  // Resaltar el acto visible en el stepper.
  useEffect(() => {
    if (!registro) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        const visible = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActivo(Number(visible.target.getAttribute("data-acto")));
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );
    ACTOS.forEach((a) => {
      const el = document.getElementById(`acto-${a.n}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [registro]);

  const onListo = useCallback((d: DatosRegistro) => {
    setRegistro(d);
    try {
      localStorage.setItem(CLAVE_LS, JSON.stringify(d));
    } catch {}
  }, []);

  const onCambioEditor = useCallback((e: EstadoEditor) => setEstado(e), []);

  if (!hidratado) return <Skeleton />;
  if (!registro) return <Registro onListo={onListo} />;

  const grafoEditor: GrafoSimple = estado?.grafo ?? { nodos: [], aristas: [] };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-semibold tracking-tight text-slate-800 sm:block">
              Taller de redes
            </span>
            <nav className="flex items-center gap-1">
              {ACTOS.map((a) => (
                <a
                  key={a.n}
                  href={`#acto-${a.n}`}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activo === a.n ? "bg-brand-600 text-white" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span className="font-semibold">{a.n}</span> {a.corto}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-medium text-slate-700">{registro.nombre}</div>
              <div className="font-mono text-xs text-slate-500">{registro.codigo}</div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem(CLAVE_LS);
                setRegistro(null);
              }}
              className="text-xs text-slate-500 underline hover:text-slate-700"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Dibuja el proceso, observa la distribución
          </h1>
          <p className="mt-1 text-[15px] text-slate-600">
            Notaría 2 de Cali · Introducción a la Complejidad
          </p>
        </div>

        <Seccion
          n={1}
          titulo="Explora la red real"
          bajada="La Notaría 2 de Cali, transacción a transacción, acumulada año por año (1938–1944). La flecha va del vendedor al comprador: el tamaño y color de cada actor son sus compras (la tierra que acumula). Mueve el slider y observa qué forma toma la distribución de compras: ¿campana o cola larga?"
        >
          <RedRealExplorer />
        </Seccion>

        <Seccion
          n={2}
          titulo="Construye tu red"
          bajada="Ahora dibuja tú. Coloca actores y traza vínculos —o parte de una plantilla— y al lado verás, en vivo, a qué régimen de distribución te acercas. Intenta reproducir la forma que viste en la red real, o invéntate un proceso distinto."
        >
          <Acto2ConstruyeRed grafo={grafoEditor} onCambio={onCambioEditor} onRegimen={setRegimenActual} />
        </Seccion>

        <Seccion
          n={3}
          titulo="Escribe la narrativa"
          bajada="Toda forma de red cuenta una historia. Explica el proceso que dibujaste y el mecanismo histórico que lo explicaría, y guárdalo."
        >
          <Acto3Narrativa registro={registro} estado={estado} regimen={regimenActual} />
        </Seccion>
      </main>

      <footer className="border-t border-slate-200/60 py-6 text-center text-xs text-slate-500">
        Introducción a la Complejidad · Universidad del Valle · Daniel Otero
      </footer>
    </>
  );
}

function Seccion({
  n,
  titulo,
  bajada,
  children,
}: {
  n: number;
  titulo: string;
  bajada: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`acto-${n}`} data-acto={n} className="mb-12 scroll-mt-20">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {n}
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-slate-800">{titulo}</h2>
      </div>
      <p className="mb-5 max-w-3xl text-[15px] leading-relaxed text-slate-600">{bajada}</p>
      {children}
    </section>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 h-9 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-72 animate-pulse rounded-xl bg-slate-200/70" />
      </div>
    </div>
  );
}
