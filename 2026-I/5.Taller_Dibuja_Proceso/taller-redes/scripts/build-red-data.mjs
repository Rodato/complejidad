// Genera public/data/red.json a partir del consolidado de la Notaría 2.
//
// Reusa la lógica de limpieza de 3. Inmobilliario/lib/data.py (normalize_name):
// minúsculas, trim, colapsar espacios internos; descarta filas sin vendedor/
// comprador y self-loops. Emite una edge list mínima para la red real:
//   [{ source, target, anio:number, valor:number|null }]
//
// Re-ejecutable:  node scripts/build-red-data.mjs
// (volver a correr si se actualiza data/consolidado_notaria2.csv)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const CSV = path.resolve(aqui, "../../../../data/consolidado_notaria2.csv");
const SALIDA = path.resolve(aqui, "../public/data/red.json");

const NA = new Set(["", "na", "n/a", "nan", "none", "null"]);

function normalizarNombre(s) {
  if (s == null) return null;
  const limpio = String(s).trim().toLowerCase().replace(/\s+/g, " ");
  return NA.has(limpio) ? null : limpio;
}

function parseAnio(s) {
  const m = String(s ?? "").match(/\d{4}/);
  return m ? Number(m[0]) : null;
}

function parseValor(s) {
  if (s == null || String(s).trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const texto = fs.readFileSync(CSV, "utf8");
const { data, errors } = Papa.parse(texto, {
  header: true,
  skipEmptyLines: true,
});
if (errors.length) {
  console.warn(`Avisos del parser: ${errors.length} (se continúa)`);
}

const edges = [];
let descartadas = 0;
let selfLoops = 0;
for (const fila of data) {
  const source = normalizarNombre(fila.vendedor);
  const target = normalizarNombre(fila.comprador);
  if (!source || !target) {
    descartadas++;
    continue;
  }
  if (source === target) {
    selfLoops++;
    continue;
  }
  edges.push({
    source,
    target,
    anio: parseAnio(fila.anio ?? fila.fecha),
    valor: parseValor(fila.valor_num),
  });
}

fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
fs.writeFileSync(SALIDA, JSON.stringify(edges, null, 0));

const nodos = new Set(edges.flatMap((e) => [e.source, e.target]));
const anios = [...new Set(edges.map((e) => e.anio).filter(Boolean))].sort();
console.log(`Filas leídas:      ${data.length}`);
console.log(`Aristas válidas:   ${edges.length}`);
console.log(`Descartadas (s/v): ${descartadas}  | self-loops: ${selfLoops}`);
console.log(`Actores únicos:    ${nodos.size}`);
console.log(`Años:              ${anios.join(", ")}`);
console.log(`Salida:            ${path.relative(process.cwd(), SALIDA)}`);
