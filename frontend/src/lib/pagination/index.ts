/**
 * @fileoverview Libreria de paginacion por cursor para el frontend
 *
 * Libreria completa para trabajar con APIs paginadas por cursor desde el frontend.
 * Proporciona utilidades con tipado seguro para navegacion, ordenamiento,
 * filtrado y gestion de URLs.
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

// Tipos principales
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

// Utilidades de cursor
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

// Utilidades de filtrado
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

// Utilidades de ordenamiento
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

// Constructor de consultas
export {
  buildQueryParams,
  buildUrl,
  extractFromSearchParams,
  mergeQueryParams,
  queryParamsToSearchParams,
} from './query-builder';

// Hook de React
export type { UsePaginationConfig, UsePaginationReturn } from './usePagination';
export { usePagination } from './usePagination';
