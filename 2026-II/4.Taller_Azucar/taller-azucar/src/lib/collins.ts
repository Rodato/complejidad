// Datos de Collins, «Formación de un sector de clase social. La burguesía azucarera en
// el Valle del Cauca durante los años treinta y cuarenta», en Pensar el suroccidente,
// tomo III (Icesi, 2019), págs. 575–630. Publicado antes en Historia y Espacio 3(9), 1983.
//
// El esquema 1 (pág. 583) y el cuadro 7 (pág. 585) se transcribieron a mano y se
// cotejaron celda por celda contra el PDF. Las medidas se verificaron con igraph.

import type { NodoGrafo, AristaGrafo } from "@/components/Grafo";

// ─────────────────────────────────────────────────────────────────────────────
// Esquema 1: cuatro grupos familiares y once ingenios, 1930–1950
// ─────────────────────────────────────────────────────────────────────────────

const GRUPOS_E1 = [
  { id: "eder", nombre: "Eder", ranura: 1.5 },
  { id: "cabal", nombre: "Cabal-Becerra", ranura: 4 },
  { id: "salcedo", nombre: "Salcedo", ranura: 5.5 },
  { id: "caicedo", nombre: "Caicedo", ranura: 8.5 },
];

// Ordenados para que se crucen pocas líneas: los compartidos en el medio.
const INGENIOS_E1 = [
  { id: "manuelita", nombre: "La Manuelita" },
  { id: "tolima", nombre: "Central Tolima" },
  { id: "cauca", nombre: "Cauca" },
  { id: "providencia", nombre: "Providencia" },
  { id: "pichichi", nombre: "Pichichí" },
  { id: "sanfernando", nombre: "San Fernando" },
  { id: "tumaco", nombre: "Central Tumaco" },
  { id: "esperanza", nombre: "La Esperanza" },
  { id: "riopaila", nombre: "Riopaila" },
  { id: "castilla", nombre: "Castilla" },
  { id: "bengala", nombre: "Bengala" },
];

const VINCULOS_E1: [string, string][] = [
  ["eder", "manuelita"],
  ["eder", "tolima"],
  ["eder", "cauca"],
  ["eder", "providencia"],
  ["cabal", "providencia"],
  ["cabal", "pichichi"],
  ["cabal", "sanfernando"],
  ["caicedo", "providencia"],
  ["caicedo", "riopaila"],
  ["caicedo", "castilla"],
  ["caicedo", "bengala"],
  ["salcedo", "providencia"],
  ["salcedo", "pichichi"],
  ["salcedo", "sanfernando"],
  ["salcedo", "tumaco"],
  ["salcedo", "esperanza"],
];

const y11 = (i: number) => 0.04 + (i * 0.92) / 10;

export const ESQUEMA1 = {
  proporcion: 1.15,
  nodos: [
    ...GRUPOS_E1.map(
      (g): NodoGrafo => ({
        id: g.id,
        etiqueta: g.nombre,
        nombre: `Grupo ${g.nombre}`,
        x: 0.3,
        y: y11(g.ranura),
        tipo: "grupo",
        lado: "izq",
      }),
    ),
    ...INGENIOS_E1.map(
      (n, i): NodoGrafo => ({
        id: n.id,
        etiqueta: n.nombre,
        nombre: `Ingenio ${n.nombre}`,
        x: 0.68,
        y: y11(i),
        tipo: "objeto",
        lado: "der",
      }),
    ),
  ],
  aristas: VINCULOS_E1.map(([a, b]): AristaGrafo => ({ a, b })),
};

// ─────────────────────────────────────────────────────────────────────────────
// Cuadro 7: accionistas y/o directivos (filas) × empresas fuera del azúcar (columnas)
// ─────────────────────────────────────────────────────────────────────────────

/** Letra de fila = ingenio cuyos accionistas y directivos agrupa (pág. 586). */
export const GRUPOS_C7 = [
  { id: "A", corto: "Manuelita", nombre: "Accionistas y/o directivos del Ingenio Manuelita" },
  { id: "B", corto: "Providencia", nombre: "Accionistas y/o directivos del C.A.V. (Providencia)" },
  { id: "C", corto: "Riopaila-Castilla", nombre: "Accionistas y/o directivos de Riopaila y Castilla" },
  { id: "D", corto: "Ochoa", nombre: "El grupo Ochoa (Ingenio Bengala)" },
  { id: "E", corto: "Garcés", nombre: "Jorge Garcés B. (intereses en La Manuelita, Papayal y Meléndez)" },
  { id: "F", corto: "Salcedo", nombre: "El grupo Salcedo (La Esperanza, Central Tumaco, San Fernando, Pichichí, Providencia)" },
  { id: "G", corto: "Sarmiento", nombre: "Carlos Sarmiento (Ingenio San Carlos)" },
  { id: "H", corto: "Pichichí", nombre: "Accionistas del Ingenio Pichichí" },
] as const;

