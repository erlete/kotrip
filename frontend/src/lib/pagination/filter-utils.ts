/**
 * @fileoverview Filter utilities for cursor pagination
 *
 * Utilities for managing filters in pagination state and query parameters.
 */

import { FilterOpSuffix } from './types';
import type { FilterOp, FilterValue } from './types';

/**
 * Adds a filter to the filter array.
 *
 * If a filter with the same field and operation already exists, it replaces it.
 *
 * @param filters - Current filter array
 * @param field - Field to filter on
 * @param op - Filter operation
 * @param value - Filter value
 * @param type - Filter type (hard or soft)
 * @returns New filter array with the filter added/updated
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
 * Removes a filter from the filter array.
 *
 * @param filters - Current filter array
 * @param field - Field to remove filter from
 * @param op - Filter operation to remove
 * @param type - Filter type (hard or soft)
 * @returns New filter array with the filter removed
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
 * Removes all filters for a specific field.
 *
 * @param filters - Current filter array
 * @param field - Field to remove all filters from
 * @returns New filter array with all filters for the field removed
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
 * Clears all filters.
 *
 * @returns Empty filter array
 *
 * @example
 * clearFilters()
 * // Returns: []
 */
export function clearFilters<K extends string = string>(): FilterValue<K>[] {
  return [];
}

/**
 * Gets filter value for a specific field and operation.
 *
 * @param filters - Current filter array
 * @param field - Field to get filter for
 * @param op - Filter operation
 * @param type - Filter type (hard or soft)
 * @returns Filter value or undefined if not found
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
 * Checks if a filter exists.
 *
 * @param filters - Current filter array
 * @param field - Field to check
 * @param op - Filter operation
 * @param type - Filter type (hard or soft)
 * @returns True if filter exists
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
 * Converts filter array to query parameters object.
 *
 * Uses the backend's filter format: {type}{FieldName}{Operation}={value}
 *
 * @param filters - Filter array
 * @returns Query parameters object
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
 * Parses filter from query parameter name and value.
 *
 * Converts backend filter format back to FilterValue object.
 *
 * @param paramName - Query parameter name (e.g., 'softGhNameContains')
 * @param value - Query parameter value
 * @returns FilterValue or null if unable to parse
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
