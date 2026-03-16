'use client';

import { useMemo } from 'react';
import { useSession } from '../hooks/use-session';
import { ServerAuthGuardProps } from './server-auth-guard';

export type ClientAuthGuardProps = Omit<
  ServerAuthGuardProps,
  'unauthenticatedRedirectTo'
>;

/**
 * Guard de autenticación en cliente sin redirecciones (solo renderiza o no).
 * Úsalo en componentes de cliente para proteger secciones de la UI
 * según el estado de autenticación (y/o rol) del usuario.
 */
export function ClientAuthGuard({
  children,
  require = 'auth',
  roles,
}: ClientAuthGuardProps) {
  const { data: user, status } = useSession();

  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);
  const needsValidation = useMemo(() => status === 'needsValidation', [status]);
  const isUnauthenticated = useMemo(
    () => status === 'unauthenticated',
    [status],
  );

  const resolvedRoles = useMemo<string[] | undefined>(() => roles, [roles]);

  const isAllowedByRole = useMemo(() => {
    if (!resolvedRoles || resolvedRoles.length === 0) return true;
    if (!user || needsValidation) return false;
    return resolvedRoles.includes(String(user.role));
  }, [resolvedRoles, user, needsValidation]);

  if (require === 'guest') {
    // Si tiene sesión, esperamos a que ocurra el replace del useEffect.
    if (isAuthenticated) return null;
    return children;
  }

  // require === "auth"
  if (!isUnauthenticated || needsValidation || !isAllowedByRole) return null;

  return children;
}
