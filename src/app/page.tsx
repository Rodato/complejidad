"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Acto1Poniente from "@/components/Acto1Poniente";
import Acto2Escrituras, { fichaCorrecta } from "@/components/Acto2Escrituras";
import Acto3Cali from "@/components/Acto3Cali";
import Acto4Relato from "@/components/Acto4Relato";
import FormularioRegistro from "@/components/Registro";
import { CLAVE_REGISTRO, claveActo, claveRespuestas, limpiarBorrador } from "@/lib/claves";
import { ETIQUETA_ACTOR, ETIQUETA_PERSONAJE, FICHAS, actorPara, personajePara } from "@/lib/contenido";
import {
  RESPUESTAS_VACIAS,
  type BorradorGuardado,
  type PayloadGuardar,
  type Registro,
  type Respuestas,
} from "@/lib/tipos";

const ACTOS = [
  "Poniente, temporada a temporada",
  "De una escritura a una red",
  "Cali, año por año",
  "El relato de Cali",
];

type Envio =
  | { estado: "inactivo" }
  | { estado: "enviando" }
  | { estado: "ok" }
  | { estado: "error"; mensaje: string };

/** Estado del respaldo en servidor, el que permite retomar en otro dispositivo. */
type Nube = "inactivo" | "guardando" | "ok" | "error";

