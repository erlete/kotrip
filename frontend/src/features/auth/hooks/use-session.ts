'use client';

import { useAuthContext } from '../providers/auth-provider-internal';

/**
 * Hook para acceder al contexto de autenticación.
 *
 * Devuelve el estado de la sesión (p. ej. `authenticated`, `unauthenticated`, `needsValidation`, `updating`) junto con los datos del usuario cuando están disponibles. Úsalo en componentes cliente para reaccionar a cambios de sesión y mostrar UI condicional.
 *
 * @returns Valor del contexto de autenticación con estado, datos y método `update`.
 */
export function useSession() {
  return useAuthContext();
}
