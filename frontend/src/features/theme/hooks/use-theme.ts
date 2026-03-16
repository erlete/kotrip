import { useThemeProvider } from '../provider/theme-provider-internal';

/**
 * Hook para acceder al tema actual y la funcion de alternancia.
 *
 * @returns Objeto con el tema actual y la funcion `toggleTheme`.
 */
export function useTheme() {
  return useThemeProvider();
}
