'use server';

import type { Locale } from '@/features/i18n/types';
import { backendClient } from '@/lib/backend/client';
import { getLocale, getTranslations } from 'next-intl/server';
import { getAccessToken, getRefreshToken } from './cookies';
import {
  LoginResponse,
  RegisterResponse,
  ValidatedLoginResponse,
} from './types';

/**
 * Realiza la petición de login al backend.
 *
 * @param params Credenciales del usuario.
 * @returns Respuesta de login (éxito, error o requiere validación 2FA).
 */
export async function fetchLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const t = (await getTranslations('Auth')) as (
    key: string,
    values?: Record<string, unknown>,
  ) => string;
  let data;
  let error;

  try {
    const result = await backendClient.POST('/auth/login', {
      body: {
        email,
        password,
      },
    });
    data = result.data;
    error = result.error;
  } catch {
    return { error: t('serverConnectionError') };
  }

  if (error || !data) {
    const { message, reason } = await getErrorDetails(error);
    return { error: message, reason };
  }

  // Verificar si la respuesta indica que se necesita validación 2FA
  if ('needsValidation' in data && data.needsValidation) {
    return { needsValidation: true };
  }

  // Verificar que tenemos los tokens (respuesta de login exitoso)
  if (!('backendTokens' in data) || !data.backendTokens) {
    return { error: t('invalidAuthResponse') };
  }

  // Respuesta exitosa con tokens y usuario
  return {
    backendTokens: {
      accessToken: data.backendTokens.accessToken,
      refreshToken: data.backendTokens.refreshToken,
    },
    user: data.user,
  };
}

/**
 * Registra un nuevo usuario en la plataforma.
 *
 * @param params Datos del nuevo usuario.
 * @returns Respuesta de registro (éxito o error).
 */
export async function fetchRegister({
  mail,
  firstName,
  lastName,
  password,
  repeatPassword,
}: {
  mail: string;
  firstName: string;
  lastName: string;
  password: string;
  repeatPassword: string;
}): Promise<RegisterResponse> {
  const locale = (await getLocale()) as Locale;

  const { data, error } = await backendClient.POST('/auth/register', {
    params: {
      header: {
        'accept-language': locale,
      },
    },
    body: {
      mail,
      firstName,
      lastName,
      password,
      repeatPassword,
    },
  });

  if (error || !data) {
    return { error: await getErrorMessage(error) };
  }

  return { success: true, data };
}

/**
 * Verifica el email de un usuario mediante código de 6 dígitos.
 *
 * @param email Email del usuario.
 * @param code Código de verificación de 6 dígitos.
 * @returns Objeto con éxito (y resultado de admisión) o error.
 */
export async function fetchVerifyEmail(
  email: string,
  code: string,
): Promise<{
  success?: boolean;
  admissionResult?: 'ADMITTED' | 'PENDING' | 'REJECTED';
  error?: string;
}> {
  // TODO: El endpoint se tipará automáticamente cuando se regeneren los tipos OpenAPI.
  const { data, error } = (await (backendClient.POST as Function)(
    '/auth/verify-email',
    { body: { email, code } },
  )) as { data: Record<string, unknown> | undefined; error: unknown };

  if (error || !data) {
    return { error: await getErrorMessage(error) };
  }

  const result = data as { admissionResult?: string };
  return {
    success: true,
    admissionResult: result.admissionResult as
      | 'ADMITTED'
      | 'PENDING'
      | 'REJECTED'
      | undefined,
  };
}

/**
 * Actualiza la sesión del usuario (idioma, nombre, etc.)
 * y devuelve nuevos tokens con la información actualizada.
 *
 * @param updates Campos a actualizar.
 * @returns Respuesta validada con nuevos tokens y datos de usuario.
 */
