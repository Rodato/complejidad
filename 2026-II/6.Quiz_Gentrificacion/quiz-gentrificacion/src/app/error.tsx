"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold text-stone-800">Algo se rompió</h1>
      <p className="text-sm text-stone-600">
        Tus respuestas quedaron guardadas en este dispositivo. Recarga e intenta de nuevo.
      </p>
      <button onClick={reset} className="btn btn-primary">
        Reintentar
      </button>
    </main>
  );
}
