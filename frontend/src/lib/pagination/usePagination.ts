/**
 * @fileoverview Hook de paginacion para gestion de estado y navegacion
 *
 * Hook de React para gestionar el estado de paginacion por cursor
 * con sincronizacion automatica de la URL.
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useTransition } from 'react';
import { addFilter, removeFieldFilters, removeFilter } from './filter-utils';
import { buildUrl } from './query-builder';
import { addSort, removeSort, toggleSort } from './sort-utils';
import type {
  CursorPaginationResponse,
  FilterOp,
  FilterValue,
  PaginationState,
  SortDir,
  SortValue,
} from './types';

/**
 * Configuracion del hook de paginacion.
 */
export interface UsePaginationConfig<K extends string = string> {
  /** Ruta base de la URL (ej: '/repositories'). */
  basePath: string;

  /** Limite por defecto si no esta en la URL. */
  defaultLimit?: number;

  /** Ordenamientos por defecto si no estan en la URL. */
  defaultSorts?: SortValue<K>[];

  /** Si se debe incluir el conteo total en las peticiones. */
  includeTotal?: boolean;

  /** Si se debe incluir el conteo de restantes en las peticiones. */
  includeRemaining?: boolean;
}

/**
 * Tipo de retorno del hook de paginacion.
 */
export interface UsePaginationReturn<K extends string = string> {
  /** Estado actual de paginacion. */
  state: PaginationState<K>;

  /** Navegar a la pagina siguiente. */
  goToNext: (response: CursorPaginationResponse<unknown>) => void;

  /** Navegar a la pagina anterior. */
  goToPrev: (response: CursorPaginationResponse<unknown>) => void;

  /** Navegar a la primera pagina (limpia el cursor). */
  goToFirst: () => void;

  /** Agregar o actualizar un ordenamiento. */
  addSort: (field: K, dir: SortDir) => void;

  /** Eliminar un ordenamiento. */
  removeSort: (field: K) => void;

  /** Alternar direccion de ordenamiento (asc -> desc -> ninguno). */
  toggleSort: (field: K) => void;

  /** Agregar o actualizar un filtro. */
  addFilter: (
    field: K,
    op: FilterOp,
    value: string | string[] | boolean | null,
    type?: 'hard' | 'soft',
  ) => void;

  /** Eliminar un filtro especifico. */
  removeFilter: (field: K, op: FilterOp, type?: 'hard' | 'soft') => void;

  /** Eliminar todos los filtros de un campo. */
  removeFieldFilters: (field: K) => void;

  /** Limpiar todos los filtros. */
  clearFilters: () => void;

  /** Limpiar todos los ordenamientos y filtros. */
  reset: () => void;

  /** Establecer el limite de pagina. */
  setLimit: (limit: number) => void;

  /** Indica si hay una navegacion pendiente. */
  isPending: boolean;
}

/**
 * Hook para gestionar paginacion por cursor con sincronizacion de URL.
 *
 * Proporciona metodos de navegacion, ordenamiento y filtrado con
 * actualizacion automatica de la URL. Utiliza el router de Next.js
 * para navegacion en cliente con transiciones.
 *
 * @param config - Configuracion de paginacion.
 * @returns Estado de paginacion y metodos de control.
 *
 * @example
 * const pagination = usePagination({
 *   basePath: '/repositories',
 *   defaultLimit: 20,
 *   defaultSorts: [{ key: 'createdAt', dir: 'desc' }],
 *   includeTotal: true,
 * });
 *
 * // Navigate to next page
 * pagination.goToNext(currentResponse);
 *
 * // Toggle sort
 * pagination.toggleSort('ghName');
 *
 * // Add filter
 * pagination.addFilter('ghName', 'contains', 'awesome');
 */
