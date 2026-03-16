'use server';

import { cookies } from 'next/headers';
import { getCookieOptions } from './cookie-options';
import { decrypt, encrypt } from './crypto';

/** Tipo de flujo OTP protegido por cookie de sesión. */
export type OtpFlow = 'register' | 'login-otp' | 'recover' | 'recover-edit';

/**
 * Payload cifrado almacenado en la cookie de sesión OTP.
 *
 * Contiene la información mínima necesaria para proteger las rutas OTP
 * y vincular cada paso del flujo al usuario que lo inició.
 */
export interface OtpSessionPayload {
  /** Correo electrónico del usuario que inició el flujo. */
  email: string;
  /** Tipo de flujo OTP activo. */
  flow: OtpFlow;
  /** Marca de expiración en segundos (Unix timestamp). */
  exp: number;
}

/** Nombre de la cookie de sesión OTP. */
const OTP_SESSION_COOKIE = 'otp-session';

/** Duración de la sesión OTP en segundos (10 minutos). */
const OTP_SESSION_TTL = 600;

/**
 * Establece la cookie de sesión OTP cifrada.
 *
 * @param payload Datos de la sesión OTP a almacenar.
 */
export async function setOtpSessionCookie(
  payload: Omit<OtpSessionPayload, 'exp'>,
): Promise<void> {
  const fullPayload: OtpSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + OTP_SESSION_TTL,
  };

  const encrypted = encrypt(fullPayload);
  const cookieStore = await cookies();
  cookieStore.set(
    OTP_SESSION_COOKIE,
    encrypted,
    getCookieOptions('otpSession'),
  );
}

/**
 * Obtiene y descifra el payload de la cookie de sesión OTP.
 *
 * @returns Payload descifrado o `null` si la cookie no existe, es inválida o ha expirado.
 */
export async function getOtpSessionPayload(): Promise<OtpSessionPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(OTP_SESSION_COOKIE)?.value;

  if (!raw) return null;

  const payload = decrypt<OtpSessionPayload>(raw);

  if (!payload) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

/**
 * Elimina la cookie de sesión OTP.
 */
export async function clearOtpSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OTP_SESSION_COOKIE);
}
