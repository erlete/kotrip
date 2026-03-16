'use server';

import { appConfig } from '@/config';
import { cookies } from 'next/headers';
import { THEME_COOKIE_NAME } from './constants';
import { Theme } from './types';

/**
 * Obtiene el tema del usuario desde la cookie o el valor por defecto.
 *
 * @returns Tema actual del usuario ('light' o 'dark').
 */
export async function getUserTheme(): Promise<Theme> {
  return ((await cookies()).get(THEME_COOKIE_NAME)?.value ??
    appConfig.theme.defaultMode) as Theme;
}

/**
 * Persiste el tema del usuario en una cookie.
 *
 * @param theme - Tema a almacenar ('light' o 'dark').
 */
export async function setUserTheme(theme: Theme) {
  (await cookies()).set(THEME_COOKIE_NAME, theme);
}
