# Taller 1 · Cali ante el espejo del terremoto

App web del primer taller de **Introducción a la Complejidad 2026-II** (Universidad del
Valle). Taller **guiado** de lectura y uso de textos: los estudiantes leen una nota crítica
de Sergio Castañeda y un perfil del estudio TREQ/GEM (2022), y con ellos construyen la idea
de que un terremoto no es, por sí solo, un desastre.

Está pensada para **celular**: las clases son virtuales tras el terremoto del 10 de agosto
y no todos los estudiantes tienen computador ni conexión estable.

## Los cuatro actos

| Acto | Título | Qué enseña | Qué produce el estudiante |
|---|---|---|---|
| 1 | Un terremoto no es un desastre | Riesgo = Amenaza × Exposición × Vulnerabilidad | Clasifica 6 enunciados del TREQ + argumenta qué factor puede mover una alcaldía |
| 2 | Veintiséis años de saber sin hacer | Cómo leer un texto que sostiene una tesis | Clasifica 9 hitos como *conocer* / *actuar* + lectura crítica del argumento |
| 3 | Leer el estudio que Cali sí tenía | No linealidad; el riesgo como distribución | Extrae cifras de **su** perfil TREQ + explica el desacople plata/muertos |
| 4 | El lazo que no se cerró | Variables lentas y rápidas · retroalimentación · dependencia de trayectoria | Marca dónde se rompe el lazo de control + argumento de 200–300 palabras |

**El hallazgo que estructura el taller** (Acto 3): el terremoto de 1906 tuvo magnitud
**8.8** y el modelo estima **12 fallecidos**; el hipotético de Dagua–Calima tiene magnitud
**6.5** y estima **1.200**. Cien veces más muertos con mucha menos magnitud, porque lo que
cambia no es la amenaza sino la distancia, el suelo y lo construido.

## Asignación de escenarios

Hay **13 perfiles** de escenario sísmico. Cada pareja recibe uno, determinado por el hash
del código del estudiante que registra (`escenarioPara()` en `src/lib/escenarios.ts`).
Es estable: el mismo código siempre da el mismo escenario, en cualquier dispositivo. En la
puesta en común de la clase se juntan los trece y aparece el patrón de no linealidad.

## Stack

Next.js 16 (App Router, TypeScript, Turbopack) + Tailwind 4 + `googleapis`. Sin librerías
de gráficas ni de grafos: los perfiles del TREQ son imágenes y las tablas son HTML.

⚠️ Next 16 tiene *breaking changes*; ante la duda, mirar `node_modules/next/dist/docs/`.

## Estructura

```
src/
├── app/
│   ├── page.tsx              Estado, navegación entre actos, autoguardado y envío
│   ├── layout.tsx            Metadatos y viewport
│   ├── globals.css           Tokens de marca (neutro cálido + terracota)
│   └── api/guardar/route.ts  POST → Google Sheets
├── components/
│   ├── Registro.tsx          Nombre, código y pareja
│   ├── Acto1Riesgo.tsx … Acto4Lazo.tsx
│   └── ui.tsx                CabezaActo, Definicion, Ejercicio, Opciones, Texto,
│                             Campo, Revelable, ImagenAmpliable
└── lib/
    ├── contenido.ts          TODO el texto del taller: definiciones, lectura y enunciados
    ├── escenarios.ts         Los 13 perfiles, la asignación y la tabla de comparación
    ├── tipos.ts, columnas.ts, claves.ts
    └── sheets.ts             Persistencia (fail-closed en producción)
```

**Para editar contenido no hay que tocar componentes**: casi todo vive en
`src/lib/contenido.ts` (texto de Castañeda, definiciones, los 6 enunciados del Acto 1, los
9 hitos de la cronología, las 7 etapas del lazo) y en `src/lib/escenarios.ts`.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # y pegar la private key del service account
npm run dev
```

Sin credenciales la app guarda en un archivo temporal (solo sirve en desarrollo); en
producción devuelve **503** en vez de fingir que guardó.

## Almacenamiento

Google Sheets, mismo spreadsheet de los talleres anteriores
(`1pquFP4e-SMK1gTYJQNSz8AtV2Ce7V0MDwlPSSQhKW3c`), pestaña **`taller_sismo`** (se crea sola
en el primer guardado), service account `detective-redes@complejidad-496215`.

**Una fila por pareja**, 28 columnas. Las de respuesta larga (`a1_puede_cambiar`,
`a2_patron`, `a2_demuestra`, `a2_problema`, `a3_desacople`, `a3_rango_significa`,
`a3_no_linealidad`, `a4_donde_rompe`, `a4_argumento`, `a4_modelo_vs_dano`) son las que se
califican. `a1_aciertos`, `a2_n_conocer` y `a2_n_actuar` vienen precalculadas para ordenar
rápido en la hoja.

## Borrador local

El progreso se autoguarda en `localStorage` **atado al código del estudiante**
(`taller-sismo-respuestas:<código>`), no en una clave global: en un celular o computador
compartido el siguiente estudiante no hereda las respuestas del anterior. «Salir» borra el
borrador de ese dispositivo.

## Variables de entorno

`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (con `\n` literales), `SHEET_ID`,
`SHEET_TAB=taller_sismo`. Ver `.env.example`.
