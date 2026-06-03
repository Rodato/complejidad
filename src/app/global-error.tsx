"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="es">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420, padding: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>La aplicación falló</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>
            Recarga la página para volver al taller.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
