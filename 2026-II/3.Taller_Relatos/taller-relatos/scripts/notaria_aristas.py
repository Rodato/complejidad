#!/usr/bin/env python3
"""
Genera datos/notaria_aristas.csv: la red curada de la Notaría 2 (1938–1944), dirigida
vendedor -> comprador, con el año de cada escritura.

Es la misma limpieza del parcial final de 2026-I (2026-I/6.Parcial_Final/construir_datos.py):
modo 'curada' de data/limpiar_red.py = normaliza, quita apoderados, separa co-partes y
aplica data/alias_curados.csv. Así las cifras del taller cuadran con las del curso, con
un ajuste: aquí además se quitan las notas que la transcripción dejó pegadas al nombre
tras «;» y dos prefijos («Acreedor:», «celebrado con la señora…»). Sin eso el mismo actor queda partido en dos
nodos: el Municipio de Cali vende 42 veces, no 41 como en el parcial.

    python3 scripts/notaria_aristas.py      # desde la raíz del proyecto
    Rscript scripts/preparar_datos.R        # después: arma los JSON de la app

Salida: registro, anio, source, target, negocio
  'registro' identifica la escritura original: si una casilla trae varias partes salen
  varias flechas con el mismo registro, y la app cuenta escrituras por registro.
"""
import csv
import re
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
DATA = AQUI.parents[3] / "data"   # Complejidad/data, en la raíz a propósito
sys.path.insert(0, str(DATA))

import limpiar_red as LR  # noqa: E402

SALIDA = AQUI.parent / "datos" / "notaria_aristas.csv"


PREFIJOS = re.compile(r"^(acreedor:\s*|celebrado con (el|la) (señor|señora)\s+)", re.I)


def sin_notas(n):
    """'municipio de cali ; venta en cumplimiento del acuerdo…' -> 'municipio de cali'."""
    return PREFIJOS.sub("", n.split(";")[0].strip()).strip()


def main():
    curados = LR.cargar_alias_curados()

    def canon(n):
        n = sin_notas(n)
        return curados.get(LR.clave_match(n), n)

    filas = []
    for i, r in enumerate(LR.leer_registros()):
        S = [canon(x) for x in LR.limpia_nodo_moderada(r.get("vendedor"))]
        B = [canon(x) for x in LR.limpia_nodo_moderada(r.get("comprador"))]
        m = re.search(r"\d{4}", str(r.get("anio") or ""))
        if not S or not B or not m:
            continue
        negocio = re.sub(r"\s+", " ", str(r.get("negocio") or "").strip())
        for s in S:
            for b in B:
                if s != b:
                    filas.append({"registro": i, "anio": int(m.group()),
                                  "source": s, "target": b, "negocio": negocio})

    SALIDA.parent.mkdir(exist_ok=True)
    with open(SALIDA, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["registro", "anio", "source", "target", "negocio"])
        w.writeheader()
        w.writerows(filas)

    nodos = {x for f in filas for x in (f["source"], f["target"])}
    print(f"Flechas: {len(filas)} · escrituras: {len({f['registro'] for f in filas})} · "
          f"actores: {len(nodos)} -> {SALIDA.relative_to(AQUI.parent)}")


if __name__ == "__main__":
    main()
