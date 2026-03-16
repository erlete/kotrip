import { durationToSeconds } from '@/lib/utils/duration';

// Parse environment variables for cookie expiration (in seconds)
const ACCESS_TOKEN_MAX_AGE = durationToSeconds(
  process.env.COOKIE_ACCESS_TOKEN_MAX_AGE || '15m',
);
const REFRESH_TOKEN_MAX_AGE = durationToSeconds(
  process.env.COOKIE_REFRESH_TOKEN_MAX_AGE || '30d',
);
const SESSION_MAX_AGE = durationToSeconds(
  process.env.COOKIE_SESSION_MAX_AGE || '30d',
);

/** Duración de la sesión OTP en segundos (10 minutos). */
const OTP_SESSION_MAX_AGE = 600;

/** Tipos de cookie soportados por el sistema de autenticación. */
export type CookieType =
  | 'accessToken'
  | 'refreshToken'
  | 'session'
  | 'otpSession';

/**
 * Opciones base para cookies de autenticación con expiración dinámica según tipo.
 *
 * @param type Tipo de cookie.
 * @returns Configuración de cookie con maxAge apropiado.
 */
export function getCookieOptions(type: CookieType) {
  const maxAgeMap: Record<CookieType, number> = {
    accessToken: ACCESS_TOKEN_MAX_AGE,
    refreshToken: REFRESH_TOKEN_MAX_AGE,
    session: SESSION_MAX_AGE,
    otpSession: OTP_SESSION_MAX_AGE,
  };

  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeMap[type],
  };
}
