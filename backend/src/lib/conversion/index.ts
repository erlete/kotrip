import { convert } from 'convert';

/**
 * Converts milliseconds to best fitting unit.
 *
 * @param {number} milliseconds - Time in milliseconds
 */
export const convertMs = (milliseconds: number) => {
  return convert(milliseconds, 'ms').to('best');
};

/**
 * Converts bytes to best fitting unit.
 *
 * @param {number} bytes - Size in bytes
 */
export const convertBytes = (bytes: number) => {
  return convert(bytes, 'byte').to('best');
};

/**
 * Type representing a value with its unit for formatting.
 *
 * @template TUnit - The unit type
 */
type WithFormatParam<TUnit extends string> = {
  quantity: number;
  unit: TUnit;
};

/**
 * Formats a value with its unit.
 *
 * @param {WithFormatParam} value - The value and its unit to format
 * @returns {string} Formatted string
 * @template TUnit - The unit type
 */
export const withFormat = <TUnit extends string>(
  value: WithFormatParam<TUnit>,
): string => {
  return `${value.quantity} ${value.unit}`;
};
