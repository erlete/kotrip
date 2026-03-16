import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';
import { RolesGuard } from '@/modules/auth/guard/roles.guard';
import { Role } from '@kotrip/data';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { TripMemberGuard } from '../guard/trip-member.guard';
import { TripPermissionGuard } from '../guard/trip-permission.guard';
import { TripPermission } from './trip-permission.decorator';

/**
 * Decorador compuesto que aplica autenticaci\u00f3n JWT, verificaci\u00f3n de membres\u00eda
 * al viaje y, opcionalmente, validaci\u00f3n de un permiso espec\u00edfico del miembro.
 *
 * @remarks
 * Combina los siguientes guards en orden:
 * 1. `AuthGuard` + `RolesGuard` (via `Auth`): Verifica JWT y rol del usuario.
 * 2. `TripMemberGuard`: Verifica que el usuario sea miembro del viaje.
 * 3. `TripPermissionGuard`: Verifica que el miembro tenga el permiso requerido.
 *
 * @param permission - Nombre del campo booleano de permiso de `TripMember`.
 *                     Si no se proporciona, solo se verifica la membres\u00eda.
 * @returns Decorador compuesto de NestJS.
 */
export function TripAuth(permission?: string) {
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [
    Roles(Role.USER, Role.ADMIN),
    UseGuards(AuthGuard, RolesGuard, TripMemberGuard, TripPermissionGuard),
  ];

  if (permission) {
    decorators.push(TripPermission(permission));
  }

  return applyDecorators(...decorators);
}