export type LetraGrupo = (typeof GRUPOS_C7)[number]["id"];

/** Las 25 filas, en el orden de la explicación de Collins, con sus marcas. */
export const PERSONAS_C7: { id: string; nombre: string; grupo: LetraGrupo; empresas: string }[] = [
  { id: "A1", nombre: "Santiago M. Eder", grupo: "A", empresas: "AD" },
  { id: "A2", nombre: "Henry J. Eder", grupo: "A", empresas: "AEF" },
  { id: "A3", nombre: "Carlos J. Eder", grupo: "A", empresas: "D" },
  { id: "A4", nombre: "Phanor Eder", grupo: "A", empresas: "F" },
  { id: "A5", nombre: "Harold H. Eder", grupo: "A", empresas: "BC" },
  { id: "A6", nombre: "Gonzalo Lourido", grupo: "A", empresas: "TU" },
  { id: "B1", nombre: "Modesto Cabal Galindo", grupo: "B", empresas: "DGHIJ" },
  { id: "B2", nombre: "Alfonso Vallejo G.", grupo: "B", empresas: "U" },
  { id: "B3", nombre: "Alfonso Cabal Madriñán", grupo: "B", empresas: "DGHJKLO" },
  { id: "B4", nombre: "Carlos Becerra Cabal", grupo: "B", empresas: "GIKL" },
  { id: "B5", nombre: "Juan E. Ulloa C.", grupo: "B", empresas: "QR" },
  { id: "B6", nombre: "Gustavo Lloreda C.", grupo: "B", empresas: "ABCP" },
  { id: "B7", nombre: "José María Becerra Cabal", grupo: "B", empresas: "I" },
  { id: "B8", nombre: "Cristóbal Becerra", grupo: "B", empresas: "GHKL" },
  { id: "C1", nombre: "Hernando Caicedo", grupo: "C", empresas: "ENOPSU" },
  { id: "C2", nombre: "Álvaro H. Caicedo", grupo: "C", empresas: "Q" },
  { id: "C3", nombre: "Belisario Caicedo", grupo: "C", empresas: "R" },
  { id: "C4", nombre: "Jaime H. Caicedo", grupo: "C", empresas: "PQ" },
  { id: "C5", nombre: "Enrique González Caicedo", grupo: "C", empresas: "QR" },
  { id: "D1", nombre: "Grupo Ochoa (Bengala)", grupo: "D", empresas: "P" },
  { id: "E1", nombre: "Jorge Garcés B.", grupo: "E", empresas: "STU" },
  { id: "F1", nombre: "Grupo Salcedo", grupo: "F", empresas: "JM" },
  { id: "G1", nombre: "Carlos Sarmiento (San Carlos)", grupo: "G", empresas: "Q" },
  { id: "H1", nombre: "Efraín I. Nieto", grupo: "H", empresas: "H" },
  { id: "H2", nombre: "Alejandro Abadía", grupo: "H", empresas: "H" },
];

