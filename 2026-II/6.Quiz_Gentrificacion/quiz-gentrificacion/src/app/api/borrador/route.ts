import { NextResponse } from "next/server";
import { guardarBorrador, leerBorrador } from "@/lib/sheets";
import type { PayloadBorrador } from "@/lib/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/borrador?codigo=2030456 — recupera el avance de ese código, si existe. */
export async function GET(request: Request) {
  const codigo = new URL(request.url).searchParams.get("codigo")?.trim();
  if (!codigo) {
    return NextResponse.json({ error: "Falta el código" }, { status: 400 });
  }
  try {
    const borrador = await leerBorrador(codigo);
    return NextResponse.json({ borrador });
  } catch (e) {
    return NextResponse.json(
      { error: `No se pudo consultar el borrador: ${(e as Error).message}` },
      { status: 503 },
    );
  }
}

/** POST /api/borrador — guarda (sobrescribe) el avance de ese código. */
export async function POST(request: Request) {
  let p: PayloadBorrador;
  try {
    p = (await request.json()) as PayloadBorrador;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!p?.codigo?.trim()) {
    return NextResponse.json({ error: "Falta el código" }, { status: 400 });
  }

  const r = await guardarBorrador(p);
  return NextResponse.json(r, { status: r.ok ? 200 : 503 });
}
