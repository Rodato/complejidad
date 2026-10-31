"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cerca } from "@/lib/datos";

/** Encabezado de una parte del taller. */
export function CabezaParte({
  numero,
  titulo,
  bajada,
}: {
  numero: number;
  titulo: string;
  bajada: string;
}) {
  return (
    <header className="mb-6">
      <p className="eyebrow">Parte {numero}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
        {titulo}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-stone-600">{bajada}</p>
    </header>
  );
}

/** Tarjeta de definición: lo que el taller enseña. */
export function Definicion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="definicion mb-6">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-800">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3ZM9.5 20h5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {titulo}
      </h3>
      <div className="prosa text-[15px] [&>p:last-child]:mb-0">{children}</div>
    </section>
  );
}

/** Enunciado de un ejercicio, numerado. */
export function Ejercicio({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card mb-5 p-4 sm:p-5">
      <h3 className="mb-3 text-base font-bold text-stone-900">
        <span className="mr-2 text-brand-600">{numero}</span>
        {titulo}
      </h3>
      {children}
    </section>
  );
}

/** Grupo de opciones excluyentes, con objetivos táctiles grandes. */
export function Opciones<T extends string>({
  opciones,
  valor,
  onChange,
  columnas = false,
}: {
  opciones: { clave: T; nombre: string }[];
  valor: T | "";
  onChange: (v: T) => void;
  columnas?: boolean;
}) {
  return (
    <div className={columnas ? "flex flex-col gap-2" : "flex flex-wrap gap-2"}>
      {opciones.map((o) => (
        <button
          key={o.clave}
          type="button"
          onClick={() => onChange(o.clave)}
          aria-pressed={valor === o.clave}
          className={`opcion ${valor === o.clave ? "opcion-activa" : "hover:bg-stone-50"}`}
        >
          {o.nombre}
        </button>
      ))}
    </div>
  );
}

/**
 * Deshabilita pegar y arrastrar texto dentro de un campo de respuesta: el taller
 * se responde escribiendo. No es una barrera infranqueable —ninguna lo es en el
 * navegador— pero quita el camino fácil de traer una respuesta ya escrita.
 *
 * Se cierran tres vías: `paste` (Ctrl+V, menú contextual, «Pegar» del celular),
 * `drop` (arrastrar texto hasta el campo) y `beforeinput` con tipo de inserción
 * pegada, que es por donde entra la sugerencia de portapapeles del teclado en
 * Android sin disparar `paste`. El aviso existe para que el campo no parezca
 * dañado cuando no pasa nada al intentarlo.
 */
function useSinPegar<T extends HTMLElement>(activo = true) {
  const ref = useRef<T>(null);
  const [aviso, setAviso] = useState(false);
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avisar = useCallback(() => {
    setAviso(true);
    if (reloj.current) clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setAviso(false), 4000);
  }, []);

  useEffect(() => {
    const campo = ref.current;
    if (!activo) return;
    const alInsertar = (e: Event) => {
      const tipo = (e as InputEvent).inputType;
      if (
        tipo === "insertFromPaste" ||
        tipo === "insertFromPasteAsQuotation" ||
        tipo === "insertFromDrop"
      ) {
        e.preventDefault();
        avisar();
      }
    };
    campo?.addEventListener("beforeinput", alInsertar);
    return () => {
      campo?.removeEventListener("beforeinput", alInsertar);
      if (reloj.current) clearTimeout(reloj.current);
    };
  }, [avisar, activo]);

  const bloquear = (e: React.SyntheticEvent) => {
    e.preventDefault();
    avisar();
  };

  return {
    ref,
    props: activo ? { onPaste: bloquear, onDrop: bloquear } : {},
    aviso: aviso ? (
      <span className="text-xs font-medium text-brand-700">
        Pegar está desactivado: escribe la respuesta con tus palabras.
      </span>
    ) : null,
  };
}

/** Campo de texto largo con contador opcional de palabras. */
export function Texto({
  label,
  ayuda,
  valor,
  onChange,
  filas = 4,
  minPalabras,
  maxPalabras,
  placeholder,
  permitirPegar = false,
}: {
  label: string;
  ayuda?: string;
  valor: string;
  onChange: (v: string) => void;
  filas?: number;
  minPalabras?: number;
  maxPalabras?: number;
  placeholder?: string;
  permitirPegar?: boolean;
}) {
  const { ref, props: sinPegar, aviso } = useSinPegar<HTMLTextAreaElement>(!permitirPegar);
  const palabras = valor.trim() ? valor.trim().split(/\s+/).length : 0;
  const corto = minPalabras !== undefined && palabras > 0 && palabras < minPalabras;
  const largo = maxPalabras !== undefined && palabras > maxPalabras;

  return (
    <label className="mb-4 flex flex-col gap-1.5 last:mb-0">
      <span className="text-[15px] font-medium text-stone-800">{label}</span>
      {ayuda && <span className="text-sm leading-relaxed text-stone-500">{ayuda}</span>}
      <textarea
        ref={ref}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        rows={filas}
        placeholder={placeholder}
        className="field resize-y"
        {...sinPegar}
      />
      {aviso}
      {(minPalabras !== undefined || maxPalabras !== undefined) && (
        <span
          className={`text-xs ${corto || largo ? "text-brand-700" : "text-stone-400"}`}
        >
          {palabras} palabra{palabras === 1 ? "" : "s"}
          {minPalabras !== undefined && maxPalabras !== undefined
            ? ` · se piden entre ${minPalabras} y ${maxPalabras}`
            : ""}
        </span>
      )}
    </label>
  );
}

