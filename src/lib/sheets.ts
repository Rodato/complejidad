// Persistencia en Google Sheets (con fallback local efímero solo para desarrollo).
// Reutiliza el service account del curso (detective-redes@complejidad-496215) y el
// mismo spreadsheet de los talleres anteriores, en una pestaña propia.

import { google } from "googleapis";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { COLUMNAS } from "./columnas";
import type { PayloadGuardar } from "./tipos";

export { COLUMNAS };

const EN_PROD = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

const NOMBRE_HOJA = process.env.SHEET_TAB || "taller_sismo";
const ARCHIVO_LOCAL = path.join(os.tmpdir(), "taller_sismo_respuestas.json");

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

async function asegurarHoja(sheets: ReturnType<typeof getSheets>) {
  const spreadsheetId = process.env.SHEET_ID!;
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existe = meta.data.sheets?.some((s) => s.properties?.title === NOMBRE_HOJA);
  if (!existe) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: NOMBRE_HOJA } } }] },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${NOMBRE_HOJA}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...COLUMNAS]] },
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
