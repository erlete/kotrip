/**
 * Utilidades para el parsing y manipulación de duraciones temporales.
 *
 * @module DurationUtils
 * @description
 * Proporciona funciones para convertir strings de duración (ej: '15m', '30d', '1h')
 * a milisegundos o segundos, compatibles con la configuración de JWT y otras
 * funcionalidades que requieren intervalos de tiempo.
 */

/**
 * Unidades de tiempo soportadas y sus equivalencias en milisegundos.
 */
const TIME_UNITS: Record<string, number> = {
  d: 24 * 60 * 60 * 1000, // días
  h: 60 * 60 * 1000, // horas
  m: 60 * 1000, // minutos
  ms: 1, // milisegundos
  s: 1000, // segundos
  w: 7 * 24 * 60 * 60 * 1000, // semanas
};

/**
 * Resultado del parsing de una duración.
 */
export interface ParsedDuration {
  /** Valor numérico de la duración */
  value: number;
  /** Unidad de tiempo (ms, s, m, h, d, w) */
  unit: string;
  /** Duración total en milisegundos */
  milliseconds: number;
  /** Duración total en segundos */
  seconds: number;
}

/**
 * Parsea un string de duración y devuelve su valor en diferentes unidades.
 *
 * @param duration - String de duración (ej: '15m', '30d', '1h', '500ms')
 * @returns Objeto con el valor parseado en diferentes unidades
 * @throws {Error} Si el formato de duración es inválido
 *
 * @example
 * ```typescript
 * parseDuration('15m');  // { value: 15, unit: 'm', milliseconds: 900000, seconds: 900 }
 * parseDuration('30d');  // { value: 30, unit: 'd', milliseconds: 2592000000, seconds: 2592000 }
 * parseDuration('1h');   // { value: 1, unit: 'h', milliseconds: 3600000, seconds: 3600 }
 * ```
 */
export function parseDuration(duration: string): ParsedDuration {
  const trimmed = duration.trim().toLowerCase();

  // Regex para capturar número y unidad
  const match = trimmed.match(/^(\d+(?:\.\d+)?)(ms|s|m|h|d|w)$/);

  if (!match) {
    throw new Error(
      `Invalid duration format: "${duration}". ` +
        `Valid formats: 15m, 30d, 1h, 500ms, 60s, 1w`,
    );
  }

  const value = parseFloat(match[1]);
  const unit = match[2];
  const multiplier = TIME_UNITS[unit];

  if (multiplier === undefined) {
    throw new Error(`Unsupported time unit: "${unit}"`);
  }

  const milliseconds = Math.floor(value * multiplier);

  return {
    milliseconds,
    seconds: Math.floor(milliseconds / 1000),
    unit,
    value,
  };
}

/**
 * Convierte un string de duración a milisegundos.
 *
 * @param duration - String de duración (ej: '15m', '30d', '1h')
 * @returns Duración en milisegundos
 * @throws {Error} Si el formato es inválido
 *
 * @example
 * ```typescript
 * durationToMs('15m');  // 900000
 * durationToMs('30d');  // 2592000000
 * ```
 */
export function durationToMs(duration: string): number {
  return parseDuration(duration).milliseconds;
}

/**
 * Convierte un string de duración a segundos.
 *
 * @param duration - String de duración (ej: '15m', '30d', '1h')
 * @returns Duración en segundos
 * @throws {Error} Si el formato es inválido
 *
 * @example
 * ```typescript
 * durationToSeconds('15m');  // 900
 * durationToSeconds('30d');  // 2592000
 * ```
 */
export function durationToSeconds(duration: string): number {
  return parseDuration(duration).seconds;
}

/**
 * Calcula la fecha de expiración a partir de ahora.
 *
 * @param duration - String de duración (ej: '15m', '30d', '1h')
 * @returns Fecha de expiración
 *
 * @example
 * ```typescript
 * getExpirationDate('15m');  // Date 15 minutos en el futuro
 * getExpirationDate('30d');  // Date 30 días en el futuro
 * ```
 */
export function getExpirationDate(duration: string): Date {
  const ms = durationToMs(duration);
  return new Date(Date.now() + ms);
}

/**
 * Valida si un string tiene formato de duración válido.
 *
 * @param duration - String a validar
 * @returns true si el formato es válido, false en caso contrario
 *
 * @example
 * ```typescript
 * isValidDuration('15m');   // true
 * isValidDuration('30d');   // true
 * isValidDuration('abc');   // false
 * isValidDuration('15x');   // false
 * ```
 */
export function isValidDuration(duration: string): boolean {
  try {
    parseDuration(duration);
    return true;
  } catch {
    return false;
  }
}
