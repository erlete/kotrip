import type { User } from '@/modules/user/entities/user.entity';

/**
 * Interfaz para los datos del usuario autenticado en la sesión activa.
 *
 * Define la estructura de información del usuario que se incluye en el token JWT
 * y se propaga a través del sistema mediante el decorador `@ActiveUser()`.
 *
 * @remarks
 * Uso principal:
 * - Encapsulada en tokens JWT de acceso.
 * - Extraida mediante el decorador `@ActiveUser()` en controladores.
 * - Utilizada para verificacion de permisos y personalizacion.
 *
 * Requisitos:
 * - Los endpoints que usen esta interfaz deben estar protegidos con `@Auth()`.
 * - El campo `validated` indica si el usuario completo 2FA (si esta habilitado).
 *
 * @see ActiveUser Decorador para extraer el usuario del request.
 * @see Auth Decorador para proteger endpoints.
 * @see AuthGuard Guard que verifica el token y extrae el usuario.
 */
export interface UserActiveInterface {
  /** Identificador único del usuario (UUID). */
  id: typeof User.prototype.id;

  /** Nombre del usuario. */
  firstName: typeof User.prototype.firstName;

  /** Apellidos del usuario. */
  lastName: typeof User.prototype.lastName;

  /** Correo electrónico del usuario. */
  email: typeof User.prototype.email;

  /** Rol del usuario que determina sus permisos. */
  role: typeof User.prototype.role;

  /** Idioma preferido del usuario. */
  language: typeof User.prototype.language;

  /** Indica si el usuario tiene 2FA habilitado. */
  twoFactorEnabled: typeof User.prototype.twoFactorEnabled;

  /** Estado del usuario en la plataforma. */
  status: typeof User.prototype.status;

  /**
   * Indica si el usuario ha completado la validación de sesión.
   *
   * @remarks
   * - `true`: Usuario completamente autenticado (incluyendo 2FA si aplica).
   * - `false`: Usuario pendiente de completar 2FA.
   */
  validated: boolean;
}
