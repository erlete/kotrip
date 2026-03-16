/**
 * @fileoverview Query builder for cursor pagination
 *
 * Utilities for building URL query parameters from pagination state.
 */

import { filtersToQueryParams } from './filter-utils';
import { sortsToString } from './sort-utils';
import type { PaginationQueryParams, PaginationState } from './types';

/**
 * Builds query parameters object from pagination state.
 *
 * Converts PaginationState to a flat object suitable for URL search params.
 *
 * @param state - Current pagination state
 * @returns Query parameters object
 *
 * @example
 * buildQueryParams({
 *   cursor: 'abc123',
 *   cursorDir: 'next',
 *   limit: 20,
 *   sorts: [{ key: 'createdAt', dir: 'desc' }],
 *   filters: [{ field: 'ghName', op: 'contains', value: 'awesome', type: 'soft' }],
 *   includeTotal: true
 * })
 * // Returns: {
 * //   cursor: 'abc123',
 * //   cursorDir: 'next',
 * //   limit: 20,
 * //   sort: 'createdAt:desc',
 * //   softGhNameContains: 'awesome',
 * //   includeTotal: true
 * // }
 */
export function buildQueryParams<K extends string = string>(
  state: PaginationState<K>,
): PaginationQueryParams {
  const params: PaginationQueryParams = {};

  // Add cursor if present
  if (state.cursor) {
    params.cursor = state.cursor;
  }

  // Add cursor direction if present
  if (state.cursorDir) {
    params.cursorDir = state.cursorDir;
  }

  // Add limit
  params.limit = state.limit;

  // Add sorts if present
  const sortString = sortsToString(state.sorts);
  if (sortString) {
    params.sort = sortString;
  }

  // Add filters
  const filterParams = filtersToQueryParams(state.filters);
  Object.assign(params, filterParams);

  // Add includeTotal if true
  if (state.includeTotal) {
    params.includeTotal = true;
  }

  // Add includeRemaining if true
  if (state.includeRemaining) {
    params.includeRemaining = true;
  }

  return params;
}

/**
 * Converts query parameters object to URLSearchParams.
 *
 * Handles arrays by joining with commas.
 * Skips undefined values.
 *
 * @param params - Query parameters object
 * @returns URLSearchParams instance
 *
 * @example
 * queryParamsToSearchParams({ limit: 20, sort: 'createdAt:desc' })
 * // Returns: URLSearchParams with limit=20&sort=createdAt:desc
 */
export function queryParamsToSearchParams(
  params: PaginationQueryParams,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      // Arrays are joined with commas
      searchParams.set(key, value.join(','));
    } else if (typeof value === 'boolean') {
      // Booleans are converted to strings
      searchParams.set(key, value.toString());
    } else if (value === null) {
      // Null values are converted to 'null' string
      searchParams.set(key, 'null');
    } else {
      // Strings and numbers
      searchParams.set(key, value.toString());
    }
  }

  return searchParams;
}

/**
 * Builds complete URL with query parameters.
 *
 * @param baseUrl - Base URL path
 * @param state - Pagination state
 * @returns Complete URL with query string
 *
 * @example
 * buildUrl('/repositories', state)
 * // Returns: '/repositories?limit=20&sort=createdAt:desc&softGhNameContains=awesome'
 */
export function buildUrl<K extends string = string>(
  baseUrl: string,
  state: PaginationState<K>,
): string {
  const params = buildQueryParams(state);
  const searchParams = queryParamsToSearchParams(params);
  const queryString = searchParams.toString();

  if (!queryString) {
    return baseUrl;
  }

  return `${baseUrl}?${queryString}`;
}

/**
 * Merges additional query parameters into pagination state.
 *
 * Useful for adding custom parameters that aren't part of pagination state.
 *
 * @param state - Pagination state
 * @param additionalParams - Additional query parameters
 * @returns Combined query parameters
 *
 * @example
 * mergeQueryParams(state, { tab: 'active' })
 * // Returns: { ...paginationParams, tab: 'active' }
 */
export function mergeQueryParams<K extends string = string>(
  state: PaginationState<K>,
  additionalParams: Record<string, string | number | boolean | undefined>,
): PaginationQueryParams {
  const baseParams = buildQueryParams(state);
  return { ...baseParams, ...additionalParams };
}

/**
 * Extracts pagination parameters from URLSearchParams.
 *
 * Useful for parsing current URL state.
 *
 * @param searchParams - URLSearchParams from current URL
 * @returns Partial query parameters object
 *
 * @example
 * extractFromSearchParams(new URLSearchParams('limit=20&sort=createdAt:desc'))
 * // Returns: { limit: 20, sort: 'createdAt:desc' }
 */
export function extractFromSearchParams(
  searchParams: URLSearchParams,
): Partial<PaginationQueryParams> {
  const params: Partial<PaginationQueryParams> = {};

  // Extract standard pagination params
  const cursor = searchParams.get('cursor');
  if (cursor) params.cursor = cursor;

  const cursorDir = searchParams.get('cursorDir');
  if (cursorDir === 'next' || cursorDir === 'prev') {
    params.cursorDir = cursorDir;
  }

  const limit = searchParams.get('limit');
  if (limit) params.limit = Number(limit);

  const sort = searchParams.get('sort');
  if (sort) params.sort = sort;

  const includeTotal = searchParams.get('includeTotal');
  if (includeTotal === 'true') params.includeTotal = true;

  const includeRemaining = searchParams.get('includeRemaining');
  if (includeRemaining === 'true') params.includeRemaining = true;

  // Extract all other params (filters)
  for (const [key, value] of searchParams.entries()) {
    if (
      ![
        'cursor',
        'cursorDir',
        'limit',
        'sort',
        'includeTotal',
        'includeRemaining',
      ].includes(key)
    ) {
      // Check if it's a comma-separated array
      if (value.includes(',')) {
        params[key] = value.split(',');
      } else if (value === 'true' || value === 'false') {
        params[key] = value === 'true';
      } else if (value === 'null') {
        params[key] = null;
      } else {
        params[key] = value;
      }
    }
  }

  return params;
}
