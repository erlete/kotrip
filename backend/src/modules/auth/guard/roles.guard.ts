import { ErrorManager } from '@/common/error-handling/error.manager';
import { ROLES_KEY } from '@/modules/auth/decorators/roles.decorator';
import { Role } from '@kotrip/data';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * ### RolesGuard
 *
 * Clase de tipo “guard” que extiende CanActivate de NestJS, comprueba si un usuario tiene permiso para
 * acceder a un método en base a su rol. El usuario ADMIN siempre tiene permiso de ejecución,
 * incluso aunque no esté escrito de forma estricta en la declaración del decorador antes del método
 * que se ejecutará.
 *
 * @version     1.0.0a







 * @see         [CanActivate](https://docs.nestjs.com/guards)
 * @see         [ExecutionContext](https://docs.nestjs.com/fundamentals/execution-context)
 * @see         [Role](../../common/enums/role.enum.ts)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * El constructor declara un objeto de tipo Reflector para recuperar la información delmétodo al que
   * se quiere acceder (metadatos)
   *
   * @param reflector     Datos encapsulados para los metadatos del método
   */
  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Método que extiende de canActive(), obtiene los roles asignados a un método mediante un Reflector,
   * obtiene el rol de un usuario mediante un ExecutionContext y comprueba si el usuario tiene un rol incluido
   * en el método. En caso de que el método no tenga roles o el usuario sea ADMIN, siempre se podrá acceder.
   *
   * @param context   Objeto de tipo ExecutionContext con todos los datos necesarios para la comprobación
   * @returns         true si puede realizarse la request, false si no
   */
  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      /**
       * Si el método no tiene roles asignados, se devuelve true siempre. Un método que no tenga ningún rol
       * estipulado será accesible por todos.
       */
      if (!requiredRoles || requiredRoles.length === 0) return true;

      const { user } = context.switchToHttp().getRequest();
      if (!user)
        throw new ErrorManager(
          'BAD_REQUEST',
          this.i18n.t('error.AUTH.INVALID_JWT'),
        );

      if (user.role === Role.ADMIN)
        // Los ADMIN siempre pueden acceder a los métodos
        return true;

      const hasValidRole = requiredRoles.some((role) =>
        user.role?.includes(role),
      ); // Comprobar si el rol del usuario está en los roles del método
      if (!hasValidRole) {
        throw new ErrorManager(
          'UNAUTHORIZED',
          this.i18n.t('error.AUTH.ROLE_UNAUTHORIZED'),
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ErrorManager) {
        error.throwSignatureError();
      }
      throw new ErrorManager(
        'INTERNAL_SERVER_ERROR',
        this.i18n.t('error.AUTH.AUTH_GUARD_ERROR'),
      );
    }
  }
}
