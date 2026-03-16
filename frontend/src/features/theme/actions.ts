'use server';

import { appConfig } from '@/config';
import { cookies } from 'next/headers';
import { THEME_COOKIE_NAME } from './constants';
import { Theme } from './types';

export async function getUserTheme(): Promise<Theme> {
  return ((await cookies()).get(THEME_COOKIE_NAME)?.value ??
    appConfig.theme.defaultMode) as Theme;
}

export async function setUserTheme(theme: Theme) {
  (await cookies()).set(THEME_COOKIE_NAME, theme);
}
