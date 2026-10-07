# Taller 2 · Nodos, vínculos y poder

App web del segundo taller de **Introducción a la Complejidad 2026-II** (Universidad del
Valle). Taller **guiado** de teoría de redes básica: nodo, vínculo, dirección, grado,
camino, componente, agrupamiento y cuatro medidas de centralidad. Acompaña las lecturas de
Jackson (2010, cap. 1, las familias florentinas) y Jackson (2019, cap. 2, «Poder e
influencia: posiciones centrales en las redes»).

Igual que el Taller 1, está pensada para **celular**: clases virtuales tras el terremoto
del 10 de agosto, sin sala de cómputo. Se empieza en clase y se termina en la semana.

## Los cinco actos

| Acto | Título | Red | Qué produce el estudiante |
|---|---|---|---|
| 1 | Qué es una red | Florencia | Cuenta nodos y vínculos · encuentra el matrimonio que le falta al dibujo comparándolo con la lista de vínculos (Castellani–Barbadori) · dirigido vs. no dirigido · «una red es una decisión»: qué otra relación entre familias cambiaría la red |
| 2 | Contar vínculos: el grado | Florencia | Grado de Medici, Strozzi y su familia · ¿alcanza con contar? (el grado dirigido y la acumulación quedan anunciados para el Taller 3) |
| 3 | Caminos, puentes y huecos | Florencia | Arma tocando el camino más corto Pazzi → Lamberteschi · quita familias y cuenta componentes · cuenta triángulos · explica la frase de Padgett y Ansell |
| 4 | Cuatro maneras de ser central | Florencia | Intermediación a mano (el ejemplo Barbadori–Guadagni del libro) · compara las 4 medidas · lee la posición de su familia · **argumento de 150–250 palabras: ¿por qué los Medici y no los Strozzi?** |
| 5 | Cuando la red no cabe en la mano | Juego de tronos, libro 1 (187 personajes) | Quién es primero en todo · encuentra al puente fuera del núcleo (Daenerys) y su contrario (Meñique) · puente a Cali: qué medida usaría para encontrar «los Medici de Cali» |

**Las cifras que estructuran el taller** (verificadas contra igraph, ver abajo):

- Florencia: Medici grado 6, intermediación **0,522**; Strozzi grado 4, intermediación
  **0,103**, pero vector propio **0,827** (segundos). Los Strozzi están bien conectados con
  gente bien conectada; no son puente. Sin los Medici la red se parte en 3; sin los Strozzi
  sigue entera. Agrupamiento: Medici 1/15 = 0,07; Strozzi 2/6 = 0,33.
- Riqueza (1427, miles de liras): Strozzi 146, Medici 103. Priorías: Strozzi 74, Medici 53.
- Juego de tronos: Eddard Stark es 1.º en las cuatro medidas. Daenerys es 6.ª en
  intermediación y 49.ª en vector propio (la «Medici» de Poniente, puente a la trama
  Dothraki). Petyr Baelish es lo contrario: 8.º en vector propio, 43.º en intermediación
  (un «Strozzi»).

## Despliegue

- **URL para estudiantes:** https://complejidad-taller2-redes.vercel.app
- **Repo:** el monorepo `Rodato/complejidad` (rama `main`), carpeta
  `2026-II/2.Taller_Redes/taller-redes`. Antes, `Rodato/complejidad-taller2-redes`.
- **Vercel:** proyecto `complejidad-taller2-redes` (scope `rodatos-projects`), con GitHub
  conectado al monorepo: **un push a `main` redespliega solo**. `vercel.json` fija el preset de Next.js:
  el proyecto se creó vacío y quedó en «Other», que da 404 en todo.
- Variables de entorno solo en production, las mismas del Taller 1 con `SHEET_TAB=taller_redes`.

## Asignación de familias

Cada pareja sigue una de las **13 familias** (todas menos Medici y Strozzi, que son las
que compara todo el mundo), elegida por el hash del código del estudiante que registra
(`familiaPara()` en `src/lib/contenido.ts`, misma función que `escenarioPara()` del
Taller 1). Estable entre dispositivos.

## Datos

- `datos/florentine.RData` — del paquete `ergm` (statnet). Matrimonios de Padgett y Ansell
  (1993), el subconjunto de 16 familias de Wasserman y Faust que usa Jackson. Se deja fuera
  a los Pucci (sin matrimonios), como Jackson; por eso las cifras coinciden con el libro.
  Las priorías en 0 pueden ser «sin dato» en la fuente: el taller solo cita las de Medici
  y Strozzi.
- `datos/asoiaf-book1-edges.csv` — Beveridge y Shan, «Network of Thrones»
  (github.com/mathbeveridge/asoiaf), **CC BY-NC-SA 4.0**. La atribución aparece en la app.
- Hubo un primer Acto 1 con seis escrituras reales de la Notaría 2 (componente de
  Francisco Caicedo B.). Se sacó para que el taller quedara todo en Florencia y está
  guardado en `../reserva_taller3/` para abrir el Taller 3.

`scripts/preparar_datos.R` genera `src/data/medici.json` y `src/data/got.json` (posiciones
fijas con semilla, layout de estrés para GoT) e imprime las métricas de igraph. Las
métricas de la app las calcula `src/lib/red.ts` en el navegador; se verificaron contra esa
salida y coinciden en todos los valores.

```bash
Rscript scripts/preparar_datos.R   # requiere igraph, jsonlite, graphlayouts
```

## Stack y estructura

Next.js 16 + Tailwind 4 + `googleapis`, la misma base del Taller 1. Sin librerías de
grafos: `src/components/Red.tsx` dibuja en SVG (flechas, vínculos dobles curvos, tocar
un nodo resalta a sus vecinos, caminos, nodos quitados, tamaño por medida).

```
src/
├── app/page.tsx           Estado, navegación, autoguardado y envío (igual al Taller 1)
├── components/
│   ├── Red.tsx            La red en SVG
│   ├── Acto1Escrituras.tsx … Acto5Thrones.tsx
│   ├── Registro.tsx, ui.tsx
├── data/                  medici.json, got.json (generados)
└── lib/
    ├── contenido.ts       Escrituras, relaciones, familias, asignación, fuentes
    ├── red.ts             Métricas: grado, distancias, componentes, agrupamiento,
    │                      intermediación (Brandes), cercanía, vector propio
    ├── tipos.ts, columnas.ts, claves.ts
    └── sheets.ts          Persistencia (fail-closed en producción)
```

## Almacenamiento y continuidad

Idéntico al Taller 1 (ver su README): Google Sheets, mismo spreadsheet y service account,
pestaña **`taller_redes`** (una fila por entrega, 34 columnas) y **`taller_redes_borradores`**
(una fila por código). Borrador local atado al código + respaldo en servidor para cambiar
de dispositivo. La única respuesta obligatoria para enviar es `a4_argumento`.

Columnas que se califican: `a1_otra_relacion`, `a2_grado_basta`, `a3_huecos`,
`a4_familia_lectura`, **`a4_argumento`**, `a5_puente_porque`, `a5_cali`. Las demás son
conteos con respuesta única, verificables contra las cifras de arriba (`a1_aciertos`
= aciertos en dirigido/no dirigido, de 5, viene precalculada).

⚠️ Para probar en el celular por la red local no sirve `npm run dev` (mismo problema del
Taller 1): usar `npm run build && npx next start -H 0.0.0.0`.
