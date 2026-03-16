/**
 * @fileoverview Utilidades de cursor para paginacion
 *
 * Funciones auxiliares para trabajar con cursores de paginacion
 * y metadatos de las respuestas del backend.
 */

import type { CursorPaginationResponse, SortValue } from './types';

/**
 * Parsea una cadena de ordenamiento del backend.
 *
 * Convierte el formato 'field:dir,field2:dir2' a un array de objetos SortValue.
 *
 * @param sortString - Cadena de ordenamiento del backend (ej: 'createdAt:desc,id:asc')
 * @returns Array de valores de ordenamiento.
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
 * Formatea valores de ordenamiento a una cadena compatible con el backend.
 *
 * Convierte un array de objetos SortValue al formato 'field:dir,field2:dir2'.
 *
 * @param sorts - Array de valores de ordenamiento.
 * @returns Cadena de ordenamiento para el backend.
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
 * Extrae los valores de ordenamiento de la respuesta paginada del backend.
 *
 * Parsea el campo sortApplied de los metadatos para obtener los ordenamientos activos.
 *
 * @param response - Respuesta paginada del backend.
 * @returns Array de valores de ordenamiento.
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
 * Verifica si la respuesta paginada tiene una pagina siguiente.
 *
 * @param response - Respuesta paginada del backend.
 * @returns `true` si hay mas elementos despues de la pagina actual.
 */
export function hasNextPage<TDto>(
  response: CursorPaginationResponse<TDto>,
): boolean {
  return response.meta.hasNext;
}

/**
 * Verifica si la respuesta paginada tiene una pagina anterior.
 *
 * @param response - Respuesta paginada del backend.
 * @returns `true` si hay elementos antes de la pagina actual.
 */
export function hasPrevPage<TDto>(
  response: CursorPaginationResponse<TDto>,
): boolean {
  return response.meta.hasPrev;
}

/**
 * Obtiene el cursor de la pagina siguiente de la respuesta paginada.
 *
 * @param response - Respuesta paginada del backend.
 * @returns Cursor siguiente o `undefined` si no hay pagina siguiente.
 */
export function getNextCursor<TDto>(
  response: CursorPaginationResponse<TDto>,
): string | undefined {
  return response.meta.nextCursor;
}

/**
 * Obtiene el cursor de la pagina anterior de la respuesta paginada.
 *
 * @param response - Respuesta paginada del backend.
 * @returns Cursor anterior o `undefined` si no hay pagina anterior.
 */
export function getPrevCursor<TDto>(
  response: CursorPaginationResponse<TDto>,
): string | undefined {
  return response.meta.prevCursor;
}

/**
 * Obtiene el conteo total de la respuesta paginada.
 *
 * @param response - Respuesta paginada del backend.
 * @returns Total de elementos o `undefined` si no fue solicitado.
 */
export function getTotalCount<TDto>(
  response: CursorPaginationResponse<TDto>,
): number | undefined {
  return response.meta.total;
}

/**
 * Obtiene el conteo de elementos restantes de la respuesta paginada.
 *
 * @param response - Respuesta paginada del backend.
 * @returns Elementos restantes o `undefined` si no fue solicitado.
 */
export function getRemainingCount<TDto>(
  response: CursorPaginationResponse<TDto>,
): number | undefined {
  return response.meta.remaining;
}

/**
 * Obtiene la cantidad real de elementos en la pagina actual.
 *
 * @param response - Respuesta paginada del backend.
 * @returns Numero de elementos en el array de datos.
 */
export function getItemCount<TDto>(
  response: CursorPaginationResponse<TDto>,
): number {
  return response.meta.count;
}

/**
 * Obtiene el limite de tamano de pagina solicitado.
 *
 * @param response - Respuesta paginada del backend.
 * @returns Valor del limite solicitado.
 */
export function getLimit<TDto>(
  response: CursorPaginationResponse<TDto>,
): number {
  return response.meta.limit;
}