export async function fetchUpdateSession(updates: {
  language?: Locale;
  name?: string;
  avatarFileName?: string;
}): Promise<ValidatedLoginResponse> {
  const t = (await getTranslations('Auth')) as (
    key: string,
    values?: Record<string, unknown>,
  ) => string;
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { error: t('noAccessToken') };
  }

  const body: Record<string, unknown> = {};

  if (updates.language) {
    body.language = updates.language;
  }
  if (updates.name !== undefined) {
    body.name = updates.name;
  }
  if (updates.avatarFileName !== undefined) {
    body.avatarFileName = updates.avatarFileName;
  }

  const { data, error } = await backendClient.PATCH('/auth/session', {
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (error || !data) {
    return { error: await getErrorMessage(error) };
  }

  // Verify that we have the tokens
  if (!('backendTokens' in data) || !data.backendTokens) {
    return { error: t('invalidUpdateResponse') };
  }

  return {
    backendTokens: {
      accessToken: data.backendTokens.accessToken,
      refreshToken: data.backendTokens.refreshToken,
    },
    user: data.user,
  };
}

/**
 * Refresca el access token usando el refresh token.
 *
 * Llama al endpoint `/auth/refresh` del backend con el refresh token
 * para obtener nuevos tokens de acceso y refresco.
 *
 * @returns Respuesta validada con nuevos tokens y datos de usuario actualizados
 */
export async function fetchRefreshToken(): Promise<ValidatedLoginResponse> {
  const t = (await getTranslations('Auth')) as (
    key: string,
    values?: Record<string, unknown>,
  ) => string;
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return { error: t('noRefreshToken') };
  }

  const { data, error } = await backendClient.POST('/auth/refresh', {
    headers: {
      Authorization: `Refresh ${refreshToken}`,
    },
  });

  if (error || !data) {
    return { error: await getErrorMessage(error) };
  }

  // Verify that we have the tokens
  if (!('backendTokens' in data) || !data.backendTokens) {
    return { error: t('invalidRefreshResponse') };
  }

  return {
    backendTokens: {
      accessToken: data.backendTokens.accessToken,
      refreshToken: data.backendTokens.refreshToken,
    },
    user: data.user,
  };
}

/**
 * Envía un código OTP de recuperación de contraseña al email proporcionado.
 *
 * @param mail Dirección de correo electrónico del usuario.
 * @returns Objeto con `success` si el código fue enviado, o `error` y opcionalmente `reason` si falló.
 */
export async function fetchSendResetOtp(mail: string): Promise<{
  success?: boolean;
  error?: string;
  reason?: string;
}> {
  // TODO: El endpoint se tipará automáticamente cuando se regeneren los tipos OpenAPI.
  const { error, response } = (await (backendClient.POST as Function)(
    '/auth/send-reset-otp',
    { body: { mail } },
  )) as { error: unknown; response: Response };

  if (!response.ok || error) {
    const details = await getErrorDetails(error);
    return { error: await getErrorMessage(error), reason: details?.reason };
  }

  return { success: true };
}

/**
 * Verifica el código OTP de recuperación de contraseña.
 *
 * @param email Dirección de correo electrónico del usuario.
 * @param code Código OTP de 6 dígitos.
 * @returns Objeto con `success` si el código es válido, o `error` si falló.
 */
export async function fetchVerifyResetOtp(
  email: string,
  code: string,
): Promise<{ success?: boolean; error?: string }> {
  // TODO: El endpoint se tipará automáticamente cuando se regeneren los tipos OpenAPI.
  const { error, response } = (await (backendClient.POST as Function)(
    '/auth/verify-reset-otp',
    { body: { email, code } },
  )) as { error: unknown; response: Response };

  if (!response.ok || error) {
    return { error: await getErrorMessage(error) };
  }

  return { success: true };
}

/**
 * Restablece la contraseña del usuario tras verificación OTP exitosa.
 *
 * @param email Dirección de correo electrónico del usuario.
 * @param password Nueva contraseña del usuario.
 * @returns Objeto con `success` si la contraseña fue actualizada, o `error` si falló.
 */
export async function fetchResetPasswordOtp(
  email: string,
  password: string,
): Promise<{ success?: boolean; error?: string }> {
  // TODO: El endpoint se tipará automáticamente cuando se regeneren los tipos OpenAPI.
  const { error, response } = (await (backendClient.POST as Function)(
    '/auth/reset-password-otp',
    { body: { email, password } },
  )) as { error: unknown; response: Response };

  if (!response.ok || error) {
    return { error: await getErrorMessage(error) };
  }

  return { success: true };
}

/**
 * Extrae el mensaje de error de la respuesta del backend.
 *
 * @param error Objeto de error del backend.
 * @returns Mensaje de error legible.
 */
async function getErrorMessage(error: unknown): Promise<string> {
  return (await getErrorDetails(error)).message;
}

/**
 * Extrae el mensaje y la razón (si existe) de la respuesta de error del backend.
 *
 * @param error Objeto de error del backend.
 * @returns Objeto con el mensaje de error y, opcionalmente, la razón (valor de UserStatus).
 */
async function getErrorDetails(error: unknown): Promise<{
  message: string;
  reason?: string;
}> {
  const t = (await getTranslations('Auth')) as (
    key: string,
    values?: Record<string, unknown>,
  ) => string;

  if (!error) return { message: t('unknownError') };

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    const reason =
      typeof errorObj.reason === 'string' ? errorObj.reason : undefined;

    if ('message' in errorObj) {
      const message = errorObj.message;
      return {
        message: Array.isArray(message) ? message[0] : String(message),
        reason,
      };
    }
  }

  return { message: t('unexpectedError') };
}
