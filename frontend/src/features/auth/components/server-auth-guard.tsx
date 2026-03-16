import { Href, redirect } from '@/features/i18n';
import { Role } from '@kotrip/data';
import { forbidden, unauthorized } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { getSession } from '../cookies';

export type ServerAuthGuardProps = PropsWithChildren & {
  /**
   * Modo de protección.
   * - `auth`: requiere sesión (por defecto).
   * - `guest`: requiere NO tener sesión.
   */
  require?: 'auth' | 'guest';

  /**
   * Restricción opcional por roles.
   * Si se provee, el usuario debe tener alguno de estos roles.
   */
  roles?: Role[];

  /** A dónde redirigir si ya está autenticado. Por defecto `/dashboard`. */
  authenticatedRedirectTo?: Href;
};

/**
 * Guard de autenticación en servidor.
 *
 * Úsalo en layouts/pages de App Router cuando quieras una barrera real
 * (no se renderiza HTML para usuarios no autorizados).
 */
export async function ServerAuthGuard({
  children,
  require = 'auth',
  roles,
  authenticatedRedirectTo = '/home',
}: ServerAuthGuardProps) {
  const session = await getSession();

  /* console.log('[Auth Debug] ServerAuthGuard running', {
    require,
    hasSession: !!session,
    sessionId: session?.id,
    roles: roles || 'none',
    userRole: session?.role,
  }); */

  if (require === 'guest') {
    if (session) {
      await doRedirect(authenticatedRedirectTo);
      return null;
    }
    return children;
  }

  // require === "auth"
  if (!session) {
    /* console.log(
      '[Auth Debug] ServerAuthGuard: No session, calling unauthorized()',
    ); */
    unauthorized();
  }

  if (roles && roles.length > 0) {
    const hasRole = roles.includes(session.role as (typeof roles)[number]);
    if (!hasRole) {
      /* console.log(
        '[Auth Debug] ServerAuthGuard: Role check failed, calling forbidden()',
      ); */
      forbidden();
    }
  }

  // console.log('[Auth Debug] ServerAuthGuard: Auth check passed');
  return children;
}

/**
 * Redirige usando la API tipada de next-intl en servidor.
 */
async function doRedirect(to: Href) {
  // La API tipada de next-intl en servidor espera un objeto con { href }.
  return redirect({ href: to });
}
