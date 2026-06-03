"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-slate-800">Algo salió mal</h1>
      <p className="text-sm text-slate-500">
        Ocurrió un error inesperado. Tu trabajo queda respaldado en este navegador; recarga
        para continuar.
      </p>
      <button onClick={reset} className="btn btn-primary">
        Reintentar
      </button>
    </div>
  );
}