/** Las 21 columnas: «empresas o asociaciones económicas» fuera del azúcar (págs. 587–591). */
export const EMPRESAS_C7: { id: string; corto: string; nombre: string; pagina: number; nota: string }[] = [
  {
    id: "A",
    corto: "Navegación río Cauca",
    nombre: "Compañía de navegación por el río Cauca",
    pagina: 587,
    nota:
      "Fundada hacia 1875 por intereses mineros y comerciales de la región, entre ellos Santiago Eder. Se reorganizó cuatro veces y atrajo accionistas como Ulpiano Lloreda González. Henry J. Eder fue gerente un tiempo. Collins advierte que A, B y C tienen «una colocación dudosa»: son relaciones de Ulpiano Lloreda, padre de Gustavo Lloreda, con los Eder.",
  },
  {
    id: "B",
    corto: "Luz y energía de Cali",
    nombre: "Compañía de luz y energía de Cali",
    pagina: 587,
    nota:
      "Fundada a raíz de un contrato con el municipio de Cali para proveer de luz eléctrica a la ciudad. Accionistas: Henry J. Eder y Ulpiano Lloreda G. La planta se inauguró en 1910.",
  },
  {
    id: "C",
    corto: "Banco Comercial",
    nombre: "Banco Comercial",
    pagina: 587,
    nota:
      "Iniciativa de Pedro Plata, con Henry Eder como socio fundador y Ulpiano Lloreda como accionista. Fundado en 1903, duró poco.",
  },
  {
    id: "D",
    corto: "Rentas de Licores",
    nombre: "Contratación de las Rentas de Licores",
    pagina: 588,
    nota:
      "Santiago Eder, Carlos J. Eder, Modesto Cabal Galindo y Alfonso Cabal Madriñán se presentaban asociados a los remates departamentales de la renta de licores y hacían acuerdos para dividírsela por provincias. Carlos J. Eder y Modesto Cabal Galindo se asociaron con un capital inicial de 500.000 pesos.",
  },
  {
    id: "E",
    corto: "Diario del Pacífico",
    nombre: "Sociedad Comercial Tipográfica",
    pagina: 588,
    nota:
      "Editaba el Diario del Pacífico, diario caleño de línea conservadora. Accionistas: Henry J. Eder y Hernando Caicedo, que fue miembro de la junta y gerente de 1925 a 1930.",
  },
  {
    id: "F",
    corto: "Metálicas de Palmira",
    nombre: "Industrias Metálicas de Palmira",
    pagina: 588,
    nota:
      "Antes Industrias Nacionales Vallejo, fundada por Vicente Vallejo G. (hermano de Alfonso Vallejo G., cofundador de Providencia). En 1935 cambia de razón social, con Henry Eder como dueño de 15.364 acciones. Phanor Eder fue directivo.",
  },
  {
    id: "G",
    corto: "Industrial Cafetera",
    nombre: "Compañía Industrial Cafetera de Palmira S.A.",
    pagina: 589,
    nota:
      "Tenía una trilladora de café y se liquidó en 1944. Socios: Modesto Cabal Galindo, Alfonso Cabal Madriñán, Carlos Becerra Cabal y Cristóbal Becerra.",
  },
  {
    id: "H",
    corto: "Aceites y Jabones",
    nombre: "Compañía de Aceites y Jabones S.A.",
    pagina: 589,
    nota:
      "Fundada entre 1927 y 1929 en Palmira con 50.000 pesos oro. Accionistas: Modesto Cabal Galindo, Alfonso Cabal Madriñán, Cristóbal Becerra, Alejandro Abadía y Efraín I. Nieto.",
  },
  {
    id: "I",
    corto: "Eléctrica de Palmira",
    nombre: "Compañía de Instalación Eléctrica de Palmira",
    pagina: 589,
    nota:
      "Fundada en 1913 en Palmira con $70.000; uno de los intereses de Modesto Cabal Galindo. En 1929 Carlos Becerra Cabal era el gerente y José María Becerra Cabal su primer director.",
  },
  {
    id: "J",
    corto: "Galerías de Palmira",
    nombre: "Compañía Constructora de las Galerías",
    pagina: 589,
    nota:
      "Construyó y luego administró la plaza de mercado de Palmira con un privilegio de 50 años. Fundada en 1906 con $35.000, con Modesto Cabal G. como accionista fuerte. En 1941 el gerente era Adriano Salcedo C.; en la junta estaban Guillermo Salcedo H. y, como suplente, Alfonso Cabal Madriñán.",
  },
  {
    id: "K",
    corto: "Acueducto de Palmira",
    nombre: "Compañía Constructora del Acueducto y Alcantarillado (Palmira)",
    pagina: 589,
    nota:
      "Tenía como accionistas a entidades departamentales y municipales, además de particulares como Cristóbal Becerra y Carlos Becerra Cabal.",
  },
  {
    id: "L",
    corto: "Becerra Cabal y Cía.",
    nombre: "Becerra Cabal y Cía. S.A.",
    pagina: 589,
    nota:
      "Reunía a Cristóbal Becerra, Carlos Becerra (primer director) y Alfonso Cabal Madriñán. Compraba café y cacao y era importadora, exportadora y comisionista de café.",
  },
  {
    id: "M",
    corto: "Salcedo Hermanos",
    nombre: "Salcedo Hermanos Ltda.",
    pagina: 590,
    nota:
      "Reunía a Carlos, Hernando, Daniel, Adriano y Víctor Salcedo C. Se dedicaba a cultivos agrícolas y era la representación legal de los Salcedo en otras compañías. Los Salcedo tenían intereses en Central Tumaco, San Fernando, Pichichí y Providencia.",
  },
  {
    id: "N",
    corto: "Automoviliaria",
    nombre: "Sociedad Automoviliaria Colombiana",
    pagina: 590,
    nota:
      "Importaba y vendía gasolina y automóviles. En los años veinte Hernando Caicedo era accionista con Ulpiano Lloreda; en 1929 Álvaro Lloreda le compró sus acciones.",
  },
  {
    id: "O",
    corto: "Ganadera El Rincón",
    nombre: "Sociedad Ganadera El Rincón",
    pagina: 590,
    nota: "Fundada en 1924 por Hernando Caicedo y Alfonso Cabal Madriñán.",
  },
  {
    id: "P",
    corto: "Viarco (aviación)",
    nombre: "Vías Aéreas Colombianas S.A. (Viarco)",
    pagina: 590,
    nota:
      "Participaban Hernando Caicedo, Jaime Caicedo, Alfredo Lloreda y Alberto Ochoa. Tenía un capital inscrito de tres millones de pesos en 1946.",
  },
  {
    id: "Q",
    corto: "Diario Occidente",
    nombre: "Occidente",
    pagina: 590,
    nota:
      "Periódico conservador fundado en 1961. Reunía los intereses mayoritarios de los Caicedo (Álvaro H., Jaime H. y Enrique González Caicedo), con una participación mínima de Carlos Sarmiento y Juan E. Ulloa C.",
  },
  {
    id: "R",
    corto: "Molino El Triunfo",
    nombre: "Molino «El Triunfo» Ltda.",
    pagina: 591,
    nota:
      "Molino de arroz de Juan E. Ulloa C., Enrique González Caicedo y Belisario Caicedo. Capital inscrito de $100.000 en 1946.",
  },
  {
    id: "S",
    corto: "Cervecería Los Andes",
    nombre: "Cervecería «Los Andes»",
    pagina: 591,
    nota:
      "Establecida en Cali en los años veinte con un capital de $715.000; su fábrica en Cali empezó a operar en 1924. Hernando Caicedo fue uno de los primeros gerentes y Jorge Garcés B. uno de los accionistas.",
  },
  {
    id: "T",
    corto: "Banco de Colombia",
    nombre: "Banco de Colombia",
    pagina: 591,
    nota:
      "Jorge Garcés B. quedó como fuerte accionista cuando el Banco del Pacífico se incorporó al Banco de Colombia. Gonzalo Lourido fue uno de los gerentes del banco en Cali en los años veinte o treinta.",
  },
  {
    id: "U",
    corto: "Carretera al mar",
    nombre: "Compañía constructora de la carretera al mar",
    pagina: 591,
    nota:
      "Asociación de los años veinte con Alfonso Vallejo, Gustavo Lloreda, Jorge Garcés B. y Gonzalo Lourido como accionistas y directivos. Hernando Caicedo también fue accionista, y Henry Eder cedió terrenos gratis a la compañía.",
  },
];

