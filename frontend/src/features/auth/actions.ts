'use server';

import { redirect } from '@/features/i18n';
import { getTranslations } from 'next-intl/server';
import {
  fetchLogin,
  fetchRefreshToken,
  fetchRegister,
  fetchVerifyEmail,
} from './api';
import {
  clearAuthCookies,
  setAccessToken,
  setRefreshToken,
  setSession,
} from './cookies';
import { clearOtpSessionCookie } from './otp-session';
import { RegisterFormState, Session, ValidatedLoginResponse } from './types';

/**
 * Establece la sesion de un usuario autenticado.
 *
 * Este metodo se encarga de:
 * - Persistir los tokens de acceso y refresco de forma segura.
 * - Crear y guardar la sesion del usuario.
 * - Redirigir al usuario a la pagina principal.
 *
 * @param response Respuesta de login ya validada y sin errores.
 */
async function establishSession(
  response: Exclude<ValidatedLoginResponse, { error: string }>,
) {
  const { user, backendTokens } = response;

  await setAccessToken(backendTokens.accessToken);
  await setRefreshToken(backendTokens.refreshToken);
  await setSession(user);

  await redirect('/home');
}

/**
 * _Server action_ para iniciar sesion con usuario y contrasena.
 *
 * @param prevState Estado previo del formulario.
 * @param formData Datos del formulario de login.
 * @returns Un mensaje de error en caso de fallo, o void si todo es correcto.
 */
export async function login(
  prevState: {
    email: string;
    password: string;
    error?: string;
    reason?: string;
  },
  formData: FormData,
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetchLogin({ email, password });

  if ('error' in response) {
    return { email, password, error: response.error, reason: response.reason };
  }

  if ('needsValidation' in response) {
    return {
      email,
      password,
      error: 'Two-factor authentication is not supported.',
    };
  }

  await establishSession(response);

  return prevState;
}

/**
 * _Server action_ para registrar un nuevo usuario.
 *
 * @param _prevState Estado previo del formulario.
 * @param formData Datos del formulario de registro.
 * @returns Estado del formulario con error o success.
 */
export async function register(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const t = (await getTranslations('Auth')) as (
    key: string,
    values?: Record<string, unknown>,
  ) => string;
  const mail = formData.get('mail') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const password = formData.get('password') as string;
  const repeatPassword = formData.get('repeatPassword') as string;

  if (password !== repeatPassword) {
    return {
      mail,
      firstName,
      lastName,
      password,
      repeatPassword,
      error: t('passwordsDoNotMatch'),
    };
  }

  const response = await fetchRegister({
    mail,
    firstName,
    lastName,
    password,
    repeatPassword,
  });

  if ('error' in response) {
    return {
      mail,
      firstName,
      lastName,
      password,
      repeatPassword,
      error: response.error,
    };
  }

  return {
    mail,
    firstName,
    lastName,
    password: '',
    repeatPassword: '',
    success: true,
    admissionResult: response.data
      .admissionResult as RegisterFormState['admissionResult'],
  };
}

/**
 * Estado del formulario de verificacion de email.
 */
export interface VerifyEmailFormState {
  email: string;
  code: string;
  error?: string;
  success?: boolean;
  admissionResult?: 'ADMITTED' | 'PENDING' | 'REJECTED';
}

/**
 * _Server action_ para verificar el email de un usuario registrado.
 *
 * @param _prevState Estado previo del formulario.
 * @param formData Datos del formulario con email y codigo.
 * @returns Estado del formulario con resultado o error.
 */
export async function verifyEmail(
  _prevState: VerifyEmailFormState,
  formData: FormData,
): Promise<VerifyEmailFormState> {
  const email = formData.get('email') as string;
  const code = formData.get('code') as string;

  const response = await fetchVerifyEmail(email, code);

  if ('error' in response && response.error) {
    return { email, code: '', error: response.error };
  }

  await clearOtpSessionCookie();

  return {
    email,
    code: '',
    success: true,
    admissionResult: response.admissionResult,
  };
}

/**
 * Actualiza la informacion de la sesion del usuario.
 *
 * @param newSession Nueva informacion de sesion del usuario.
 */
export async function updateSession(newSession: Session) {
  await setSession(newSession);
}

/**
 * Cierra la sesion del usuario actual.
 *
 * Elimina todas las cookies relacionadas con autenticacion
 * y redirige al usuario a la pagina de login.
 */
export async function signOut() {
  refreshPromise = null;

  await clearAuthCookies();
  await redirect('/login');
}

/**
 * Cierra la sesion del usuario actual sin redirigir.
 */
export async function signOutNoRedirect() {
  refreshPromise = null;

  await clearAuthCookies();
}

// ============ Token Refresh ============

/**
 * Resultado de un intento de refresco de tokens.
 */
export type RefreshResult = {
  success: boolean;
  accessToken?: string;
  error?: string;
};

let refreshPromise: Promise<RefreshResult> | null = null;

/**
 * Refresca los tokens de autenticacion usando el refresh token.
 *
 * Implementa un patron mutex para prevenir multiples refreshes concurrentes.
 *
 * @returns Resultado con exito/error y, opcionalmente, el nuevo access token.
 */
export async function refreshAuthTokens(): Promise<RefreshResult> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetchRefreshToken();

      if ('error' in response) {
        try {
          await clearAuthCookies();
        } catch {
          // Ignorar error de cookies en contextos donde no se pueden modificar
        }
        return { success: false, error: response.error };
      }

      try {
        await setAccessToken(response.backendTokens.accessToken);
        await setRefreshToken(response.backendTokens.refreshToken);
        await setSession(response.user);
      } catch (err) {
        console.warn(
          '[Auth] Fallback: could not update cookies (SSR context). ' +
            'The proxy will handle it on next navigation.',
          err,
        );
      }

      return {
        success: true,
        accessToken: response.backendTokens.accessToken,
      };
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
