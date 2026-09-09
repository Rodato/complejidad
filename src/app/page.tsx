"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Acto1Riesgo from "@/components/Acto1Riesgo";
import Acto2Castaneda from "@/components/Acto2Castaneda";
import Acto3Treq from "@/components/Acto3Treq";
import Acto4Lazo from "@/components/Acto4Lazo";
import FormularioRegistro from "@/components/Registro";
import { CLAVE_REGISTRO, claveRespuestas, limpiarBorrador } from "@/lib/claves";
import { ENUNCIADOS_FACTOR } from "@/lib/contenido";
import { escenarioPara } from "@/lib/escenarios";
import {
  RESPUESTAS_VACIAS,
  type PayloadGuardar,
  type Registro,
  type Respuestas,
} from "@/lib/tipos";

const ACTOS = [
  "Un terremoto no es un desastre",
  "Veintiséis años de saber sin hacer",
  "Leer el estudio que Cali sí tenía",
  "El lazo que no se cerró",
];

type Envio =
  | { estado: "inactivo" }
  | { estado: "enviando" }
  | { estado: "ok" }
  | { estado: "error"; mensaje: string };

/** Lee el borrador de un código. Devuelve las respuestas vacías si no hay o está corrupto. */
function leerRespuestas(codigo: string | undefined): Respuestas {
  if (!codigo) return RESPUESTAS_VACIAS;
  try {
    const crudo = localStorage.getItem(claveRespuestas(codigo));
    if (crudo) return { ...RESPUESTAS_VACIAS, ...(JSON.parse(crudo) as Respuestas) };
  } catch {}
  return RESPUESTAS_VACIAS;
}

function leerInicial(): { reg: Registro | null; res: Respuestas } {
  try {
    const crudo = localStorage.getItem(CLAVE_REGISTRO);
    if (crudo) {
      const reg = JSON.parse(crudo) as Registro;
      if (reg?.codigo) return { reg, res: leerRespuestas(reg.codigo) };
    }
  } catch {}
  return { reg: null, res: RESPUESTAS_VACIAS };
}

// Puerta de montaje: el servidor renderiza la portada estática y el cliente monta
// <Taller/>. Así el estado inicial se puede leer de localStorage con inicializadores
// perezosos, sin desajustes de hidratación y sin llamar a setState dentro de un efecto.
const sinSuscripcion = () => () => {};

/**
 * Lo que se ve mientras carga el JavaScript. En un celular con mala conexión —que es el
 * caso de buena parte del curso— la alternativa era una pantalla en blanco. Es texto, no
 * formulario, para que nadie escriba en campos que la hidratación va a limpiar.
 */
function Portada() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <div className="card w-full p-6 sm:p-8">
        <p className="eyebrow">Taller 1 · 2026-II</p>
        <h1 className="mt-1 text-xl font-bold leading-tight tracking-tight text-stone-900">
          Cali ante el espejo del terremoto
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
          Vas a leer dos documentos sobre el riesgo sísmico de Cali —una nota crítica de Sergio
          Castañeda y el estudio TREQ de 2022— y a usarlos para responder una pregunta: por qué
          un terremoto no es, por sí solo, un desastre.
        </p>
        <p className="mt-6 text-sm text-stone-400">Cargando el taller…</p>
      </div>
    </main>
  );
}

export default function Pagina() {
  const montado = useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
  if (!montado) return <Portada />;
  return <Taller />;
}

