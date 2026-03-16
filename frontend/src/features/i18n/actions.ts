'use server';

import {
  getSession,
  setAccessToken,
  setRefreshToken,
  setSession,
} from '@/features/auth';
import { fetchUpdateSession } from '@/features/auth/api';
import { cookies } from 'next/headers';
import { defaultLocale, LOCALE_COOKIE_NAME } from './constants';
import { Locale } from './types';

/**
 * Obtiene el locale del usuario desde la cookie de idioma.
 *
 * @returns Codigo de idioma almacenado en la cookie o el locale por defecto.
 */
export async function getUserLocale() {
  return (await cookies()).get(LOCALE_COOKIE_NAME)?.value || defaultLocale;
}

/**
 * Actualiza solo la cookie de idioma (uso interno).
 */
async function setUserLocaleCookie(locale: Locale) {
  (await cookies()).set(LOCALE_COOKIE_NAME, locale);
}

/**
 * Cambia el idioma del usuario.
 *
 * Si el usuario está autenticado:
 * - Actualiza la preferencia en el backend
 * - Actualiza la sesión local con nuevos tokens
 * - La cookie se actualiza automáticamente por el proxy
 *
 * Si no está autenticado:
 * - Solo actualiza la cookie local
 *
 * @param locale Nuevo idioma
 */
export async function setUserLocale(locale: Locale) {
  const session = await getSession();

  if (session) {
    // Usuario autenticado - sincronizar con backend
    try {
      const response = await fetchUpdateSession({ language: locale });

      if ('error' in response) {
        // Error en el backend, pero aún así actualizar cookie para UX
        console.error('Failed to update language in backend:', response.error);
        await setUserLocaleCookie(locale);
      } else {
        // Actualizar sesión y tokens con los datos del backend
        await setSession(response.user);
        await setAccessToken(response.backendTokens.accessToken);
        await setRefreshToken(response.backendTokens.refreshToken);
        // Actualizar la cookie de idioma para que next-intl renderice con el nuevo locale
        await setUserLocaleCookie(locale);
      }
    } catch (error) {
      console.error('Error updating language:', error);
      // Fallback: actualizar solo cookie
      await setUserLocaleCookie(locale);
    }
  } else {
    // No autenticado - solo actualizar cookie
    await setUserLocaleCookie(locale);
  }
}
