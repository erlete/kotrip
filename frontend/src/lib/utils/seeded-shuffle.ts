/**
 * Utilidad de shuffle determinista con semilla.
 *
 * Permite reordenar arrays de forma pseudoaleatoria pero reproducible,
 * dado el mismo valor de semilla. Utilizado para el reordenamiento
 * de opciones de respuesta en ítems de actividad.
 */

/**
 * Genera un hash numérico a partir de una cadena de texto.
 *
 * Implementa una variante del algoritmo DJB2 de Daniel J. Bernstein.
 *
 * @param str - Cadena de texto a hashear.
 * @returns Valor numérico entero positivo (32 bits).
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/**
 * Generador de números pseudoaleatorios Mulberry32.
 *
 * Implementa el algoritmo Mulberry32 que produce una secuencia
 * determinista de valores en el rango [0, 1) a partir de una semilla.
 *
 * @param seed - Semilla numérica entera.
 * @returns Función generadora que produce un valor pseudoaleatorio en [0, 1) por cada invocación.
 */
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Reordena un array de forma determinista utilizando una semilla de texto.
 *
 * Aplica el algoritmo Fisher-Yates shuffle con un PRNG semillado (Mulberry32),
 * garantizando que el mismo par (array, semilla) produzca siempre el mismo resultado.
 *
 * No modifica el array original.
 *
 * @param array - Array a reordenar.
 * @param seed - Cadena de texto utilizada como semilla (e.g., `attemptId:itemId`).
 * @returns Nueva copia del array reordenada de forma determinista.
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array];
  const rng = mulberry32(hashString(seed));

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
