'use server';

import { getAccessToken, getRawSession } from './cookies';

/**
 * Decodifica el payload de un JWT sin verificación (solo para leer claims).
 * NO debe usarse para decisiones de seguridad - el backend valida los tokens.
 *
 * @param token JWT token a decodificar
 * @returns Payload con claims exp (expiration) e iat (issued at), o null si falla
 */
function decodeJwtPayload(
  token: string,
): { exp?: number; iat?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Determina si el access token debe ser refrescado basándose en su tiempo de vida.
 *
 * Verifica:
 * - Si existe un access token
 * - Si no estamos en flujo de 2FA (needsValidation)
 * - Si el token ha expirado
 * - Si hemos alcanzado el umbral de refresco (ej: 80% de tiempo de vida)
 *
 * @returns true si el token debe ser refrescado, false en caso contrario
 */
export async function shouldRefreshToken(): Promise<boolean> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    // console.log('[Auth] No access token found');
    return false; // No hay token = no se puede refrescar
  }

  // No refrescar durante el flujo de 2FA
  const session = await getRawSession();
  if (session && 'needsValidation' in session) {
    // console.log('[Auth] In 2FA flow, skipping refresh');
    return false;
  }

  const payload = decodeJwtPayload(accessToken);
  if (!payload?.exp || !payload?.iat) {
    // console.warn('[Auth] Token missing exp/iat claims, needs refresh');
    return true; // Token inválido = debería refrescarse
  }

  const now = Math.floor(Date.now() / 1000);
  const expiration = payload.exp;

  // Token ya expirado
  if (now >= expiration) {
    // console.warn('[Auth] Token already expired');
    return true;
  }

  // Calcular si hemos alcanzado el umbral de refresco
  const issued = payload.iat;
  const lifetime = expiration - issued;
  const threshold = parseFloat(process.env.TOKEN_REFRESH_THRESHOLD || '0.8');
  const refreshTime = issued + lifetime * threshold;

  const shouldRefresh = now >= refreshTime;

  if (shouldRefresh) {
    // const timeUntilExpiry = expiration - now;
    /* console.log(
      `[Auth] Refresh threshold reached (${timeUntilExpiry}s until expiry)`,
    ); */
  }

  // Es momento de refrescar si hemos pasado el umbral
  return shouldRefresh;
}
