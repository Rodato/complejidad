// Tipos compartidos del taller.

/** Arista cruda de la red real (public/data/red.json). */
export type AristaReal = {
  source: string;
  target: string;
  anio: number | null;
  valor: number | null;
};

/** Grafo simple no dirigido (sin multi-aristas ni self-loops). */
export type GrafoSimple = {
  nodos: string[];
  aristas: { source: string; target: string; peso: number }[];
};

/** Régimen al que se acerca la distribución de grado (intuición visual). */
export type ClaveRegimen = "vacio" | "campana" | "intermedio" | "cola-larga";

export type Regimen = {
  clave: ClaveRegimen;
  etiqueta: string;
  cv: number; // coeficiente de variación de los grados
  explicacion: string;
};

/** Una acción del estudiante mientras dibuja (captura "el proceso"). */
export type Accion = {
  orden: number;
  tipo:
    | "add-nodo"
    | "add-arista"
    | "del-nodo"
    | "del-arista"
    | "rename-nodo"
    | "plantilla"
    | "limpiar";
  detalle: string;
};

/** Topología generada por una plantilla (con posiciones precomputadas). */
export type Topologia = {
  nodos: { id: string; label: string; x: number; y: number }[];
  aristas: { source: string; target: string }[];
};

/** Lo que se envía a guardar (Sheets). */
export type PayloadGuardar = {
  nombre: string;
  codigo: string;
  companeros: string;
  n_nodos: number;
  n_aristas: number;
  grado_max: number;
  grado_promedio: number;
  regimen: string;
  regimen_clave: ClaveRegimen;
  secuencia_construccion: Accion[];
  grafo: { nodos: { id: string; label: string }[]; aristas: { source: string; target: string }[] };
  narrativa: string;
};