export function usePagination<K extends string = string>(
  config: UsePaginationConfig<K>,
): UsePaginationReturn<K> {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const {
    basePath,
    defaultLimit = 20,
    defaultSorts = [],
    includeTotal = false,
    includeRemaining = false,
  } = config;

  // Parse current state from URL
  const state = useMemo((): PaginationState<K> => {
    const cursor = searchParams.get('cursor') || undefined;
    const cursorDir = searchParams.get('cursorDir') as
      | 'next'
      | 'prev'
      | undefined;
    const limit = Number(searchParams.get('limit')) || defaultLimit;
    const sortParam = searchParams.get('sort');

    // Parse sorts
    let sorts: SortValue<K>[] = defaultSorts;
    if (sortParam) {
      sorts = sortParam.split(',').map((part) => {
        const [key, dir] = part.split(':');
        return {
          key: key as K,
          dir: (dir === 'desc' ? 'desc' : 'asc') as SortDir,
        };
      });
    }

    // Parse filters from all query params
    const filters: FilterValue<K>[] = [];
    for (const [key, value] of searchParams.entries()) {
      if (
        [
          'cursor',
          'cursorDir',
          'limit',
          'sort',
          'includeTotal',
          'includeRemaining',
        ].includes(key)
      ) {
        continue;
      }

      // Determine filter type and field
      let type: 'hard' | 'soft' = 'soft';
      let remainder = key;

      if (key.startsWith('hard')) {
        type = 'hard';
        remainder = key.slice(4);
      } else if (key.startsWith('soft')) {
        type = 'soft';
        remainder = key.slice(4);
      } else {
        continue;
      }

      // Find operation suffix
      const opSuffixes: [FilterOp, string][] = [
        ['contains', 'Contains'],
        ['endsWith', 'EndsWith'],
        ['startsWith', 'StartsWith'],
        ['isNotNull', 'IsNotNull'],
        ['isNull', 'IsNull'],
        ['ilike', 'ILike'],
        ['like', 'Like'],
        ['notIn', 'NotIn'],
        ['in', 'In'],
        ['gte', 'Gte'],
        ['lte', 'Lte'],
        ['neq', 'Neq'],
        ['eq', 'Eq'],
        ['gt', 'Gt'],
        ['lt', 'Lt'],
      ];

      for (const [op, suffix] of opSuffixes) {
        if (remainder.endsWith(suffix)) {
          const fieldName = remainder.slice(0, -suffix.length);
          const field = (fieldName.charAt(0).toLowerCase() +
            fieldName.slice(1)) as K;

          let filterValue: string | string[] | boolean | null = value;
          if (value === 'null') {
            filterValue = null;
          } else if (value === 'true') {
            filterValue = true;
          } else if (value === 'false') {
            filterValue = false;
          } else if (value.includes(',') && (op === 'in' || op === 'notIn')) {
            filterValue = value.split(',');
          }

          filters.push({ field, op, value: filterValue, type });
          break;
        }
      }
    }

    return {
      cursor,
      cursorDir,
      limit,
      sorts,
      filters,
      includeTotal,
      includeRemaining,
    };
  }, [
    searchParams,
    defaultLimit,
    defaultSorts,
    includeTotal,
    includeRemaining,
  ]);

  // Navigate to a new state
  const navigate = useCallback(
    (newState: PaginationState<K>) => {
      const url = buildUrl(basePath, newState);
      startTransition(() => {
        router.push(url);
      });
    },
    [basePath, router],
  );

  // Navigation methods
  const goToNext = useCallback(
    (response: CursorPaginationResponse<unknown>) => {
      if (response.meta.nextCursor) {
        navigate({
          ...state,
          cursor: response.meta.nextCursor,
          cursorDir: 'next',
        });
      }
    },
    [navigate, state],
  );

  const goToPrev = useCallback(
    (response: CursorPaginationResponse<unknown>) => {
      if (response.meta.prevCursor) {
        navigate({
          ...state,
          cursor: response.meta.prevCursor,
          cursorDir: 'prev',
        });
      }
    },
    [navigate, state],
  );

  const goToFirst = useCallback(() => {
    navigate({
      ...state,
      cursor: undefined,
      cursorDir: undefined,
    });
  }, [navigate, state]);

  // Sort methods
  const handleAddSort = useCallback(
    (field: K, dir: SortDir) => {
      const newSorts = addSort(state.sorts, field, dir);
      navigate({
        ...state,
        sorts: newSorts,
        cursor: undefined, // Reset cursor when sorting changes
        cursorDir: undefined,
      });
    },
    [navigate, state],
  );

  const handleRemoveSort = useCallback(
    (field: K) => {
      const newSorts = removeSort(state.sorts, field);
      navigate({
        ...state,
        sorts: newSorts,
        cursor: undefined,
        cursorDir: undefined,
      });
    },
    [navigate, state],
  );

  const handleToggleSort = useCallback(
    (field: K) => {
      const newSorts = toggleSort(state.sorts, field);
      navigate({
        ...state,
        sorts: newSorts,
        cursor: undefined,
        cursorDir: undefined,
      });
    },
    [navigate, state],
  );

  // Filter methods
  const handleAddFilter = useCallback(
    (
      field: K,
      op: FilterOp,
      value: string | string[] | boolean | null,
      type: 'hard' | 'soft' = 'soft',
    ) => {
      const newFilters = addFilter(state.filters, field, op, value, type);
      navigate({
        ...state,
        filters: newFilters,
        cursor: undefined, // Reset cursor when filters change
        cursorDir: undefined,
      });
    },
    [navigate, state],
  );

  const handleRemoveFilter = useCallback(
    (field: K, op: FilterOp, type: 'hard' | 'soft' = 'soft') => {
      const newFilters = removeFilter(state.filters, field, op, type);
      navigate({
        ...state,
        filters: newFilters,
        cursor: undefined,
        cursorDir: undefined,
      });
    },
    [navigate, state],
  );

  const handleRemoveFieldFilters = useCallback(
    (field: K) => {
      const newFilters = removeFieldFilters(state.filters, field);
      navigate({
        ...state,
        filters: newFilters,
        cursor: undefined,
        cursorDir: undefined,
      });
    },
    [navigate, state],
  );

  const clearFilters = useCallback(() => {
    navigate({
      ...state,
      filters: [],
      cursor: undefined,
      cursorDir: undefined,
    });
  }, [navigate, state]);

  // Reset method
  const reset = useCallback(() => {
    navigate({
      ...state,
      sorts: defaultSorts,
      filters: [],
      cursor: undefined,
      cursorDir: undefined,
    });
  }, [navigate, state, defaultSorts]);

  // Limit method
  const setLimit = useCallback(
    (limit: number) => {
      navigate({
        ...state,
        limit,
        cursor: undefined,
        cursorDir: undefined,
      });
    },
    [navigate, state],
  );

  return {
    state,
    goToNext,
    goToPrev,
    goToFirst,
    addSort: handleAddSort,
    removeSort: handleRemoveSort,
    toggleSort: handleToggleSort,
    addFilter: handleAddFilter,
    removeFilter: handleRemoveFilter,
    removeFieldFilters: handleRemoveFieldFilters,
    clearFilters,
    reset,
    setLimit,
    isPending,
  };
}
