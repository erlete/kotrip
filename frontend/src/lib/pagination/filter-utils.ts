/**
 * @fileoverview Utilidades de filtrado para paginacion por cursor
 *
 * Funciones auxiliares para gestionar filtros en el estado de paginacion
 * y en los parametros de consulta.
 */

import { FilterOpSuffix } from './types';
import type { FilterOp, FilterValue } from './types';

/**
 * Agrega un filtro al array de filtros.
 *
 * Si ya existe un filtro con el mismo campo y operacion, lo reemplaza.
 *
 * @param filters - Array de filtros actual.
 * @param field - Campo a filtrar.
 * @param op - Operacion del filtro.
 * @param value - Valor del filtro.
 * @param type - Tipo de filtro (hard o soft).
 * @returns Nuevo array de filtros con el filtro agregado/actualizado.
 *
 * @example
 * addFilter([], 'ghName', 'contains', 'awesome', 'soft')
 * // Returns: [{ field: 'ghName', op: 'contains', value: 'awesome', type: 'soft' }]
 */
export function addFilter<K extends string = string>(
  filters: FilterValue<K>[],
  field: K,
  op: FilterOp,
  value: string | string[] | boolean | null,
  type: 'hard' | 'soft' = 'soft',
): FilterValue<K>[] {
  // Remove existing filter with same field and op
  const filtered = filters.filter(
    (f) => !(f.field === field && f.op === op && f.type === type),
  );

  // Add new filter
  return [...filtered, { field, op, value, type }];
}

/**
 * Elimina un filtro del array de filtros.
 *
 * @param filters - Array de filtros actual.
 * @param field - Campo del cual eliminar el filtro.
 * @param op - Operacion del filtro a eliminar.
 * @param type - Tipo de filtro (hard o soft).
 * @returns Nuevo array de filtros sin el filtro eliminado.
 *
 * @example
 * removeFilter(filters, 'ghName', 'contains', 'soft')
 * // Returns: filters without the matching filter
 */
export function removeFilter<K extends string = string>(
  filters: FilterValue<K>[],
  field: K,
  op: FilterOp,
  type: 'hard' | 'soft' = 'soft',
): FilterValue<K>[] {
  return filters.filter(
    (f) => !(f.field === field && f.op === op && f.type === type),
  );
}

/**
 * Elimina todos los filtros de un campo especifico.
 *
 * @param filters - Array de filtros actual.
 * @param field - Campo del cual eliminar todos los filtros.
 * @returns Nuevo array de filtros sin los filtros del campo indicado.
 *
 * @example
 * removeFieldFilters(filters, 'ghName')
 * // Returns: filters without any filters on ghName
 */
export function removeFieldFilters<K extends string = string>(
  filters: FilterValue<K>[],
  field: K,
): FilterValue<K>[] {
  return filters.filter((f) => f.field !== field);
}

/**
 * Limpia todos los filtros.
 *
 * @returns Array de filtros vacio.
 *
 * @example
 * clearFilters()
 * // Returns: []
 */
export function clearFilters<K extends string = string>(): FilterValue<K>[] {
  return [];
}

/**
 * Obtiene el valor de un filtro para un campo y operacion especificos.
 *
 * @param filters - Array de filtros actual.
 * @param field - Campo del filtro a buscar.
 * @param op - Operacion del filtro.
 * @param type - Tipo de filtro (hard o soft).
 * @returns Valor del filtro o `undefined` si no se encontro.
 *
 * @example
 * getFilter(filters, 'ghName', 'contains', 'soft')
 * // Returns: 'awesome' or undefined
 */
export function getFilter<K extends string = string>(
  filters: FilterValue<K>[],
  field: K,
  op: FilterOp,
  type: 'hard' | 'soft' = 'soft',
): string | string[] | boolean | null | undefined {
  const filter = filters.find(
    (f) => f.field === field && f.op === op && f.type === type,
  );
  return filter?.value;
}

/**
 * Verifica si un filtro existe.
 *
 * @param filters - Array de filtros actual.
 * @param field - Campo a verificar.
 * @param op - Operacion del filtro.
 * @param type - Tipo de filtro (hard o soft).
 * @returns `true` si el filtro existe.
 *
 * @example
 * hasFilter(filters, 'ghName', 'contains', 'soft')
 * // Returns: true or false
 */
export function hasFilter<K extends string = string>(
  filters: FilterValue<K>[],
  field: K,
  op: FilterOp,
  type: 'hard' | 'soft' = 'soft',
): boolean {
  return filters.some(
    (f) => f.field === field && f.op === op && f.type === type,
  );
}

/**
 * Convierte un array de filtros a un objeto de parametros de consulta.
 *
 * Utiliza el formato de filtros del backend: {type}{FieldName}{Operation}={value}
 *
 * @param filters - Array de filtros.
 * @returns Objeto de parametros de consulta.
 *
 * @example
 * filtersToQueryParams([
 *   { field: 'ghName', op: 'contains', value: 'awesome', type: 'soft' }
 * ])
 * // Returns: { softGhNameContains: 'awesome' }
 */
export function filtersToQueryParams<K extends string = string>(
  filters: FilterValue<K>[],
): Record<string, string | string[] | boolean | null> {
  const params: Record<string, string | string[] | boolean | null> = {};

  for (const filter of filters) {
    // Capitalize first letter of field name
    const fieldName =
      filter.field.charAt(0).toUpperCase() + filter.field.slice(1);

    // Get operation suffix
    const opSuffix =
      (FilterOpSuffix as Record<string, string>)[filter.op] || '';

    // Build param name: {type}{FieldName}{Operation}
    const paramName = `${filter.type}${fieldName}${opSuffix}`;

    params[paramName] = filter.value;
  }

  return params;
}

/**
 * Parsea un filtro a partir del nombre y valor de un parametro de consulta.
 *
 * Convierte el formato de filtro del backend de vuelta a un objeto FilterValue.
 *
 * @param paramName - Nombre del parametro de consulta (ej: 'softGhNameContains').
 * @param value - Valor del parametro de consulta.
 * @returns Objeto FilterValue o `null` si no se puede parsear.
 *
 * @example
 * parseFilterFromParam('softGhNameContains', 'awesome')
 * // Returns: { field: 'ghName', op: 'contains', value: 'awesome', type: 'soft' }
 */
export function parseFilterFromParam<K extends string = string>(
  paramName: string,
  value: string | string[] | boolean | null,
): FilterValue<K> | null {
  // Check if it starts with 'hard' or 'soft'
  let type: 'hard' | 'soft';
  let remainder: string;

  if (paramName.startsWith('hard')) {
    type = 'hard';
    remainder = paramName.slice(4);
  } else if (paramName.startsWith('soft')) {
    type = 'soft';
    remainder = paramName.slice(4);
  } else {
    return null;
  }

  // Find operation suffix
  const opSuffixes = Object.entries(FilterOpSuffix as Record<string, string>);
  let op: FilterOp | null = null;
  let fieldName: string | null = null;

  for (const [operation, suffix] of opSuffixes) {
    if (remainder.endsWith(suffix)) {
      op = operation as FilterOp;
      fieldName = remainder.slice(0, -suffix.length);
      break;
    }
  }

  if (!op || !fieldName) {
    return null;
  }

  // Convert first letter to lowercase for field name
  const field = (fieldName.charAt(0).toLowerCase() + fieldName.slice(1)) as K;

  return { field, op, value, type };
}