/** Campo corto de una línea (para leer cifras de la infografía). */
export function Campo({
  label,
  valor,
  onChange,
  placeholder,
  numerico = false,
  permitirPegar = false,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Abre el teclado numérico en el celular. Para conteos y distancias. */
  numerico?: boolean;
  /** Para enlaces y referencias, que nadie debería tener que teclear a mano. */
  permitirPegar?: boolean;
}) {
  const { ref, props: sinPegar, aviso } = useSinPegar<HTMLInputElement>(!permitirPegar);

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[15px] font-medium text-stone-800">{label}</span>
      <input
        ref={ref}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={numerico ? 8 : 160}
        inputMode={numerico ? "decimal" : undefined}
        className="field"
        {...sinPegar}
      />
      {aviso}
    </label>
  );
}

/**
 * Bloque que solo se revela cuando el estudiante ya respondió: primero piensa,
 * después ve la explicación. Es un taller guiado, así que la retroalimentación
 * forma parte del contenido, pero no debe llegar antes de tiempo.
 */
export function Revelable({
  habilitado,
  etiqueta,
  children,
}: {
  habilitado: boolean;
  etiqueta: string;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  if (!habilitado) {
    return (
      <p className="mt-3 text-sm text-stone-400">
        Responde todo para ver la retroalimentación.
      </p>
    );
  }
  return (
    <div className="mt-3">
      {!abierto ? (
        <button onClick={() => setAbierto(true)} className="btn btn-secondary w-full">
          {etiqueta}
        </button>
      ) : (
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">{children}</div>
      )}
    </div>
  );
}

/** Lista desplegable nativa: en el celular abre el selector del sistema, que es cómodo. */
export function Selector({
  label,
  valor,
  onChange,
  opciones,
  vacio = "Elige…",
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  opciones: { clave: string; nombre: string }[];
  vacio?: string;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)} className="field py-2">
        <option value="">{vacio}</option>
        {opciones.map((o) => (
          <option key={o.clave} value={o.clave}>
            {o.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Marco para una red: fondo blanco, borde, y una línea de ayuda debajo. */
export function Lienzo({ children, pie }: { children: React.ReactNode; pie?: React.ReactNode }) {
  return (
    <figure className="mb-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="p-1">{children}</div>
      {pie && (
        <figcaption className="border-t border-stone-100 bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-500">
          {pie}
        </figcaption>
      )}
    </figure>
  );
}

/** Aviso de corrección inmediata (verde si está bien, terracota si no). */
export function Veredicto({ bien, children }: { bien: boolean; children: React.ReactNode }) {
  return (
    <p
      className={`mt-2 rounded-lg px-3 py-2 text-sm leading-relaxed ${
        bien ? "bg-emerald-50 text-emerald-800" : "bg-brand-50 text-brand-800"
      }`}
    >
      {children}
    </p>
  );
}

/** Una cifra grande con su etiqueta: para los tableros de cada temporada o año. */
export function Cifra({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-2 py-2">
      <p className="text-xl font-bold tabular-nums text-stone-900">{valor}</p>
      <p className="text-xs text-stone-500">{etiqueta}</p>
    </div>
  );
}

/** Cita textual de una lectura, con su página. */
export function Cita({
  fuente,
  children,
}: {
  fuente: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="mb-3 rounded-lg border-l-4 border-brand-300 bg-white px-4 py-3 shadow-sm">
      <blockquote className="text-[15px] leading-relaxed text-stone-800 [&>p+p]:mt-2">
        {children}
      </blockquote>
      <figcaption className="mt-2 text-xs font-medium text-stone-500">{fuente}</figcaption>
    </figure>
  );
}

/**
 * Pregunta de cálculo: un campo numérico y, en cuanto hay algo escrito, si la cifra cae
 * cerca de la esperada. Acepta coma o punto decimal, y signos de pesos o porcentaje.
 */
export function Calculo({
  label,
  valor,
  onChange,
  esperado,
  tolerancia = 0.05,
  bien,
  mal,
  placeholder,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  /** Una o varias cifras válidas (p. ej. en millones o en pesos). */
  esperado: number | number[];
  tolerancia?: number;
  bien: React.ReactNode;
  mal: React.ReactNode;
  placeholder?: string;
}) {
  const opciones = Array.isArray(esperado) ? esperado : [esperado];
  const escrito = /\d/.test(valor);
  const acierta = escrito && opciones.some((e) => cerca(valor, e, tolerancia));
  return (
    <div className="mb-4 last:mb-0">
      <Campo label={label} valor={valor} onChange={onChange} placeholder={placeholder} numerico />
      {escrito && <Veredicto bien={acierta}>{acierta ? bien : mal}</Veredicto>}
    </div>
  );
}

/** Tabla compacta y legible en el celular. */
export function Tabla({
  columnas,
  filas,
  pie,
}: {
  columnas: { titulo: string; derecha?: boolean }[];
  filas: React.ReactNode[][];
  pie?: React.ReactNode;
}) {
  return (
    <figure className="mb-4 overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50">
            {columnas.map((c) => (
              <th
                key={c.titulo}
                className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500 ${c.derecha ? "text-right" : ""}`}
              >
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className="border-b border-stone-100 last:border-0">
              {f.map((celda, j) => (
                <td
                  key={j}
                  className={`px-3 py-2 align-top text-stone-700 ${columnas[j]?.derecha ? "text-right tabular-nums" : ""}`}
                >
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pie && (
        <figcaption className="border-t border-stone-100 bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-500">
          {pie}
        </figcaption>
      )}
    </figure>
  );
}

/** Lo que estos datos no permiten afirmar: va en cada parte, a la vista. */
export function Limite({ children }: { children: React.ReactNode }) {
  return (
    <aside className="mb-5 rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-sm leading-relaxed text-stone-600">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
        Lo que estos datos no dicen
      </p>
      {children}
    </aside>
  );
}
