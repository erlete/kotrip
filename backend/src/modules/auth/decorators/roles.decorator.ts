import type { Role } from '@kotrip/data';
import { SetMetadata } from '@nestjs/common';

/**
 * Variables para la gestión de roles. No modificar.
 * @version     1.0.0a




 * @see         [Role](../../common/enums/role.enum.ts)
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
