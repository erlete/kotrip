/**
 * @fileoverview Frontend cursor pagination types
 *
 * Type definitions for working with cursor-paginated responses from the backend.
 * Provides type-safe interfaces for navigation, filtering, and sorting.
 */

/**
 * Filter operations supported by the backend pagination library.
 *
 * Each operation maps to a specific SQL condition.
 */
export type FilterOp =
  | 'contains' // String contains (wrapped with %)
  | 'endsWith' // String ends with (prefixed with %)
  | 'eq' // Equal to
  | 'gt' // Greater than
  | 'gte' // Greater than or equal to
  | 'ilike' // SQL ILIKE (case-insensitive)
  | 'in' // In array
  | 'isNotNull' // Is NOT NULL
  | 'isNull' // Is NULL
  | 'like' // SQL LIKE (case-sensitive)
  | 'lt' // Less than
  | 'lte' // Less than or equal to
  | 'neq' // Not equal to
  | 'notIn' // Not in array
  | 'startsWith'; // String starts with (suffixed with %)

/**
 * Mapping of filter operations to their query parameter suffixes.
 *
 * @example
 * FilterOpSuffix['gte'] = 'Gte'  // Query param: createdAtGte
 * FilterOpSuffix['in'] = 'In'    // Query param: statusIn
 */
export const FilterOpSuffix: Record<FilterOp, string> = {
  contains: 'Contains',
  endsWith: 'EndsWith',
  eq: 'Eq',
  gt: 'Gt',
  gte: 'Gte',
  ilike: 'ILike',
  in: 'In',
  isNotNull: 'IsNotNull',
  isNull: 'IsNull',
  like: 'Like',
  lt: 'Lt',
  lte: 'Lte',
  neq: 'Neq',
  notIn: 'NotIn',
  startsWith: 'StartsWith',
};

/**
 * Sort direction: ascending or descending.
 */
export type SortDir = 'asc' | 'desc';

/**
 * Cursor direction for pagination navigation.
 */
export type CursorDir = 'next' | 'prev';

/**
 * Sort value: a field key with direction.
 *
 * @example
 * { key: 'createdAt', dir: 'desc' }
 * { key: 'ghName', dir: 'asc' }
 */
export interface SortValue<K extends string = string> {
  key: K;
  dir: SortDir;
}

/**
 * Filter value: field, operation, and value.
 *
 * @example
 * { field: 'ghName', op: 'contains', value: 'awesome' }
 * { field: 'createdAt', op: 'gte', value: '2024-01-01' }
 */
export interface FilterValue<K extends string = string> {
  field: K;
  op: FilterOp;
  value: string | string[] | boolean | null;
  type: 'hard' | 'soft';
}

/**
 * Standard cursor pagination response from backend.
 *
 * @template TDto - The DTO type of items in data array
 */
export interface CursorPaginationResponse<TDto> {
  /** Array of items for this page */
  data: TDto[];

  /** Pagination metadata */
  meta: {
    /** Actual number of items returned */
    count: number;

    /** Applied filters with their operations and values */
    filtersApplied: string[];

    /** Whether there are more items after this page */
    hasNext: boolean;

    /** Whether there are items before this page */
    hasPrev: boolean;

    /** Requested page size */
    limit: number;

    /** Opaque cursor for next page (if hasNext is true) */
    nextCursor?: string;

    /** Opaque cursor for previous page (if hasPrev is true) */
    prevCursor?: string;

    /** Remaining items from current cursor position (only present if includeRemaining was true) */
    remaining?: number;

    /** Applied sort configuration (normalized) */
    sortApplied: string[];

    /** Total item count (only present if includeTotal was true) */
    total?: number;
  };
}

/**
 * Pagination state for managing cursor navigation and filters.
 *
 * @template K - Union of available field keys for sorting/filtering
 */
export interface PaginationState<K extends string = string> {
  /** Current cursor (undefined for first page) */
  cursor?: string;

  /** Cursor direction (for navigation) */
  cursorDir?: CursorDir;

  /** Page size limit */
  limit: number;

  /** Active sort values */
  sorts: SortValue<K>[];

  /** Active filter values */
  filters: FilterValue<K>[];

  /** Whether to include total count */
  includeTotal?: boolean;

  /** Whether to include remaining count */
  includeRemaining?: boolean;
}

/**
 * Query parameters for cursor pagination requests.
 */
export interface PaginationQueryParams {
  /** Opaque cursor string */
  cursor?: string;

  /** Cursor direction */
  cursorDir?: CursorDir;

  /** Page size */
  limit?: number;

  /** Sort parameters (e.g., 'createdAt:desc,id:asc') */
  sort?: string;

  /** Whether to include total count */
  includeTotal?: boolean;

  /** Whether to include remaining count */
  includeRemaining?: boolean;

  /** Dynamic filter parameters */
  [key: string]: boolean | null | number | string | string[] | undefined;
}
