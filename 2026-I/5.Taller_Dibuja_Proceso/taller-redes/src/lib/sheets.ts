// Persistencia en Google Sheets (con fallback local efímero para desarrollo).
// Reutiliza el service account del taller existente (detective-redes@complejidad-496215),
// configurado vía variables de entorno. Análogo a 3. Inmobilliario/lib/storage.py.

import { google } from "googleapis";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { COLUMNAS } from "./columnas";
import type { PayloadGuardar } from "./tipos";

export { COLUMNAS };

const EN_PROD = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

const NOMBRE_HOJA = process.env.SHEET_TAB || "respuestas_taller5";
const ARCHIVO_LOCAL = path.join(os.tmpdir(), "taller5_respuestas.json");

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
  const existe = meta.data.sheets?.some(
    (s) => s.properties?.title === NOMBRE_HOJA,
  );
  if (!existe) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: NOMBRE_HOJA } } }],
      },
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
  return [
    new Date().toISOString(),
    p.nombre,
    p.codigo,
    p.companeros,
    String(p.n_nodos),
    String(p.n_aristas),
    String(p.grado_max),
    String(p.grado_promedio),
    p.regimen,
    p.regimen_clave,
    JSON.stringify(p.secuencia_construccion),
    JSON.stringify(p.grafo),
    p.narrativa,
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
      return { ok: !EN_PROD, destino: "local", error: `Error escribiendo a Sheets: ${(e as Error).message}` };
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

export type Respuesta = Record<(typeof COLUMNAS)[number], string>;

export async function leerRespuestas(): Promise<{
  filas: Respuesta[];
  origen: "sheets" | "local";
}> {
  if (tieneCredenciales()) {
    try {
      const sheets = getSheets();
      await asegurarHoja(sheets); // crea la pestaña si aún no existe (lectura antes del primer guardado)
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID!,
        range: NOMBRE_HOJA,
      });
      const valores = res.data.values ?? [];
      return { filas: aObjetos(valores), origen: "sheets" };
    } catch (e) {
      // En prod NO enmascarar el fallo cayendo a un local vacío: propagar.
      if (EN_PROD) throw e;
    }
  }
  let filas: string[][] = [];
  try {
    if (fs.existsSync(ARCHIVO_LOCAL)) {
      filas = JSON.parse(fs.readFileSync(ARCHIVO_LOCAL, "utf8"));
    }
  } catch {}
  return { filas: aObjetos([[...COLUMNAS], ...filas]), origen: "local" };
}

function aObjetos(valores: string[][]): Respuesta[] {
  if (valores.length < 2) return [];
  const [encabezado, ...resto] = valores;
  return resto.map((fila) => {
    const obj = {} as Respuesta;
    encabezado.forEach((col, i) => {
      (obj as Record<string, string>)[col] = fila[i] ?? "";
    });
    return obj;
  });
}
