import { BackendTypes } from '@/lib/backend/types';

/**
 * Representa la sesión actual de un usuario.
 *
 * Puede ser:
 * - Un objeto `User` completo si el usuario está autenticado.
 * - Un objeto con `needsValidation: true` si el usuario requiere
 *   validación adicional, por ejemplo 2FA.
 */
export type ValidatedSession = BackendTypes['UserDTO'];

export type Session =
  | ValidatedSession
  | {
      needsValidation: true;
    };

/**
 * Respuesta base del endpoint de login.
 *
 * Puede ser:
 * - Un objeto con `error` si el login falló.
 * - Un objeto con `backendTokens` y `user` si la autenticación
 *   fue exitosa.
 */
type BaseLoginResponse =
  | {
      /** Mensaje de error devuelto por el backend */
      error: string;
      /** Razón del error (valor de UserStatus) cuando el login falla por status del usuario. */
      reason?: string;
    }
  | {
      /** Tokens devueltos por el backend para autenticar al usuario */
      backendTokens: {
        accessToken: string;
        refreshToken: string;
      };
      /** Información del usuario autenticado */
      user: BackendTypes['UserDTO'];
    };

/**
 * Respuesta completa del login.
 *
 * Puede ser:
 * - Un `BaseLoginResponse` (exitoso o con error)
 * - Un objeto indicando que se requiere validación adicional
 *   (2FA) con `{ needsValidation: true }`.
 */
export type LoginResponse =
  | BaseLoginResponse
  | {
      /** Indica que el usuario necesita validar su identidad adicionalmente */
      needsValidation: true;
    };

/**
 * Respuesta de login ya validada.
 *
 * Contiene únicamente el caso exitoso de `BaseLoginResponse`,
 * con los tokens y la información del usuario.
 */
export type ValidatedLoginResponse = BaseLoginResponse;

/**
 * Respuesta del endpoint de registro.
 *
 * Puede ser:
 * - Un objeto con `error` si el registro falló.
 * - Un objeto con `success: true` y `data` si el registro fue exitoso.
 */
export type RegisterResponse =
  | {
      /** Mensaje de error devuelto por el backend */
      error: string;
    }
  | {
      /** Indica que el registro fue exitoso */
      success: true;
      /** Datos del registro creado */
      data: BackendTypes['NewRegisterOutput'];
    };

/**
 * Estado del formulario de registro.
 */
export interface RegisterFormState {
  mail: string;
  firstName: string;
  lastName: string;
  password: string;
  repeatPassword: string;
  error?: string;
  success?: boolean;
  /** Resultado de la política de admisión tras un registro exitoso. */
  admissionResult?:
    | 'ADMITTED'
    | 'PENDING'
    | 'PENDING_VERIFICATION'
    | 'REJECTED';
}

/**
 * Estado del formulario de solicitud de restablecimiento de contraseña.
 */
export interface ForgotPasswordFormState {
  mail: string;
  error?: string;
  success?: boolean;
}

/**
 * Estado del formulario de restablecimiento de contraseña.
 */
export interface ResetPasswordFormState {
  password: string;
  repeatPassword: string;
  error?: string;
  success?: boolean;
}

/**
 * Estado del formulario de verificación OTP para recuperación de contraseña.
 */
export interface RecoverOtpFormState {
  email: string;
  code: string;
  error?: string;
  success?: boolean;
}

/**
 * Estado del formulario de nueva contraseña tras verificación OTP.
 */
export interface RecoverEditFormState {
  password: string;
  repeatPassword: string;
  error?: string;
  success?: boolean;
}
