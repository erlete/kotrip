/**
 * @file theme-provider-internal.tsx
 * @description
 * Contexto de tema (claro u oscuro) para la aplicacion.
 * Provee el tema actual y la funcion para alternarlo a los
 * componentes cliente.
 */

'use client';

import { createContext, useContext, useEffect } from 'react';
import { Theme } from '../types';

const ThemeContext = createContext({
  theme: 'dark' as Theme,
  toggleTheme: async () => {},
});

/**
 * Provider interno de cliente que gestiona el estado del tema visual.
 *
 * Aplica el atributo `data-theme` al elemento raiz del documento
 * y expone el tema actual junto con la funcion de alternancia.
 */
export function ThemeProviderInternal({
  children,
}: {
  children: React.ReactNode;
  theme: Theme;
}) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme: 'dark', toggleTheme: async () => {} }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Acceso al contexto de tema.
 *
 * @throws Error si se usa fuera de `ThemeProviderInternal`.
 */
export function useThemeProvider() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useThemeProvider must be used within a ThemeProviderInternal',
    );
  }

  return context;
}
