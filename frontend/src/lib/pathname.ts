'use server';

import { headers } from 'next/headers';

/**
 * Obtiene el pathname actual de la solicitud desde los headers del servidor.
 *
 * Busca la ruta en distintos headers (x-next-url, x-url, x-invoke-path, referer)
 * y extrae el pathname si el valor es una URL completa.
 *
 * @returns El pathname de la solicitud o `undefined` si no se puede determinar.
 */
export async function getPathname() {
  const headersList = await headers();
  const candidate =
    headersList.get('x-next-url') ||
    headersList.get('x-url') ||
    headersList.get('x-invoke-path') ||
    headersList.get('referer');

  if (!candidate) return undefined;

  if (candidate.startsWith('/')) return candidate;

  try {
    const url = new URL(candidate);
    return url.pathname;
  } catch {
    return undefined;
  }
}
