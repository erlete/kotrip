import { Role } from './enums.js';

/**
 * Grupos predefinidos de roles para control de acceso consistente.
 *
 * @remarks
 * Estos grupos centralizan los patrones comunes de roles
 * para evitar inconsistencias en la configuración de permisos.
 */

/**
 * Solo administradores.
 * Tienen acceso a configuración global, gestión de usuarios y funciones administrativas.
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
 * Útil para endpoints autenticados donde cualquier usuario con sesión válida puede acceder.
 *
 * @example
 * ```typescript
 * ＠Auth(...RoleGroups.ALL_ROLES)
 * async getMyProfile() { ... }
 * ```
 */
export const ALL_ROLES = [Role.USER, Role.ADMIN] as const;

/**
 * Namespace que agrupa todas las constantes de role groups para importación más limpia.
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
