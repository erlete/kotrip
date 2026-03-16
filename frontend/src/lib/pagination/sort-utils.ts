/**
 * @fileoverview Sort utilities for cursor pagination
 *
 * Utilities for managing sorts in pagination state and query parameters.
 */

import type { SortDir, SortValue } from './types';

/**
 * Adds or updates a sort in the sort array.
 *
 * If a sort for the field already exists, it updates the direction.
 * If not, it adds a new sort at the beginning of the array.
 *
 * @param sorts - Current sort array
 * @param field - Field to sort on
 * @param dir - Sort direction
 * @returns New sort array with the sort added/updated
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
 * Removes a sort from the sort array.
 *
 * @param sorts - Current sort array
 * @param field - Field to remove sort from
 * @returns New sort array with the sort removed
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
 * Toggles sort direction for a field.
 *
 * If the field is not currently sorted, adds ascending sort.
 * If ascending, changes to descending.
 * If descending, removes the sort.
 *
 * @param sorts - Current sort array
 * @param field - Field to toggle sort for
 * @returns New sort array with toggled sort
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
 * Clears all sorts.
 *
 * @returns Empty sort array
 *
 * @example
 * clearSorts()
 * // Returns: []
 */
export function clearSorts<K extends string = string>(): SortValue<K>[] {
  return [];
}

/**
 * Gets sort direction for a field.
 *
 * @param sorts - Current sort array
 * @param field - Field to get sort direction for
 * @returns Sort direction or undefined if not sorted
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
 * Checks if a field is sorted.
 *
 * @param sorts - Current sort array
 * @param field - Field to check
 * @returns True if field is sorted
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
 * Converts sort array to backend-compatible string.
 *
 * Format: 'field:dir,field2:dir2'
 *
 * @param sorts - Sort array
 * @returns Sort string for backend
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
 * Parses sort string to sort array.
 *
 * @param sortString - Sort string from backend (e.g., 'createdAt:desc,id:asc')
 * @returns Array of sort values
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
 * Sets sorts from an array, replacing all existing sorts.
 *
 * @param sorts - New sort array
 * @returns New sort array
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
