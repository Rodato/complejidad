import { NextResponse } from "next/server";
import { guardarRespuesta } from "@/lib/sheets";
import type { PayloadGuardar } from "@/lib/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: PayloadGuardar;
  try {
    payload = (await request.json()) as PayloadGuardar;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!payload?.nombre?.trim() || !payload?.codigo?.trim()) {
    return NextResponse.json({ error: "Faltan nombre o código" }, { status: 400 });
  }
  if (!payload?.respuestas?.a1_relato?.trim() || !payload?.respuestas?.a4_relato?.trim()) {
    return NextResponse.json(
      { error: "Faltan los relatos (ejercicios 1.4 y 4.2)" },
      { status: 400 },
    );
  }

  const r = await guardarRespuesta(payload);
  // 503 cuando no se persistió de verdad (p. ej. Sheets sin configurar en producción).
  return NextResponse.json(r, { status: r.ok ? 200 : 503 });
}
