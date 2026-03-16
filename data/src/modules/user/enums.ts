/**
 * Roles de usuario en la plataforma Kotrip.
 *
 * @remarks
 * Sistema simplificado de dos roles:
 * - `USER`: Usuario estándar con acceso a funcionalidades de viaje.
 * - `ADMIN`: Administrador con acceso total al sistema.
 *
 * Los permisos granulares dentro de viajes se gestionan mediante
 * la entidad `TripMember` y sus campos de permisos booleanos.
 */
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

/**
 * Códigos de idioma soportados por la plataforma (conforme a BCP 47).
 *
 * @remarks
 * Los valores de este enum son códigos de idioma en minúsculas, siguiendo
 * el estándar BCP 47 y la convención utilizada por nestjs-i18n. El valor
 * almacenado en base de datos es el código en minúsculas.
 */
export enum Language {
  EN = 'en',
  ES = 'es',
  GL = 'gl',
}

/**
 * Estado del usuario en la plataforma.
 *
 * @remarks
 * Define el ciclo de vida del usuario desde el registro hasta la
 * aprobación o bloqueo. Determina si el usuario puede iniciar sesión
 * y acceder a los recursos de la plataforma.
 *
 * - `PENDING_VERIFICATION`: Registrado pero pendiente de verificar su email.
 * - `PENDING_REVIEW`: Email verificado, pendiente de revisión por un administrador.
 * - `APPROVED`: Usuario activo con acceso completo.
 * - `IMPORTED`: Usuario importado externamente con acceso completo.
 * - `REJECTED`: Registro rechazado por un administrador.
 * - `BLOCKED`: Usuario bloqueado manualmente por un administrador.
 */
export enum UserStatus {
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  APPROVED = 'APPROVED',
  IMPORTED = 'IMPORTED',
}
