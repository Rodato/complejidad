import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { leerRespuestas } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EN_PROD = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

function claveValida(recibida: string, esperada: string): boolean {
  const a = Buffer.from(recibida);
  const b = Buffer.from(esperada);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  // La clave viaja por header (no por query) para no quedar en logs/historial.
  const clave = request.headers.get("x-clave") ?? "";
  const esperada = process.env.DASHBOARD_PASSWORD;

  // Fail-closed: en producción sin contraseña configurada, el endpoint NO abre.
  if (EN_PROD && !esperada) {
    return NextResponse.json({ error: "Dashboard sin configurar" }, { status: 503 });
  }
  if (esperada && !claveValida(clave, esperada)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { filas, origen } = await leerRespuestas();
    return NextResponse.json({ filas, origen });
  } catch (e) {
    return NextResponse.json(
      { error: `No se pudo leer la hoja: ${(e as Error).message}` },
      { status: 503 },
    );
  }
}