function Taller() {
  const [inicial] = useState(leerInicial);
  const [registro, setRegistro] = useState<Registro | null>(inicial.reg);
  const [r, setR] = useState<Respuestas>(inicial.res);
  const [acto, setActo] = useState(0);
  const [envio, setEnvio] = useState<Envio>({ estado: "inactivo" });
  const tope = useRef<HTMLDivElement>(null);

  // Autoguardado del borrador, atado al código del estudiante.
  useEffect(() => {
    if (!registro) return;
    try {
      localStorage.setItem(claveRespuestas(registro.codigo), JSON.stringify(r));
    } catch {}
  }, [r, registro]);

  const set = useCallback(
    <K extends keyof Respuestas>(k: K, v: Respuestas[K]) =>
      setR((prev) => ({ ...prev, [k]: v })),
    [],
  );

  const escenario = useMemo(
    () => escenarioPara(registro?.codigo ?? ""),
    [registro?.codigo],
  );

  function entrar(d: Registro) {
    try {
      localStorage.setItem(CLAVE_REGISTRO, JSON.stringify(d));
    } catch {}
    setR(leerRespuestas(d.codigo));
    setRegistro(d);
  }

  function salir() {
    if (!registro) return;
    if (
      !confirm(
        "Vas a salir y borrar el borrador de este dispositivo. Si ya enviaste el taller, no pasa nada. ¿Continuar?",
      )
    )
      return;
    limpiarBorrador(registro.codigo);
    try {
      localStorage.removeItem(CLAVE_REGISTRO);
    } catch {}
    setRegistro(null);
    setR(RESPUESTAS_VACIAS);
    setActo(0);
    setEnvio({ estado: "inactivo" });
  }

  function irA(i: number) {
    setActo(i);
    tope.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function enviar() {
    if (!registro) return;
    if (!r.a4_argumento.trim()) {
      setEnvio({
        estado: "error",
        mensaje: "Falta el argumento del ejercicio 4.2, que es la entrega principal.",
      });
      return;
    }
    setEnvio({ estado: "enviando" });

    const aciertos = ENUNCIADOS_FACTOR.filter(
      (e) => r.a1_clasificacion[e.id] === e.correcta,
    ).length;
    const payload: PayloadGuardar = {
      ...registro,
      escenario_id: escenario.id,
      escenario_titulo: escenario.titulo,
      a1_aciertos: aciertos,
      a2_n_conocer: Object.values(r.a2_cronologia).filter((v) => v === "conocer").length,
      a2_n_actuar: Object.values(r.a2_cronologia).filter((v) => v === "actuar").length,
      respuestas: r,
    };

    try {
      const res = await fetch("/api/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setEnvio({
          estado: "error",
          mensaje:
            data?.error ??
            "No se pudo guardar. Tus respuestas siguen en este dispositivo: intenta de nuevo.",
        });
        return;
      }
      setEnvio({ estado: "ok" });
    } catch {
      setEnvio({
        estado: "error",
        mensaje:
          "No hubo conexión. Tus respuestas siguen guardadas aquí: vuelve a intentarlo cuando tengas señal.",
      });
    }
  }

  if (!registro) return <FormularioRegistro onListo={entrar} />;

  if (envio.estado === "ok") {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
        <div className="card w-full p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="m5 13 4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-stone-900">Taller enviado</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
            Quedó registrado a nombre de <strong>{registro.nombre}</strong>
            {registro.pareja ? ` y ${registro.pareja}` : ""}, con el escenario{" "}
            <strong>{escenario.titulo}</strong>.
          </p>
          <p className="mt-4 rounded-lg bg-stone-100 p-3 text-sm leading-relaxed text-stone-600">
            En la próxima sesión juntamos los trece escenarios: ahí se ve, con toda la clase, que
            la magnitud del sismo no predice el tamaño del desastre.
          </p>
          <button onClick={salir} className="btn btn-secondary mt-5 w-full">
            Salir y borrar el borrador de este dispositivo
          </button>
        </div>
      </main>
    );
  }

  const ultimo = acto === ACTOS.length - 1;

  return (
    <div className="pb-24">
      <div ref={tope} />

      <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-semibold text-stone-800">
              Cali ante el espejo del terremoto
            </p>
            <button onClick={salir} className="shrink-0 text-xs text-stone-500 underline">
              Salir
            </button>
          </div>
          <nav className="mt-2 flex gap-1.5" aria-label="Actos del taller">
            {ACTOS.map((t, i) => (
              <button
                key={t}
                onClick={() => irA(i)}
                aria-current={i === acto ? "step" : undefined}
                title={t}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i === acto ? "bg-brand-600" : i < acto ? "bg-brand-300" : "bg-stone-300"
                }`}
              >
                <span className="sr-only">{`Acto ${i + 1}: ${t}`}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {acto === 0 && <Acto1Riesgo r={r} set={set} />}
        {acto === 1 && <Acto2Castaneda r={r} set={set} />}
        {acto === 2 && <Acto3Treq r={r} set={set} escenario={escenario} />}
        {acto === 3 && <Acto4Lazo r={r} set={set} />}

        {ultimo && (
          <section className="card mt-6 p-4 sm:p-5">
            <h3 className="text-base font-bold text-stone-900">Enviar el taller</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
              Revisa que las dos personas de la pareja estén identificadas y que el argumento de
              4.2 esté completo. Después de enviar no puedes editar, pero sí puedes volver a
              enviar si algo quedó mal.
            </p>
            {envio.estado === "error" && (
              <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-700">
                {envio.mensaje}
              </p>
            )}
            <button
              onClick={enviar}
              disabled={envio.estado === "enviando"}
              className="btn btn-primary mt-4 w-full"
            >
              {envio.estado === "enviando" ? "Enviando…" : "Enviar el taller"}
            </button>
          </section>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => irA(acto - 1)}
            disabled={acto === 0}
            className="btn btn-secondary"
          >
            ← Atrás
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-xs text-stone-500">
            Acto {acto + 1} de {ACTOS.length}
          </p>
          <button
            onClick={() => irA(acto + 1)}
            disabled={ultimo}
            className="btn btn-primary"
          >
            Siguiente →
          </button>
        </div>
      </nav>
    </div>
  );
}
