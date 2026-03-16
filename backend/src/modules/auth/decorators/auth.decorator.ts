import type { Role } from '@kotrip/data';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Función que admite un array de valores de roles y aplica la función applyDecorators() de nestjs, con varios
 * guards en sus parametros de entrada, para asignar acceso de roles a los métodos en que se aplique el decorador.
 *
 * @version     1.0.0a




 * @see         [UseGuards](https://docs.nestjs.com/security/authentication#guards)
 * @see         [applyDecorators](https://docs.nestjs.com/custom-decorators#applying-multiple-decorators)
 * @see         [Role](../../common/enums/role.enum.ts)
 * @see         [AuthGuard](../guard/auth.guard.ts)
 * @see         [RolesGuard](../guard/roles.guard.ts)
 * @param roles     Array de valores del enum Role autorizados a acceder al método asignado
 * @returns         Una nueva función que se puede utilizar como decorador para aplicar autenticación y
 *                  autorización a las rutas en NestJS
 */
export function Auth(...roles: Role[]) {
  return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard));
}