function fechaLegible(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Lee el borrador de un código. Devuelve las respuestas vacías si no hay o está corrupto. */
function leerRespuestas(codigo: string | undefined): Respuestas {
  if (!codigo) return RESPUESTAS_VACIAS;
  try {
    const crudo = localStorage.getItem(claveRespuestas(codigo));
    if (crudo) return { ...RESPUESTAS_VACIAS, ...(JSON.parse(crudo) as Respuestas) };
  } catch {}
  return RESPUESTAS_VACIAS;
}

/** En qué acto quedó. Se acota al rango válido por si el borrador viene de otra versión. */
function leerActo(codigo: string | undefined): number {
  if (!codigo) return 0;
  try {
    const n = Number(localStorage.getItem(claveActo(codigo)));
    if (Number.isInteger(n) && n >= 0 && n < ACTOS.length) return n;
  } catch {}
  return 0;
}

/** ¿Hay algo escrito? Sirve para avisarle al estudiante que retomó su borrador. */
function tieneAvance(r: Respuestas): boolean {
  return Object.values(r).some((v) =>
    typeof v === "string" ? v.trim() !== "" : Object.values(v).some(Boolean),
  );
}

function leerInicial(): { reg: Registro | null; res: Respuestas; acto: number } {
  try {
    const crudo = localStorage.getItem(CLAVE_REGISTRO);
    if (crudo) {
      const reg = JSON.parse(crudo) as Registro;
      if (reg?.codigo) {
        return { reg, res: leerRespuestas(reg.codigo), acto: leerActo(reg.codigo) };
      }
    }
  } catch {}
  return { reg: null, res: RESPUESTAS_VACIAS, acto: 0 };
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
        <p className="eyebrow">Taller 3 · 2026-II</p>
        <h1 className="mt-1 text-xl font-bold leading-tight tracking-tight text-stone-900">
          Lo que la red cuenta
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
          Armar relatos a partir de datos: primero con las ocho temporadas de Juego de tronos,
          después con la red de compraventas de la Cali de 1938 a 1944.
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
  const [acto, setActo] = useState(inicial.acto);
  const [envio, setEnvio] = useState<Envio>({ estado: "inactivo" });
  // Solo se anuncia el borrador recuperado si ya venía con algo escrito al abrir.
  const [retomado, setRetomado] = useState(
    () => Boolean(inicial.reg) && tieneAvance(inicial.res),
  );
  // Respaldo en servidor: lo que permite empezar en el celular y seguir en otro equipo.
  const [nube, setNube] = useState<Nube>("inactivo");
  const [buscando, setBuscando] = useState(false);
  const [propuesta, setPropuesta] = useState<BorradorGuardado | null>(null);
  const tope = useRef<HTMLDivElement>(null);
  // Espejo del estado para el guardado al cerrar la página, que no puede leer el closure.
  const espejo = useRef({ registro: inicial.reg, acto: inicial.acto, r: inicial.res });

  // Autoguardado del borrador (respuestas y posición), atado al código del estudiante.
  useEffect(() => {
    if (!registro) return;
    try {
      localStorage.setItem(claveRespuestas(registro.codigo), JSON.stringify(r));
      localStorage.setItem(claveActo(registro.codigo), String(acto));
    } catch {}
  }, [r, acto, registro]);

  useEffect(() => {
    espejo.current = { registro, acto, r };
  }, [registro, acto, r]);

  // Al cerrar la pestaña o mandar el navegador a segundo plano (bloquear el celular,
  // cambiar de app) se manda un último respaldo. sendBeacon sobrevive a la descarga
  // de la página, cosa que un fetch normal no garantiza.
  useEffect(() => {
    const alSalir = () => {
      const { registro: reg, acto: a, r: res } = espejo.current;
      if (!reg || !tieneAvance(res)) return;
      try {
        navigator.sendBeacon?.(
          "/api/borrador",
          new Blob(
            [JSON.stringify({ ...reg, acto: a, respuestas: res })],
            { type: "application/json" },
          ),
        );
      } catch {}
    };
    window.addEventListener("pagehide", alSalir);
    return () => window.removeEventListener("pagehide", alSalir);
  }, []);

  const respaldar = useCallback(
    async (actoActual: number, silencioso: boolean) => {
      const reg = espejo.current.registro;
      if (!reg) return;
      if (!silencioso) setNube("guardando");
      try {
        const res = await fetch("/api/borrador", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...reg, acto: actoActual, respuestas: espejo.current.r }),
        });
        if (!silencioso) setNube(res.ok ? "ok" : "error");
      } catch {
        if (!silencioso) setNube("error");
      }
    },
    [],
  );

  const set = useCallback(
    <K extends keyof Respuestas>(k: K, v: Respuestas[K]) =>
      setR((prev) => ({ ...prev, [k]: v })),
    [],
  );

  const personaje = useMemo(() => personajePara(registro?.codigo ?? ""), [registro?.codigo]);
  const actor = useMemo(() => actorPara(registro?.codigo ?? ""), [registro?.codigo]);

  async function entrar(d: Registro) {
    try {
      localStorage.setItem(CLAVE_REGISTRO, JSON.stringify(d));
    } catch {}
    const previas = leerRespuestas(d.codigo);
    setR(previas);
    setActo(leerActo(d.codigo));
    setRetomado(tieneAvance(previas));
    setRegistro(d);

    // Solo se consulta el servidor cuando este aparato no tiene nada: es el caso de
    // "empecé en el celular y sigo en otro equipo". Si hay borrador local, ese manda.
    if (tieneAvance(previas)) return;
    setBuscando(true);
    try {
      const res = await fetch(`/api/borrador?codigo=${encodeURIComponent(d.codigo)}`);
      const data = await res.json();
      if (res.ok && data?.borrador && tieneAvance(data.borrador.respuestas)) {
        setPropuesta(data.borrador as BorradorGuardado);
      }
    } catch {
      // Sin conexión no se ofrece nada: el taller sigue funcionando contra el aparato.
    }
    setBuscando(false);
  }

  function recuperar(b: BorradorGuardado) {
    setR({ ...RESPUESTAS_VACIAS, ...b.respuestas });
    setActo(b.acto);
    setRetomado(true);
    setPropuesta(null);
  }

  function salir() {
    if (!registro) return;
    if (
      !confirm(
        "OJO: esto BORRA todo lo que has escrito en este dispositivo y no se puede deshacer.\n\n" +
          "Solo sal así si ya enviaste el taller, o si le vas a prestar el equipo a otra pareja.\n\n" +
          "Si únicamente quieres seguir después, cierra la página: tu avance queda guardado aquí.",
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
    setRetomado(false);
    setEnvio({ estado: "inactivo" });
  }

  function irA(i: number) {
    setActo(i);
    tope.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Cada cambio de acto es un punto de control natural. En silencio, para no
    // distraer, y solo si ya hay algo escrito.
    if (tieneAvance(espejo.current.r)) void respaldar(i, true);
  }

  async function enviar() {
    if (!registro) return;
    const faltan = [
      !r.a1_relato.trim() && "el relato de Poniente (1.4)",
      !r.a4_relato.trim() && "el relato de Cali (4.2)",
    ].filter(Boolean);
    if (faltan.length) {
      setEnvio({
        estado: "error",
        mensaje: `Falta ${faltan.join(" y ")}: son la entrega principal.`,
      });
      return;
    }
    setEnvio({ estado: "enviando" });

    const payload: PayloadGuardar = {
      ...registro,
      personaje: ETIQUETA_PERSONAJE[personaje] ?? personaje,
      actor: ETIQUETA_ACTOR[actor] ?? actor,
      a2_aciertos: FICHAS.filter((f) => fichaCorrecta(f.id, r.a2_fichas[f.id])).length,
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

  if (buscando) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
        <div className="card w-full p-6 text-center sm:p-8">
          <p className="text-[15px] text-stone-600">Buscando si tienes avance guardado…</p>
        </div>
      </main>
    );
  }

  if (propuesta) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
        <div className="card w-full p-6 sm:p-8">
          <p className="eyebrow">Encontramos tu avance</p>
          <h1 className="mt-1 text-xl font-bold leading-tight text-stone-900">
            Ya habías empezado este taller
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
            Con el código <strong>{registro.codigo}</strong> hay un avance guardado
            {propuesta.actualizado ? ` del ${fechaLegible(propuesta.actualizado)}` : ""}, que
            llegaba hasta el <strong>Acto {propuesta.acto + 1}</strong>. Lo guardaste desde otro
            dispositivo o en otra sesión.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button onClick={() => recuperar(propuesta)} className="btn btn-primary">
              Continuar donde quedé
            </button>
            <button onClick={() => setPropuesta(null)} className="btn btn-secondary">
              Empezar de cero
            </button>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-stone-500">
            Si empiezas de cero, lo guardado no se borra hasta que escribas encima.
          </p>
        </div>
      </main>
    );
  }

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
            {registro.pareja ? ` y ${registro.pareja}` : ""}, siguiendo a{" "}
            <strong>{ETIQUETA_PERSONAJE[personaje]}</strong> en Poniente y a{" "}
            <strong>{ETIQUETA_ACTOR[actor]}</strong> en Cali.
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
              Lo que la red cuenta · Taller 3
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
        {retomado && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="mt-0.5 shrink-0 text-emerald-700"
              aria-hidden
            >
              <path
                d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-emerald-900">
                Retomaste donde ibas
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-emerald-800">
                Encontramos tu avance guardado en este dispositivo y lo cargamos, incluido el
                acto en el que quedaste. Puedes seguir tranquilo.
              </p>
            </div>
            <button
              onClick={() => setRetomado(false)}
              aria-label="Cerrar aviso"
              className="shrink-0 px-1 text-emerald-700 hover:text-emerald-900"
            >
              ✕
            </button>
          </div>
        )}

        {acto === 0 && <Acto1Poniente r={r} set={set} personaje={personaje} />}
        {acto === 1 && <Acto2Escrituras r={r} set={set} />}
        {acto === 2 && <Acto3Cali r={r} set={set} actor={actor} />}
        {acto === 3 && <Acto4Relato r={r} set={set} actor={actor} />}

        <section className="card mt-6 p-4 sm:p-5">
          <h3 className="text-base font-bold text-stone-900">
            ¿Vas a seguir en otro dispositivo?
          </h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
            Tu avance se guarda solo en este aparato. Si vas a continuar desde otro celular o
            computador, respáldalo aquí: al entrar allá con tu código{" "}
            <strong>{registro.codigo}</strong> te ofrecemos retomarlo.
          </p>
          <button
            onClick={() => void respaldar(acto, false)}
            disabled={nube === "guardando" || !tieneAvance(r)}
            className="btn btn-secondary mt-3 w-full"
          >
            {nube === "guardando" ? "Respaldando…" : "Respaldar mi avance"}
          </button>
          {nube === "ok" && (
            <p className="mt-2 text-sm font-medium text-emerald-700">
              Listo. Entra con tu código desde el otro dispositivo y podrás continuar.
            </p>
          )}
          {nube === "error" && (
            <p className="mt-2 text-sm font-medium text-rose-700">
              No se pudo respaldar; revisa tu conexión e inténtalo otra vez. Tu avance sigue
              guardado en este dispositivo.
            </p>
          )}
        </section>

        {ultimo && (
          <section className="card mt-6 p-4 sm:p-5">
            <h3 className="text-base font-bold text-stone-900">Enviar el taller</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
              Revisa que las dos personas de la pareja estén identificadas y que los dos relatos
              (1.4 y 4.2) estén completos. Después de enviar no puedes editar, pero sí puedes volver a
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
