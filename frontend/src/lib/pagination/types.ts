/**
 * @fileoverview Tipos de paginacion por cursor para el frontend
 *
 * Definiciones de tipos para trabajar con respuestas paginadas por cursor
 * del backend. Provee interfaces con tipado seguro para navegacion,
 * filtrado y ordenamiento.
 */

/**
 * Operaciones de filtrado soportadas por la libreria de paginacion del backend.
 *
 * Cada operacion se corresponde con una condicion SQL especifica.
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
 * Mapeo de operaciones de filtrado a sus sufijos de parametro de consulta.
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
 * Direccion de ordenamiento: ascendente o descendente.
 */
export type SortDir = 'asc' | 'desc';

/**
 * Direccion de cursor para la navegacion de paginacion.
 */
export type CursorDir = 'next' | 'prev';

/**
 * Valor de ordenamiento: clave de campo con direccion.
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
 * Valor de filtro: campo, operacion y valor.
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
 * Respuesta estandar de paginacion por cursor del backend.
 *
 * @template TDto - Tipo DTO de los elementos en el array de datos.
 */
export interface CursorPaginationResponse<TDto> {
  /** Array de elementos de esta pagina. */
  data: TDto[];

  /** Metadatos de paginacion. */
  meta: {
    /** Cantidad real de elementos devueltos. */
    count: number;

    /** Filtros aplicados con sus operaciones y valores. */
    filtersApplied: string[];

    /** Indica si hay mas elementos despues de esta pagina. */
    hasNext: boolean;

    /** Indica si hay elementos antes de esta pagina. */
    hasPrev: boolean;

    /** Tamano de pagina solicitado. */
    limit: number;

    /** Cursor opaco para la siguiente pagina (si hasNext es true). */
    nextCursor?: string;

    /** Cursor opaco para la pagina anterior (si hasPrev es true). */
    prevCursor?: string;

    /** Elementos restantes desde la posicion actual del cursor (solo presente si se solicito includeRemaining). */
    remaining?: number;

    /** Configuracion de ordenamiento aplicada (normalizada). */
    sortApplied: string[];

    /** Conteo total de elementos (solo presente si se solicito includeTotal). */
    total?: number;
  };
}

/**
 * Estado de paginacion para gestionar la navegacion por cursor y filtros.
 *
 * @template K - Union de claves de campo disponibles para ordenamiento/filtrado.
 */
export interface PaginationState<K extends string = string> {
  /** Cursor actual (`undefined` para la primera pagina). */
  cursor?: string;

  /** Direccion del cursor (para navegacion). */
  cursorDir?: CursorDir;

  /** Limite de tamano de pagina. */
  limit: number;

  /** Valores de ordenamiento activos. */
  sorts: SortValue<K>[];

  /** Valores de filtrado activos. */
  filters: FilterValue<K>[];

  /** Si se debe incluir el conteo total. */
  includeTotal?: boolean;

  /** Si se debe incluir el conteo de restantes. */
  includeRemaining?: boolean;
}

/**
 * Parametros de consulta para peticiones de paginacion por cursor.
 */
export interface PaginationQueryParams {
  /** Cadena de cursor opaco. */
  cursor?: string;

  /** Direccion del cursor. */
  cursorDir?: CursorDir;

  /** Tamano de pagina. */
  limit?: number;

  /** Parametros de ordenamiento (ej: 'createdAt:desc,id:asc'). */
  sort?: string;

  /** Si se debe incluir el conteo total. */
  includeTotal?: boolean;

  /** Si se debe incluir el conteo de restantes. */
  includeRemaining?: boolean;

  /** Parametros de filtrado dinamicos. */
  [key: string]: boolean | null | number | string | string[] | undefined;
}
