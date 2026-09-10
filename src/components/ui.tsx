"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Encabezado de un acto. */
export function CabezaActo({
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
      <p className="eyebrow">Acto {numero}</p>
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
function useSinPegar<T extends HTMLElement>() {
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
  }, [avisar]);

  const bloquear = (e: React.SyntheticEvent) => {
    e.preventDefault();
    avisar();
  };

  return {
    ref,
    props: { onPaste: bloquear, onDrop: bloquear },
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
}: {
  label: string;
  ayuda?: string;
  valor: string;
  onChange: (v: string) => void;
  filas?: number;
  minPalabras?: number;
  maxPalabras?: number;
  placeholder?: string;
}) {
  const sinPegar = useSinPegar<HTMLTextAreaElement>();
  const palabras = valor.trim() ? valor.trim().split(/\s+/).length : 0;
  const corto = minPalabras !== undefined && palabras > 0 && palabras < minPalabras;
  const largo = maxPalabras !== undefined && palabras > maxPalabras;

  return (
    <label className="mb-4 flex flex-col gap-1.5 last:mb-0">
      <span className="text-[15px] font-medium text-stone-800">{label}</span>
      {ayuda && <span className="text-sm leading-relaxed text-stone-500">{ayuda}</span>}
      <textarea
        ref={sinPegar.ref}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        rows={filas}
        placeholder={placeholder}
        className="field resize-y"
        {...sinPegar.props}
      />
      {sinPegar.aviso}
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
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const sinPegar = useSinPegar<HTMLInputElement>();

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[15px] font-medium text-stone-800">{label}</span>
      <input
        ref={sinPegar.ref}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={160}
        className="field"
        {...sinPegar.props}
      />
      {sinPegar.aviso}
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

/**
 * Imagen a pantalla completa para leer las infografías del TREQ en celular.
 * El visor abre "ajustado" (la página completa, para ubicarse) y de ahí se pasa a
 * "ampliado" (ancho fijo grande, con scroll) que es donde se leen las cifras.
 */
export function ImagenAmpliable({ src, alt }: { src: string; alt: string }) {
  const [abierta, setAbierta] = useState(false);
  const [ampliada, setAmpliada] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  // El modo se reinicia desde los handlers (no desde un efecto): cada vez que se
  // abre el visor, se empieza viendo la infografía completa.
  const abrir = () => {
    setAmpliada(false);
    setAbierta(true);
  };
  const cerrar = () => {
    setAmpliada(false);
    setAbierta(false);
  };

  useEffect(() => {
    if (!abierta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [abierta]);

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="block w-full overflow-hidden rounded-lg border border-stone-200 bg-white"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full" />
        <span className="block bg-stone-100 py-2 text-center text-xs font-medium text-stone-600">
          Tocar para ampliar y hacer zoom
        </span>
      </button>

      {abierta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-50 flex flex-col bg-stone-900"
        >
          <div className="flex shrink-0 items-center justify-between gap-2 p-3">
            <button
              onClick={() => setAmpliada((v) => !v)}
              className="btn bg-white/15 text-white hover:bg-white/25"
            >
              {ampliada ? "Ver completa" : "Ampliar para leer cifras"}
            </button>
            <button
              ref={cerrarRef}
              onClick={cerrar}
              className="btn bg-white/15 text-white hover:bg-white/25"
            >
              Cerrar ✕
            </button>
          </div>
          <div
            className={`flex-1 p-2 ${
              ampliada ? "overflow-auto" : "flex items-center justify-center overflow-hidden"
            }`}
          >
            {/* Ampliada: ancho fijo grande y scroll en ambos ejes, que es como se leen las
                cifras en un celular. Ajustada: la página entera, para ubicarse primero. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className={
                ampliada
                  ? "h-auto w-auto min-w-[1500px] max-w-none"
                  : "mx-auto max-h-full w-full object-contain"
              }
            />
          </div>
          <p className="shrink-0 px-3 pb-3 text-center text-xs text-white/60">
            {ampliada
              ? "Desliza en cualquier dirección para recorrer la infografía."
              : "Toca «Ampliar» para poder leer los números."}
          </p>
        </div>
      )}
    </>
  );
}
