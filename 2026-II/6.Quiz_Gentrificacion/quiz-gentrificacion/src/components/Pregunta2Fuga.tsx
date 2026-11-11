"use client";

import { Campo, CabezaParte, Cita, Definicion, Ejercicio, Limite, ListaVentas, Texto } from "./ui";
import { CUARENTA, fechaCorta, pesos40 } from "@/lib/datos";
import type { Respuestas } from "@/lib/tipos";

type Props = {
  r: Respuestas;
  set: <K extends keyof Respuestas>(k: K, v: Respuestas[K]) => void;
};

export default function Pregunta2Fuga({ r, set }: Props) {
  return (
    <>
      <CabezaParte
        numero={2}
        titulo="La ruta de la fuga"
        bajada="En la nota 5, Mosquera y Aprile cuentan cómo la élite de Cali cambia de barrio cada tantas décadas. Nuestras escrituras cubren justo uno de esos traslados."
      />

      <Cita fuente="Mosquera y Aprile (1980), nota 5, pág. 94.">
        <p>
          Desde luego Cali no escapa a la regla, en donde una oligarquía
          comercial-industrial-terrateniente muda continuamente su bastión residencial para huir
          de la presión que ejercen algunas capas súbditas. A principios de siglo, el barrio de La
          Merced era aún su asiento principal, el cual se desplazó hacia el Peñón y El Centenario
          durante las décadas del treinta y del cuarenta. A partir de 1970 una parte de esta
          reducida casta emigró hacia la zona suburbana y campestre de Ciudad Jardín.
        </p>
      </Cita>

      <Definicion titulo="El ciclo de atracción y expulsión (págs. 89–90)">
        <p>
          GD es el grupo dirigente, CM las capas medias y P el proletariado y demás capas
          populares.
        </p>
        <p>
          1. «GD elige su sector residencial y garantiza su exclusividad por medio de los precios y
          de las normas jurídicas». 2. Su bastión se vuelve un imán que atrae a CM, y CM a su vez
          desplaza a P. 3. «CM invadió el sector elitista y se adueñó del bastión que se había
          reservado GD. GD, desalojado, se está edificando otro bastión». 4. Empieza un ciclo
          nuevo.
        </p>
      </Definicion>

      <ListaVentas
        filas={CUARENTA.fuga.map((f) => ({
          fecha: fechaCorta(f.fecha, f.anio),
          lugar: f.barrio,
          detalle: f.tipo,
          precio: `${pesos40(f.pm2)}/m²`,
          vendedor: f.vendedor,
          comprador: f.comprador,
        }))}
        pie={`Todas las compraventas de 1941–1944 que tenemos en La Merced, Centenario, Granada y Versalles: quién vende → quién compra. En «casa» el precio incluye la construcción. La mediana de todos los lotes de la ciudad en esos años es ${pesos40(CUARENTA.mediana_lotes)} por m².`}
      />

      <Ejercicio numero="2" titulo="¿Confirman las escrituras la ruta?">
        <div className="mb-4">
          <Campo
            label="¿Qué barrio de la nota 5 no aparece en nuestras escrituras?"
            valor={r.p2_falta}
            onChange={(v) => set("p2_falta", v)}
          />
        </div>
        <Texto
          label="¿Las escrituras confirman la ruta de la nota 5? Digan qué familias ven vendiendo y comprando, y dónde. ¿En qué fase del ciclo ubicarían a Cali en 1941–44? Apóyense en los precios."
          valor={r.p2_ruta}
          onChange={(v) => set("p2_ruta", v)}
          filas={5}
          minPalabras={40}
          maxPalabras={150}
        />
      </Ejercicio>

      <Limite>
        Una escritura dice quién vendió y quién compró, no dónde vivía cada uno. Que alguien
        compre un lote en Granada no prueba que se haya mudado allá: pudo comprar para construir,
        arrendar o revender.
      </Limite>
    </>
  );
}
