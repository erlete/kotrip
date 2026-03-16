import type { Role } from '@kotrip/data';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Decorador compuesto que aplica autenticacion JWT y autorizacion por roles.
 *
 * Combina AuthGuard (verificacion del token JWT) y RolesGuard (verificacion del rol)
 * en un unico decorador reutilizable para proteger endpoints.
 *
 * @param roles - Roles del enum Role autorizados para acceder al endpoint.
 * @returns Decorador compuesto con autenticacion y autorizacion.
 *
 * @see AuthGuard Guard que verifica el token JWT.
 * @see RolesGuard Guard que verifica los roles del usuario.
 */
export function Auth(...roles: Role[]) {
  return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard));
}
