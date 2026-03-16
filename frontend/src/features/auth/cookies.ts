'use server';

import { cookies } from 'next/headers';
import { getCookieOptions } from './cookie-options';
import { decrypt, encrypt } from './crypto';
import { Session, ValidatedSession } from './types';

type CookieKey = 'accessToken' | 'refreshToken' | 'session';

/**
 * Obtiene una cookie sin desencriptar.
 *
 * @param key Nombre de la cookie.
 * @returns Cookie encontrada o undefined.
 */
async function getRawCookie(key: CookieKey) {
  const cookieStore = await cookies();
  return cookieStore.get(key);
}

/**
 * Establece una cookie sin encriptar (el valor debe venir ya encriptado).
 *
 * @param key Nombre de la cookie.
 * @param value Valor ya encriptado.
 * @param type Tipo de cookie para determinar el maxAge apropiado.
 */
async function setRawCookie(
  key: CookieKey,
  value: string,
  type: 'accessToken' | 'refreshToken' | 'session',
) {
  const cookieStore = await cookies();
  cookieStore.set(key, value, getCookieOptions(type));
}

// ============ Sesión ============

/**
 * Obtiene la sesión actual desencriptada desde las cookies
 * @returns `null` si no existe una sesión válida
 */
export async function getRawSession(): Promise<Session | null> {
  const sessionCookie = await getRawCookie('session');

  if (!sessionCookie) {
    // console.log('[Auth Debug] getRawSession: No session cookie found');
    return null;
  }

  /* console.log(
    '[Auth Debug] getRawSession: Session cookie exists, attempting decrypt',
  ); */
  const decrypted = decrypt<Session>(sessionCookie.value);

  if (!decrypted) {
    // console.log('[Auth Debug] getRawSession: Decryption failed');
  } else {
    /* console.log('[Auth Debug] getRawSession: Decryption successful', {
      isPending: 'needsValidation' in decrypted,
      isValidated: !('needsValidation' in decrypted),
    }); */
  }

  return decrypted;
}

function isValidatedSession(
  session: Session | null,
): session is ValidatedSession {
  return !!session && !('needsValidation' in session);
}

/**
 * Obtiene únicamente sesiones validadas (ya autenticadas, sin pending 2FA).
 * Devuelve `null` si la sesión no existe o está en estado `needsValidation`.
 */
export async function getSession(): Promise<ValidatedSession | null> {
  const session = await getRawSession();
  const isValid = isValidatedSession(session);

  /* console.log('[Auth Debug] getSession: Validation result', {
    hasSession: !!session,
    isValid,
    reason: !session
      ? 'no session'
      : !isValid
        ? 'has needsValidation flag'
        : 'valid',
  }); */

  return isValid ? session : null;
}

/**
 * Establece la cookie de sesión encriptada
 */
export async function setSession(session: Session): Promise<void> {
  const encryptedSession = encrypt(session);

  await setRawCookie('session', encryptedSession, 'session');
}

// ============ Access Token ============

/**
 * Obtiene el _access token_ desencriptado desde las cookies
 * @returns `null` si el token no existe o falla la desencriptación
 */
export async function getAccessToken(): Promise<string | null> {
  const accessTokenCookie = await getRawCookie('accessToken');

  if (!accessTokenCookie) {
    return null;
  }

  const tokenData = decrypt<string>(accessTokenCookie.value);
  return tokenData ?? null;
}

/**
 * Establece la cookie del _access token_ encriptado
 */
export async function setAccessToken(token: string): Promise<void> {
  const encryptedToken = encrypt(token);

  await setRawCookie('accessToken', encryptedToken, 'accessToken');
}

// ============ Refresh Token ============

/**
 * Obtiene el _refresh token_ desencriptado desde las cookies.
 * @returns `null` si el token no existe o falla la desencriptación
 */
export async function getRefreshToken(): Promise<string | null> {
  const refreshTokenCookie = await getRawCookie('refreshToken');

  if (!refreshTokenCookie) {
    return null;
  }

  const tokenData = decrypt<string>(refreshTokenCookie.value);
  return tokenData ?? null;
}

/**
 * Establece la cookie del refresh token encriptado
 */
export async function setRefreshToken(token: string): Promise<void> {
  const encryptedToken = encrypt(token);

  await setRawCookie('refreshToken', encryptedToken, 'refreshToken');
}

// ============ Limpieza ============

/**
 * Elimina todas las cookies de autenticación (usado al cerrar sesión)
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete('session');
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}
