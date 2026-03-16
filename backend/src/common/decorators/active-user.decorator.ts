import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

/**
 * ### ActiveUser
 *
 * Decorador personalizado que permite extraer la información del ExecutionContext de una
 * solicitud http y devuelve el usuario que lo está realizando. Es la forma que tenemos de
 * evitar tener que pasar párametros de usuario desde front al back. Usado por el middleware.
 * No modificar.
 *
 * @version     1.0.0a




 * @see         [createParamDecorator](https://docs.nestjs.com/custom-decorators)
 * @see         [ExecutionContext](https://docs.nestjs.com/fundamentals/execution-context)
 * @returns         Una nueva función que se puede utilizar como decorador para aplicar autenticación y
 *                  autorización a las rutas en NestJS
 */
export const ActiveUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
