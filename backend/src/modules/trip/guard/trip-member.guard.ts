import { ErrorManager } from '@/common/error-handling/error.manager';
import { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { Repository } from 'typeorm';
import { TripMember } from '../entities/trip-member.entity';

/**
 * Guard que verifica que el usuario autenticado sea miembro del viaje solicitado.
 *
 * @remarks
 * - Lee el par\u00e1metro `:id` de la ruta para obtener el UUID del viaje.
 * - Busca un `TripMember` activo para la combinaci\u00f3n usuario + viaje.
 * - Si se encuentra, adjunta `request.tripMember` y `request.trip` al contexto.
 * - Si no se encuentra, lanza un error `FORBIDDEN`.
 *
 * @see TripPermissionGuard Guard complementario que valida permisos espec\u00edficos.
 */
@Injectable()
export class TripMemberGuard implements CanActivate {
  /**
   * @param tripMemberRepository Repositorio de miembros de viaje.
   * @param i18n Servicio de internacionalizaci\u00f3n para mensajes de error.
   */
  constructor(
    @InjectRepository(TripMember)
    private readonly tripMemberRepository: Repository<TripMember>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Valida si el usuario autenticado es miembro del viaje indicado en la ruta.
   *
   * @param context Contexto de ejecuci\u00f3n de NestJS.
   * @returns `true` si el usuario es miembro del viaje.
   * @throws {ErrorManager} Con c\u00f3digo `FORBIDDEN` si el usuario no es miembro.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const user = request.user as UserActiveInterface;
      const tripId = request.params?.id as string | undefined;

      if (!tripId || !user) {
        throw new ErrorManager(
          'FORBIDDEN',
          this.i18n.t('error.TRIP.PERMISSION_DENIED' as any),
        );
      }

      const member = await this.tripMemberRepository.findOne({
        where: {
          trip: { id: tripId },
          user: { id: user.id },
        },
        relations: ['trip', 'trip.locality', 'user'],
      });

      if (!member) {
        throw new ErrorManager(
          'FORBIDDEN',
          this.i18n.t('error.TRIP.PERMISSION_DENIED' as any),
        );
      }

      request.tripMember = member;
      request.trip = member.trip;

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
