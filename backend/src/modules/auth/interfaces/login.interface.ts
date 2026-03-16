import type { User } from '@/modules/user/entities/user.entity';

/**
 * Interfaz para la respuesta de login exitoso.
 *
 * Define la estructura de datos devuelta al frontend cuando un usuario
 * completa exitosamente el proceso de autenticación.
 *
 * @remarks
 * Contenido:
 * - Informacion del usuario (perfil publico).
 * - Tokens JWT para acceso y refresco.
 *
 * Seguridad:
 * - No incluye datos sensibles como contrasena.
 * - Los tokens tienen tiempo de expiracion configurado en .env.
 *
 * @see LoginOutputDto DTO de Swagger correspondiente.
 * @see User Entidad de usuario.
 */
export interface LoginInterface {
  /** Información del usuario autenticado. */
  user: {
    /** URL del avatar del usuario o null si no tiene. */
    avatarURL: typeof User.prototype.avatarFileName;
    /** Correo electrónico del usuario. */
    email: typeof User.prototype.email;
    /** Indica si el usuario tiene 2FA habilitado. */
    twoFactorEnabled: typeof User.prototype.twoFactorEnabled;
    /** Identificador único del usuario. */
    id: typeof User.prototype.id;
    /** Idioma preferido del usuario. */
    language: typeof User.prototype.language;
    /** Fecha del último inicio de sesión (ISO string) o null. */
    lastLogIn: null | string;
    /** Rol del usuario en el sistema. */
    role: typeof User.prototype.role;
    /** Nombre del usuario. */
    firstName: typeof User.prototype.firstName;
    /** Apellidos del usuario. */
    lastName: typeof User.prototype.lastName;
    /** Indica si la sesión está completamente validada. */
    validated: boolean;
  };

  /** Tokens JWT para autenticación. */
  backendTokens: {
    /** Token de acceso JWT (corta duración, JWT_EXPIRATION). */
    accessToken: string;
    /** Token de refresco JWT (larga duración, JWT_REFRESH_EXPIRATION). */
    refreshToken: string;
  };
}
