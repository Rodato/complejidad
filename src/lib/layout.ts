// Layout de fuerza (d3-force) para posicionar la red real en React Flow,
// que no auto-posiciona. Corre la simulación de forma síncrona y devuelve
// las coordenadas finales por nodo.

import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationNodeDatum,
} from "d3-force";
import type { GrafoSimple } from "./tipos";

type NodoSim = SimulationNodeDatum & { id: string; grado: number };

export function calcularPosiciones(
  grafo: GrafoSimple,
  { ancho = 1000, alto = 700, iteraciones = 300 } = {},
): Map<string, { x: number; y: number }> {
  const grado = new Map<string, number>();
  for (const n of grafo.nodos) grado.set(n, 0);
  for (const e of grafo.aristas) {
    grado.set(e.source, (grado.get(e.source) ?? 0) + 1);
    grado.set(e.target, (grado.get(e.target) ?? 0) + 1);
  }

  const nodos: NodoSim[] = grafo.nodos.map((id) => ({ id, grado: grado.get(id) ?? 0 }));
  const links = grafo.aristas.map((e) => ({ source: e.source, target: e.target }));

  // La red real es muy fragmentada (muchas díadas sueltas). Para que no se
  // dispersen y la cámara no tenga que alejarse tanto, usamos repulsión suave +
  // fuerzas forceX/forceY que jalan todos los componentes hacia el centro.
  const sim = forceSimulation(nodos)
    .force(
      "link",
      forceLink<NodoSim, { source: string; target: string }>(links)
        .id((d) => d.id)
        .distance(38)
        .strength(0.8),
    )
    .force("charge", forceManyBody().strength(-70).distanceMax(220))
    .force("x", forceX<NodoSim>(ancho / 2).strength(0.07))
    .force("y", forceY<NodoSim>(alto / 2).strength(0.07))
    .force("collide", forceCollide<NodoSim>().radius((d) => 9 + d.grado))
    .stop();

  sim.tick(iteraciones);

  const pos = new Map<string, { x: number; y: number }>();
  for (const n of nodos) pos.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });
  return pos;
}
