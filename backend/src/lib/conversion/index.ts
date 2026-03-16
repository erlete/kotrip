import { convert } from 'convert';

/**
 * Convierte milisegundos a la unidad mas adecuada.
 *
 * @param {number} milliseconds - Tiempo en milisegundos.
 */
export const convertMs = (milliseconds: number) => {
  return convert(milliseconds, 'ms').to('best');
};

/**
 * Convierte bytes a la unidad mas adecuada.
 *
 * @param {number} bytes - Tamano en bytes.
 */
export const convertBytes = (bytes: number) => {
  return convert(bytes, 'byte').to('best');
};

/**
 * Tipo que representa un valor con su unidad para formateo.
 *
 * @template TUnit - Tipo de la unidad.
 */
type WithFormatParam<TUnit extends string> = {
  quantity: number;
  unit: TUnit;
};

/**
 * Formatea un valor numerico con su unidad.
 *
 * @param {WithFormatParam} value - Valor y unidad a formatear.
 * @returns {string} Cadena formateada.
 * @template TUnit - Tipo de la unidad.
 */
export const withFormat = <TUnit extends string>(
  value: WithFormatParam<TUnit>,
): string => {
  return `${value.quantity} ${value.unit}`;
};
