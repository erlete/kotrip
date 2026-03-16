/**
 * @file ThemeProvider.tsx
 * @description
 * -----------------------------------------------------
 * Contexto de tema (claro o oscuro) para la aplicación
 * -----------------------------------------------------
 * @version 0.0.1a
 * @created 2025-11-04



 * */

'use client';

import { createContext, useContext, useEffect } from 'react';
import { Theme } from '../types';

const ThemeContext = createContext({
  theme: 'dark' as Theme,
  toggleTheme: async () => {},
});

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

export function useThemeProvider() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useThemeProvider must be used within a ThemeProviderInternal',
    );
  }

  return context;
}