export const EMPRESA = new Map(EMPRESAS_C7.map((e) => [e.id, e]));
export const PERSONA = new Map(PERSONAS_C7.map((p) => [p.id, p]));
export const GRUPO = new Map(GRUPOS_C7.map((g) => [g.id as string, g]));

/** ¿Tiene marca la fila p en la columna e? */
export function marca(p: string, e: string): boolean {
  return PERSONA.get(p)?.empresas.includes(e) ?? false;
}

// Los nodos llevan prefijo para que la fila A y la columna A no sean el mismo nodo.
export const idGrupo = (l: string) => `g:${l}`;
export const idEmpresa = (l: string) => `e:${l}`;

export type VistaC7 = "grupos" | "bipartita" | "personas";

export type RedDibujable = {
  proporcion: number;
  nodos: NodoGrafo[];
  aristas: AristaGrafo[];
};

/** Red de grupos: dos filas-letra se unen si comparten al menos una empresa. */
function redGrupos(): RedDibujable {
  const posicion: Record<string, [number, number, NodoGrafo["lado"]]> = {
    A: [0.17, 0.22, "arriba"],
    E: [0.5, 0.07, "arriba"],
    C: [0.83, 0.25, "arriba"],
    B: [0.47, 0.5, "der"],
    D: [0.86, 0.66, "abajo"],
    G: [0.66, 0.86, "abajo"],
    H: [0.14, 0.68, "abajo"],
    F: [0.33, 0.9, "abajo"],
  };
  const empresasDe = new Map<string, Set<string>>();
  for (const p of PERSONAS_C7) {
    const s = empresasDe.get(p.grupo) ?? new Set<string>();
    for (const e of p.empresas) s.add(e);
    empresasDe.set(p.grupo, s);
  }
  const aristas: AristaGrafo[] = [];
  const letras = GRUPOS_C7.map((g) => g.id);
  for (let i = 0; i < letras.length; i++)
    for (let j = i + 1; j < letras.length; j++) {
      const a = empresasDe.get(letras[i])!;
      const b = empresasDe.get(letras[j])!;
      const comunes = [...a].filter((e) => b.has(e));
      if (comunes.length)
        aristas.push({ a: idGrupo(letras[i]), b: idGrupo(letras[j]), peso: comunes.length, nota: comunes.join(", ") });
    }
  return {
    proporcion: 0.95,
    nodos: GRUPOS_C7.map((g) => ({
      id: idGrupo(g.id),
      etiqueta: `${g.id} ${g.corto}`,
      nombre: `Grupo ${g.id}: ${g.nombre}`,
      x: posicion[g.id][0],
      y: posicion[g.id][1],
      tipo: "grupo",
      lado: posicion[g.id][2],
    })),
    aristas,
  };
}

