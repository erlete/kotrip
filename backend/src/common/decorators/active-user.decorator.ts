import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

/**
 * Decorador de parametro que extrae el usuario autenticado del contexto de ejecucion HTTP.
 *
 * Permite obtener la informacion del usuario activo (almacenada en `request.user` por el
 * AuthGuard) sin necesidad de acceder manualmente al objeto de peticion.
 *
 * @see {@link https://docs.nestjs.com/custom-decorators | createParamDecorator}
 * @returns El objeto del usuario activo asociado a la peticion.
 */
export const ActiveUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
