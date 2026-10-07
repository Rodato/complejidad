# Complejidad

Curso **Introducción a la Complejidad** (Universidad del Valle, Daniel Otero con Boris
Salazar) y la investigación que lo alimenta.

Tres cuerpos de trabajo distintos que comparten un dataset:

```
data/            Notaría 2 de Cali, 1938-1944 consolidada. Compartida. No mover de la raíz.
2026-I/          Semestre terminado. La emergencia urbana de Cali vía redes notariales.
2026-II/         Semestre ACTIVO. La complejidad de Cali vista desde el terremoto.
investigacion/   ACH (captura de archivo) y Paper_PPE (paper sobre planes parciales).
```

Este repo (`Rodato/complejidad`) tiene `data/`, `2026-I/` y `2026-II/` con el historial de
los repos que cada taller tenía antes. `investigacion/` **no está en el repo**: vive solo
en local (6 GB de escaneos y claves de API).

Cada carpeta tiene su propio `README.md`. `CLAUDE.md` es la versión para agentes.

Los talleres 1, 2 y 3 de 2026-II se despliegan en Vercel desde este repo (scope
`rodatos-projects`): cada proyecto tiene como Root Directory la carpeta de su app y solo se
reconstruye cuando cambia algo dentro de ella.

## Por dónde empezar

| Si querés… | Andá a |
|---|---|
| Ver qué se está dictando ahora | `2026-II/README.md` |
| Buscar un taller viejo o su repo | `2026-I/README.md` |
| Sacar más transacciones de los tomos escaneados | `investigacion/ACH/README.md` |
| Retomar el paper de los PPE | `investigacion/Paper_PPE/CLAUDE.md` |
| Entender de dónde salió el paper | `investigacion/Paper_PPE/origen_del_proyecto.md` |
| Regenerar el dataset de la Notaría 2 | `python3 data/consolidar.py` |

## Cómo se conecta

`data/consolidado_notaria2.csv` es el centro. Lo produce `data/consolidar.py` a partir de
los Excel por año, y lo consumen el parcial de 2026-I, el Taller 5 y el pipeline del ACH.
`data/limpiar_red.py` + `alias_curados.csv` es la capa de depuración que todos reusan.

El ACH es lo que va a **ampliar** ese dataset: convierte tomos escaneados del Archivo
Histórico en filas del mismo esquema. Hoy `outputs/transacciones/transacciones_ach.csv`
tiene 870 filas de 1941–1944 que todavía no se fusionaron con el consolidado.

Los talleres de 2026-II se despliegan en Vercel desde este repo: cada proyecto apunta a
la subcarpeta de su app (Root Directory) y solo se reconstruye cuando cambia esa carpeta.
Las apps de Streamlit de 2026-I se apagaron.

## Antes de trabajar

- Python: `/opt/homebrew/bin/python3.11`. Los venvs se borraron para liberar disco;
  recrear con `python3.11 -m venv .venv && .venv/bin/pip install -r requirements.txt`.
- Node: `npm install` en `2026-II/1.Taller_Terremoto/taller-sismo/` antes del primer `npm run dev`.
- Las credenciales (`.env`, `secrets.toml`, el JSON del service account) están en el árbol
  pero gitignoreadas en todos los repos. **Verificado: ninguna entró nunca a la historia
  de git.** No las commitees.