/** Grupos (filas por letra) y empresas (columnas) en una sola red bipartita. */
function redBipartita(): RedDibujable {
  const ranuraGrupo: Record<string, number> = { A: 2, H: 5, B: 8, F: 11, C: 13.5, D: 15.5, G: 17.5, E: 19.5 };
  const y21 = (i: number) => 0.025 + (i * 0.95) / 20;
  const pares = new Set<string>();
  for (const p of PERSONAS_C7) for (const e of p.empresas) pares.add(`${p.grupo}|${e}`);
  return {
    proporcion: 1.45,
    nodos: [
      ...GRUPOS_C7.map(
        (g): NodoGrafo => ({
          id: idGrupo(g.id),
          etiqueta: `${g.id} ${g.corto}`,
          nombre: `Grupo ${g.id}: ${g.nombre}`,
          x: 0.27,
          y: y21(ranuraGrupo[g.id]),
          tipo: "grupo",
          lado: "izq",
        }),
      ),
      ...EMPRESAS_C7.map(
        (e, i): NodoGrafo => ({
          id: idEmpresa(e.id),
          etiqueta: `${e.id} ${e.corto}`,
          nombre: `Empresa ${e.id}: ${e.nombre}`,
          x: 0.6,
          y: y21(i),
          tipo: "objeto",
          lado: "der",
        }),
      ),
    ],
    aristas: [...pares].map((k) => {
      const [g, e] = k.split("|");
      return { a: idGrupo(g), b: idEmpresa(e) };
    }),
  };
}

/** Red de personas: dos filas se unen si comparten al menos una empresa. En círculo, por fila. */
function redPersonas(): RedDibujable {
  const n = PERSONAS_C7.length;
  const nodos = PERSONAS_C7.map((p, i): NodoGrafo => {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const x = 0.5 + 0.4 * Math.cos(ang);
    const y = 0.5 + 0.4 * Math.sin(ang);
    const lado: NodoGrafo["lado"] = x > 0.56 ? "der" : x < 0.44 ? "izq" : y < 0.5 ? "arriba" : "abajo";
    return { id: p.id, etiqueta: p.id, nombre: `${p.id} ${p.nombre}`, x, y, tipo: "grupo", lado };
  });
  const aristas: AristaGrafo[] = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const a = PERSONAS_C7[i];
      const b = PERSONAS_C7[j];
      const comunes = [...a.empresas].filter((e) => b.empresas.includes(e));
      if (comunes.length) aristas.push({ a: a.id, b: b.id, peso: comunes.length, nota: comunes.join(", ") });
    }
  return { proporcion: 1, nodos, aristas };
}

export const REDES_C7: Record<VistaC7, RedDibujable> = {
  grupos: redGrupos(),
  bipartita: redBipartita(),
  personas: redPersonas(),
};

export const VISTAS_C7: { clave: VistaC7; nombre: string; idea: string }[] = [
  {
    clave: "grupos",
    nombre: "Grupos (filas A–H)",
    idea:
      "Cada nodo es una letra de fila: todos los accionistas de un ingenio juntos. Dos grupos se unen si alguno de sus miembros comparte una empresa. El grosor y el número sobre la línea dicen cuántas empresas comparten.",
  },
  {
    clave: "bipartita",
    nombre: "Grupos y empresas",
    idea:
      "Dos tipos de nodo: los grupos (círculos, a la izquierda) y las empresas (cuadrados, a la derecha). Un grupo se une a una empresa si alguno de sus miembros tiene una X en esa columna.",
  },
  {
    clave: "personas",
    nombre: "Personas",
    idea:
      "Cada nodo es una fila del cuadro (A1 a H2). Dos personas se unen si están en la misma empresa. Ojo: D1 y F1 no son personas sino familias enteras.",
  },
];
