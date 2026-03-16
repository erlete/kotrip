import type { Role } from '@kotrip/data';
import { SetMetadata } from '@nestjs/common';

/**
 * Decorador y clave de metadatos para asignar roles requeridos a un endpoint.
 *
 * Utilizado por RolesGuard para verificar si el usuario tiene un rol autorizado.
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
