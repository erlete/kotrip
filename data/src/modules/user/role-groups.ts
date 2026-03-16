import { Role } from './enums.js';

/**
 * Solo administradores.
 * Incluye acceso a configuracion global, gestion de usuarios y funciones administrativas.
 *
 * @example
 * ```typescript
 * // Uso en composePage (frontend)
 * export default composePage({
 *   access: { roles: RoleGroups.ADMINS },
 *   component: AdminConfigView,
 * });
 *
 * // Uso en guards de NestJS (backend)
 * ＠Auth(...RoleGroups.ADMINS)
 * async updatePlatformConfig() { ... }
 * ```
 */
export const ADMINS = [Role.ADMIN] as const;

/**
 * Todos los roles del sistema.
 * Util para endpoints autenticados donde cualquier usuario con sesion valida puede acceder.
 *
 * @example
 * ```typescript
 * ＠Auth(...RoleGroups.ALL_ROLES)
 * async getMyProfile() { ... }
 * ```
 */
export const ALL_ROLES = [Role.USER, Role.ADMIN] as const;

/**
 * Grupos predefinidos de roles para control de acceso.
 *
 * Centraliza los patrones comunes de roles para evitar inconsistencias
 * en la configuracion de permisos a lo largo de la plataforma.
 *
 * @example
 * ```typescript
 * import { RoleGroups } from '@kotrip/data';
 *
 * const admins = RoleGroups.ADMINS;
 * const all = RoleGroups.ALL_ROLES;
 * ```
 */
export const RoleGroups = {
  ADMINS,
  ALL_ROLES,
} as const;
