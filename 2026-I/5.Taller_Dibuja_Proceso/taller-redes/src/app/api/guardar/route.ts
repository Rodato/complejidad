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
    return NextResponse.json(
      { error: "Faltan nombre o código" },
      { status: 400 },
    );
  }
  if (!payload?.narrativa?.trim()) {
    return NextResponse.json(
      { error: "La narrativa está vacía" },
      { status: 400 },
    );
  }

  const r = await guardarRespuesta(payload);
  // 503 cuando no se persistió de verdad (p.ej. Sheets sin configurar en prod).
  return NextResponse.json(r, { status: r.ok ? 200 : 503 });
}
