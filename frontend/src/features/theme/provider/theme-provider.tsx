/**
 * @file ThemeServerBoundary.tsx
 * @description
 * -----------------------------------------------------
 * Ensures theme availability and consistency during Server Components rendering.
 * It bridges server-side theme resolution with client hydration,
 * preventing UI flashes, mismatches, and undefined theme states.
 * -----------------------------------------------------
 * @version 0.0.1a
 * @created 2026-01-09




 * */

import { getUserTheme } from '../actions';
import { ThemeProviderInternal } from './theme-provider-internal';

export async function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getUserTheme();

  return (
    <ThemeProviderInternal theme={theme}>{children}</ThemeProviderInternal>
  );
}
