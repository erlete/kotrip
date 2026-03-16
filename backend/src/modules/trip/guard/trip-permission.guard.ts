import { ErrorManager } from '@/common/error-handling/error.manager';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { TRIP_PERMISSION_KEY } from '../decorators/trip-permission.decorator';
import { TripMember } from '../entities/trip-member.entity';

/**
 * Guard que verifica que el miembro del viaje tenga el permiso requerido.
 *
 * @remarks
 * - Lee los metadatos del handler para obtener el permiso requerido (clave `tripPermission`).
 * - Obtiene el `TripMember` del request (previamente establecido por `TripMemberGuard`).
 * - Comprueba si el campo booleano correspondiente est\u00e1 activado en el miembro.
 * - Si no hay permiso definido en los metadatos, permite el acceso (solo membres\u00eda).
 *
 * @see TripMemberGuard Guard que debe ejecutarse antes para establecer `request.tripMember`.
 * @see TripPermission Decorador que define el permiso requerido.
 */
@Injectable()
export class TripPermissionGuard implements CanActivate {
  /**
   * @param reflector Reflector de NestJS para leer metadatos.
   * @param i18n Servicio de internacionalizaci\u00f3n para mensajes de error.
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Valida si el miembro del viaje tiene el permiso espec\u00edfico requerido.
   *
   * @param context Contexto de ejecuci\u00f3n de NestJS.
   * @returns `true` si el miembro tiene el permiso o no se requiere ninguno.
   * @throws {ErrorManager} Con c\u00f3digo `FORBIDDEN` si el miembro carece del permiso.
   */
  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredPermission = this.reflector.getAllAndOverride<
        string | undefined
      >(TRIP_PERMISSION_KEY, [context.getHandler(), context.getClass()]);

      if (!requiredPermission) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const member = request.tripMember as TripMember | undefined;

      if (!member) {
        throw new ErrorManager(
          'FORBIDDEN',
          this.i18n.t('error.TRIP.PERMISSION_DENIED' as any),
        );
      }

      const hasPermission =
        member[requiredPermission as keyof TripMember] === true;

      if (!hasPermission) {
        throw new ErrorManager(
          'FORBIDDEN',
          this.i18n.t('error.TRIP.PERMISSION_DENIED' as any),
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ErrorManager) {
        error.throwSignatureError();
      }
      throw new ErrorManager(
        'INTERNAL_SERVER_ERROR',
        this.i18n.t('error.TRIP.PERMISSION_DENIED' as any),
      );
    }
  }
}
