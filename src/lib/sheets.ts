// Persistencia en Google Sheets (con fallback local efímero solo para desarrollo).
// Reutiliza el service account del curso (detective-redes@complejidad-496215) y el
// mismo spreadsheet de los talleres anteriores, en una pestaña propia.

import { google } from "googleapis";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { COLUMNAS, COLUMNAS_BORRADOR } from "./columnas";
import type { BorradorGuardado, PayloadBorrador, PayloadGuardar, Respuestas } from "./tipos";

export { COLUMNAS };

const EN_PROD = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

const NOMBRE_HOJA = process.env.SHEET_TAB || "taller_sismo";
const ARCHIVO_LOCAL = path.join(os.tmpdir(), "taller_sismo_respuestas.json");

// Los borradores en curso van en su propia pestaña, derivada del nombre de la principal.
const HOJA_BORRADORES = `${NOMBRE_HOJA}_borradores`;

export function tieneCredenciales(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.SHEET_ID,
  );
}

function getSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function asegurarHoja(
  sheets: ReturnType<typeof getSheets>,
  titulo: string = NOMBRE_HOJA,
  encabezado: readonly string[] = COLUMNAS,
) {
  const spreadsheetId = process.env.SHEET_ID!;
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existe = meta.data.sheets?.some((s) => s.properties?.title === titulo);
  if (!existe) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: titulo } } }] },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${titulo}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...encabezado]] },
    });
  }
}

export function payloadAFila(p: PayloadGuardar): string[] {
  const r = p.respuestas;
  return [
    new Date().toISOString(),
    p.nombre,
    p.codigo,
    p.pareja,
    p.escenario_id,
    p.escenario_titulo,
    JSON.stringify(r.a1_clasificacion),
    String(p.a1_aciertos),
    r.a1_puede_cambiar,
    JSON.stringify(r.a2_cronologia),
    String(p.a2_n_conocer),
    String(p.a2_n_actuar),
    r.a2_patron,
    r.a2_demuestra,
    r.a2_problema,
    r.a3_indice_colapsos,
    r.a3_comunas_top,
    r.a3_fallecidos_prom,
    r.a3_fallecidos_rango,
    r.a3_comuna_perdidas,
    r.a3_comuna_fallecidos,
    r.a3_desacople,
    r.a3_rango_significa,
    r.a3_no_linealidad,
    JSON.stringify(r.a4_lazo),
    r.a4_donde_rompe,
    r.a4_argumento,
    r.a4_modelo_vs_dano,
    r.a4_ensayo_2004,
  ];
}

export async function guardarRespuesta(
  p: PayloadGuardar,
): Promise<{ ok: boolean; destino: "sheets" | "local"; error?: string }> {
  const fila = payloadAFila(p);

  if (tieneCredenciales()) {
    try {
      const sheets = getSheets();
      await asegurarHoja(sheets);
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID!,
        range: `${NOMBRE_HOJA}!A1`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [fila] },
      });
      return { ok: true, destino: "sheets" };
    } catch (e) {
      // En producción el fallback local (/tmp) es efímero: NO declarar éxito.
      guardarLocal(fila);
      return {
        ok: !EN_PROD,
        destino: "local",
        error: `Error escribiendo a Sheets: ${(e as Error).message}`,
      };
    }
  }

  // Sin credenciales: solo es un camino válido en desarrollo.
  guardarLocal(fila);
  return {
    ok: !EN_PROD,
    destino: "local",
    error: EN_PROD ? "Almacenamiento no configurado (faltan credenciales de Sheets)." : undefined,
  };
}

function guardarLocal(fila: string[]) {
  let filas: string[][] = [];
  try {
    if (fs.existsSync(ARCHIVO_LOCAL)) {
      filas = JSON.parse(fs.readFileSync(ARCHIVO_LOCAL, "utf8"));
    }
  } catch {}
  filas.push(fila);
  fs.writeFileSync(ARCHIVO_LOCAL, JSON.stringify(filas));
}

// ─────────────────────────────────────────────────────────────────────────────
// Borradores en curso, indexados por código
//
// Permiten que una pareja empiece en el celular y siga en otro equipo. Es una fila
// por código que se sobrescribe, no un histórico: gana la última escritura. Si la
// misma pareja trabaja en dos aparatos a la vez, el segundo pisa al primero.
// ─────────────────────────────────────────────────────────────────────────────

/** Normaliza el código para que "2030456 " y "2030456" sean la misma fila. */
function claveCodigo(codigo: string): string {
  return codigo.trim().toLowerCase();
}

/** Fila 1-based de un código en la pestaña de borradores, o null si aún no existe. */
async function filaDeCodigo(
  sheets: ReturnType<typeof getSheets>,
  codigo: string,
): Promise<number | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID!,
    range: `${HOJA_BORRADORES}!A:A`,
  });
  const filas = res.data.values ?? [];
  const objetivo = claveCodigo(codigo);
  for (let i = 1; i < filas.length; i++) {
    if (claveCodigo(String(filas[i]?.[0] ?? "")) === objetivo) return i + 1;
  }
  return null;
}

export async function guardarBorrador(
  p: PayloadBorrador,
): Promise<{ ok: boolean; error?: string }> {
  if (!tieneCredenciales()) {
    return { ok: false, error: "Almacenamiento no configurado." };
  }
  const fila = [
    p.codigo.trim(),
    new Date().toISOString(),
    p.nombre,
    p.pareja,
    String(p.acto),
    JSON.stringify(p.respuestas),
  ];
  try {
    const sheets = getSheets();
    await asegurarHoja(sheets, HOJA_BORRADORES, COLUMNAS_BORRADOR);
    const fi = await filaDeCodigo(sheets, p.codigo);
    if (fi === null) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID!,
        range: `${HOJA_BORRADORES}!A1`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [fila] },
      });
    } else {
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SHEET_ID!,
        range: `${HOJA_BORRADORES}!A${fi}:F${fi}`,
        valueInputOption: "RAW",
        requestBody: { values: [fila] },
      });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function leerBorrador(codigo: string): Promise<BorradorGuardado | null> {
  if (!tieneCredenciales()) return null;
  const sheets = getSheets();
  await asegurarHoja(sheets, HOJA_BORRADORES, COLUMNAS_BORRADOR);
  const fi = await filaDeCodigo(sheets, codigo);
  if (fi === null) return null;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID!,
    range: `${HOJA_BORRADORES}!A${fi}:F${fi}`,
  });
  const f = res.data.values?.[0];
  if (!f) return null;

  let respuestas: Respuestas;
  try {
    respuestas = JSON.parse(String(f[5] ?? "{}")) as Respuestas;
  } catch {
    return null; // borrador corrupto: mejor no ofrecer nada que ofrecer basura
  }
  const acto = Number(f[4]);
  return {
    nombre: String(f[2] ?? ""),
    pareja: String(f[3] ?? ""),
    acto: Number.isInteger(acto) && acto >= 0 && acto <= 3 ? acto : 0,
    actualizado: String(f[1] ?? ""),
    respuestas,
  };
}
