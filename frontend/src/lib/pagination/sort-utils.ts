/**
 * @fileoverview Utilidades de ordenamiento para paginacion por cursor
 *
 * Funciones auxiliares para gestionar ordenamientos en el estado de
 * paginacion y en los parametros de consulta.
 */

import type { SortDir, SortValue } from './types';

/**
 * Agrega o actualiza un ordenamiento en el array.
 *
 * Si ya existe un ordenamiento para el campo, actualiza la direccion.
 * Si no, agrega uno nuevo al inicio del array.
 *
 * @param sorts - Array de ordenamientos actual.
 * @param field - Campo a ordenar.
 * @param dir - Direccion de ordenamiento.
 * @returns Nuevo array con el ordenamiento agregado/actualizado.
 *
 * @example
 * addSort([], 'createdAt', 'desc')
 * // Returns: [{ key: 'createdAt', dir: 'desc' }]
 */
export function addSort<K extends string = string>(
  sorts: SortValue<K>[],
  field: K,
  dir: SortDir,
): SortValue<K>[] {
  // Remove existing sort for this field
  const filtered = sorts.filter((s) => s.key !== field);

  // Add new sort at the beginning
  return [{ key: field, dir }, ...filtered];
}

/**
 * Elimina un ordenamiento del array.
 *
 * @param sorts - Array de ordenamientos actual.
 * @param field - Campo del ordenamiento a eliminar.
 * @returns Nuevo array sin el ordenamiento eliminado.
 *
 * @example
 * removeSort(sorts, 'createdAt')
 * // Returns: sorts without the createdAt sort
 */
export function removeSort<K extends string = string>(
  sorts: SortValue<K>[],
  field: K,
): SortValue<K>[] {
  return sorts.filter((s) => s.key !== field);
}

/**
 * Alterna la direccion de ordenamiento de un campo.
 *
 * Si el campo no esta ordenado, agrega orden ascendente.
 * Si es ascendente, lo cambia a descendente.
 * Si es descendente, elimina el ordenamiento.
 *
 * @param sorts - Array de ordenamientos actual.
 * @param field - Campo cuyo ordenamiento se alterna.
 * @returns Nuevo array con el ordenamiento alternado.
 *
 * @example
 * toggleSort([], 'createdAt')
 * // Returns: [{ key: 'createdAt', dir: 'asc' }]
 *
 * toggleSort([{ key: 'createdAt', dir: 'asc' }], 'createdAt')
 * // Returns: [{ key: 'createdAt', dir: 'desc' }]
 *
 * toggleSort([{ key: 'createdAt', dir: 'desc' }], 'createdAt')
 * // Returns: []
 */
export function toggleSort<K extends string = string>(
  sorts: SortValue<K>[],
  field: K,
): SortValue<K>[] {
  const existing = sorts.find((s) => s.key === field);

  if (!existing) {
    // Not sorted yet, add ascending
    return addSort(sorts, field, 'asc');
  }

  if (existing.dir === 'asc') {
    // Currently ascending, change to descending
    return addSort(sorts, field, 'desc');
  }

  // Currently descending, remove sort
  return removeSort(sorts, field);
}

/**
 * Limpia todos los ordenamientos.
 *
 * @returns Array de ordenamientos vacio.
 *
 * @example
 * clearSorts()
 * // Returns: []
 */
export function clearSorts<K extends string = string>(): SortValue<K>[] {
  return [];
}

/**
 * Obtiene la direccion de ordenamiento de un campo.
 *
 * @param sorts - Array de ordenamientos actual.
 * @param field - Campo del cual obtener la direccion.
 * @returns Direccion de ordenamiento o `undefined` si no esta ordenado.
 *
 * @example
 * getSortDir(sorts, 'createdAt')
 * // Returns: 'desc' or undefined
 */
export function getSortDir<K extends string = string>(
  sorts: SortValue<K>[],
  field: K,
): SortDir | undefined {
  const sort = sorts.find((s) => s.key === field);
  return sort?.dir;
}

/**
 * Verifica si un campo tiene ordenamiento aplicado.
 *
 * @param sorts - Array de ordenamientos actual.
 * @param field - Campo a verificar.
 * @returns `true` si el campo tiene ordenamiento.
 *
 * @example
 * isSorted(sorts, 'createdAt')
 * // Returns: true or false
 */
export function isSorted<K extends string = string>(
  sorts: SortValue<K>[],
  field: K,
): boolean {
  return sorts.some((s) => s.key === field);
}

/**
 * Convierte un array de ordenamientos a una cadena compatible con el backend.
 *
 * Formato: 'field:dir,field2:dir2'
 *
 * @param sorts - Array de ordenamientos.
 * @returns Cadena de ordenamiento para el backend.
 *
 * @example
 * sortsToString([{ key: 'createdAt', dir: 'desc' }, { key: 'id', dir: 'asc' }])
 * // Returns: 'createdAt:desc,id:asc'
 */
export function sortsToString<K extends string = string>(
  sorts: SortValue<K>[],
): string {
  if (!sorts || sorts.length === 0) {
    return '';
  }

  return sorts.map((sort) => `${sort.key}:${sort.dir}`).join(',');
}

/**
 * Parsea una cadena de ordenamiento a un array de valores de ordenamiento.
 *
 * @param sortString - Cadena de ordenamiento del backend (ej: 'createdAt:desc,id:asc').
 * @returns Array de valores de ordenamiento.
 *
 * @example
 * parseSortString('createdAt:desc,id:asc')
 * // Returns: [{ key: 'createdAt', dir: 'desc' }, { key: 'id', dir: 'asc' }]
 */
export function parseSortString<K extends string = string>(
  sortString: string,
): SortValue<K>[] {
  if (!sortString || sortString.trim() === '') {
    return [];
  }

  return sortString.split(',').map((part) => {
    const [key, dir] = part.split(':');
    return {
      key: key as K,
      dir: (dir === 'desc' ? 'desc' : 'asc') as SortDir,
    };
  });
}

/**
 * Establece los ordenamientos desde un array, reemplazando todos los existentes.
 *
 * @param sorts - Nuevo array de ordenamientos.
 * @returns Copia del nuevo array de ordenamientos.
 *
 * @example
 * setSorts([{ key: 'createdAt', dir: 'desc' }])
 * // Returns: [{ key: 'createdAt', dir: 'desc' }]
 */
export function setSorts<K extends string = string>(
  sorts: SortValue<K>[],
): SortValue<K>[] {
  return [...sorts];
}
