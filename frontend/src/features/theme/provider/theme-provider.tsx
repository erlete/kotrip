/**
 * @file theme-provider.tsx
 * @description
 * Provider de tema en servidor. Resuelve el tema del usuario desde cookies
 * y lo pasa al provider interno de cliente, evitando parpadeos y
 * desincronizaciones durante la hidratacion.
 */

import { getUserTheme } from '../actions';
import { ThemeProviderInternal } from './theme-provider-internal';

/**
 * Provider de tema en servidor.
 *
 * Obtiene el tema del usuario desde la cookie y lo inyecta en el
 * contexto de cliente mediante ThemeProviderInternal.
 */
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
