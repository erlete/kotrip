/**
 * @fileoverview Cursor utilities for pagination
 *
 * Utilities for working with pagination cursors and metadata from backend responses.
 */

import type { CursorPaginationResponse, SortValue } from './types';

/**
 * Parses sort string from backend response.
 *
 * Converts 'field:dir,field2:dir2' format to array of SortValue objects.
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
      dir: (dir === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
    };
  });
}

/**
 * Formats sort values to backend-compatible string.
 *
 * Converts array of SortValue objects to 'field:dir,field2:dir2' format.
 *
 * @param sorts - Array of sort values
 * @returns Sort string for backend
 *
 * @example
 * formatSortString([{ key: 'createdAt', dir: 'desc' }, { key: 'id', dir: 'asc' }])
 * // Returns: 'createdAt:desc,id:asc'
 */
export function formatSortString<K extends string = string>(
  sorts: SortValue<K>[],
): string {
  if (!sorts || sorts.length === 0) {
    return '';
  }

  return sorts.map((sort) => `${sort.key}:${sort.dir}`).join(',');
}

/**
 * Extracts sort values from backend pagination response.
 *
 * Parses the sortApplied field from meta to get active sorts.
 *
 * @param response - Backend pagination response
 * @returns Array of sort values
 *
 * @example
 * extractSortsFromResponse(response)
 * // Returns: [{ key: 'createdAt', dir: 'desc' }]
 */
export function extractSortsFromResponse<TDto, K extends string = string>(
  response: CursorPaginationResponse<TDto>,
): SortValue<K>[] {
  const sortApplied = response.meta.sortApplied || [];
  if (sortApplied.length === 0) {
    return [];
  }

  // sortApplied is already an array like ['createdAt:desc', 'id:asc']
  return sortApplied.map((sortStr) => {
    const [key, dir] = sortStr.split(':');
    return {
      key: key as K,
      dir: (dir === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
    };
  });
}

/**
 * Checks if pagination response has a next page.
 *
 * @param response - Backend pagination response
 * @returns True if there are more items after current page
 */
export function hasNextPage<TDto>(
  response: CursorPaginationResponse<TDto>,
): boolean {
  return response.meta.hasNext;
}

/**
 * Checks if pagination response has a previous page.
 *
 * @param response - Backend pagination response
 * @returns True if there are items before current page
 */
export function hasPrevPage<TDto>(
  response: CursorPaginationResponse<TDto>,
): boolean {
  return response.meta.hasPrev;
}

/**
 * Gets the next cursor from pagination response.
 *
 * @param response - Backend pagination response
 * @returns Next cursor or undefined if no next page
 */
export function getNextCursor<TDto>(
  response: CursorPaginationResponse<TDto>,
): string | undefined {
  return response.meta.nextCursor;
}

/**
 * Gets the previous cursor from pagination response.
 *
 * @param response - Backend pagination response
 * @returns Previous cursor or undefined if no previous page
 */
export function getPrevCursor<TDto>(
  response: CursorPaginationResponse<TDto>,
): string | undefined {
  return response.meta.prevCursor;
}

/**
 * Gets total count from pagination response.
 *
 * @param response - Backend pagination response
 * @returns Total count or undefined if not requested
 */
export function getTotalCount<TDto>(
  response: CursorPaginationResponse<TDto>,
): number | undefined {
  return response.meta.total;
}

/**
 * Gets remaining count from pagination response.
 *
 * @param response - Backend pagination response
 * @returns Remaining count or undefined if not requested
 */
export function getRemainingCount<TDto>(
  response: CursorPaginationResponse<TDto>,
): number | undefined {
  return response.meta.remaining;
}

/**
 * Gets the actual number of items in current page.
 *
 * @param response - Backend pagination response
 * @returns Number of items in data array
 */
export function getItemCount<TDto>(
  response: CursorPaginationResponse<TDto>,
): number {
  return response.meta.count;
}

/**
 * Gets the requested page size limit.
 *
 * @param response - Backend pagination response
 * @returns Requested limit value
 */
export function getLimit<TDto>(
  response: CursorPaginationResponse<TDto>,
): number {
  return response.meta.limit;
}
