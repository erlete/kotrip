/**
 * @fileoverview Frontend cursor pagination library
 *
 * A comprehensive library for working with cursor-paginated APIs from the frontend.
 * Provides type-safe utilities for navigation, sorting, filtering, and URL management.
 *
 * @example
 * ```tsx
 * import { usePagination } from '@/lib/pagination';
 *
 * function MyComponent() {
 *   const pagination = usePagination({
 *     basePath: '/repositories',
 *     defaultLimit: 20,
 *     includeTotal: true,
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={() => pagination.toggleSort('createdAt')}>
 *         Sort by date
 *       </button>
 *       <button onClick={() => pagination.goToNext(response)}>
 *         Next page
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */

// Core types
export type {
  CursorDir,
  CursorPaginationResponse,
  FilterOp,
  FilterValue,
  PaginationQueryParams,
  PaginationState,
  SortDir,
  SortValue,
} from './types';

export { FilterOpSuffix } from './types';

// Cursor utilities
export {
  extractSortsFromResponse,
  formatSortString,
  getItemCount,
  getLimit,
  getNextCursor,
  getPrevCursor,
  getRemainingCount,
  getTotalCount,
  hasNextPage,
  hasPrevPage,
  parseSortString,
} from './cursor-utils';

// Filter utilities
export {
  addFilter,
  clearFilters,
  filtersToQueryParams,
  getFilter,
  hasFilter,
  parseFilterFromParam,
  removeFieldFilters,
  removeFilter,
} from './filter-utils';

// Sort utilities
export {
  addSort,
  clearSorts,
  getSortDir,
  isSorted,
  parseSortString as parseSorts,
  removeSort,
  setSorts,
  sortsToString,
  toggleSort,
} from './sort-utils';

// Query builder
export {
  buildQueryParams,
  buildUrl,
  extractFromSearchParams,
  mergeQueryParams,
  queryParamsToSearchParams,
} from './query-builder';

// React hook
export type { UsePaginationConfig, UsePaginationReturn } from './usePagination';
export { usePagination } from './usePagination';
