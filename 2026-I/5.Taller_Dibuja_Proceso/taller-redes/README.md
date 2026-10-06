# Taller 5 — "Dibuja el proceso"

App interactiva del curso **Introducción a la Complejidad** (Univalle, Daniel Otero).
Los estudiantes exploran la red real de la Notaría 2 de Cali, **dibujan su propia red**
viendo emerger en vivo su distribución de grado, y **narran el proceso**.

Stack: **Next.js 16** (App Router, TS) · **React Flow** (`@xyflow/react`) · **Recharts** ·
**d3-force** · **Google Sheets** (vía service account). Pensado para desplegar en **Vercel**.

## Flujo (3 actos)

1. **Explora la red real** — `data/consolidado_notaria2.csv` (1938–1944) acumulada por año.
2. **Construye tu red** — lienzo drag-and-draw + distribución en vivo + pista de régimen
   (campana ≈ azar vs cola larga ≈ vinculación preferencial).
3. **Escribe la narrativa** — se guarda en Google Sheets (red + secuencia + texto).

`/docente` es el dashboard para proyectar en clase (protegido por contraseña).

## Desarrollo

```bash
npm install
npm run data      # regenera public/data/red.json desde ../../data/consolidado_notaria2.csv
npm run dev       # http://localhost:3000
```

Sin variables de entorno, las respuestas se guardan en un archivo temporal local
(solo para probar). Para Sheets, copiar `.env.example` a `.env.local` y completar.

## Variables de entorno (Vercel)

Ver `.env.example`. Reusa el service account `detective-redes@complejidad-496215`:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (con `\n` literales), `SHEET_ID`
- `SHEET_TAB` (opcional, por defecto `respuestas_taller5`)
- `DASHBOARD_PASSWORD` (contraseña de `/docente`)

## Datos

`public/data/red.json` se genera desde el consolidado con `scripts/build-red-data.mjs`
(reusa la limpieza de nombres del taller en Python). Re-correr `npm run data` si cambian
los datos.

## Notas

- La pista de régimen (CV de los grados) es una **intuición visual**, no una prueba
  estadística de ley de potencia.
- La heurística: CV ≤ 0.5 → campana · CV ≥ 1.0 → cola larga · intermedio en medio.
