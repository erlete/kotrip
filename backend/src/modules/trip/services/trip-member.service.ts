import { ErrorManager } from '@/common/error-handling/error.manager';
import { User } from '@/modules/user/entities/user.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { Repository } from 'typeorm';
import { TripMemberOutputDto } from '../dto-outputs/trip-member.output.dto';
import { CreateTripMemberDto } from '../dto/create-trip-member.dto';
import { UpdateTripMemberDto } from '../dto/update-trip-member.dto';
import { TripMember } from '../entities/trip-member.entity';

/**
 * Servicio para la gesti\u00f3n de miembros de un viaje.
 *
 * @remarks
 * Proporciona operaciones CRUD para los miembros de un viaje,
 * incluyendo la gesti\u00f3n de permisos granulares y roles decorativos.
 */
@Injectable()
export class TripMemberService {
  /**
   * @param tripMemberRepository Repositorio de miembros de viaje.
   * @param userRepository Repositorio de usuarios.
   * @param i18n Servicio de internacionalizaci\u00f3n.
   */
  constructor(
    @InjectRepository(TripMember)
    private readonly tripMemberRepository: Repository<TripMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Obtiene todos los miembros de un viaje con los datos de usuario.
   *
   * @param tripId Identificador del viaje.
   * @returns Lista de miembros del viaje.
   */
  async findAllByTrip(tripId: string): Promise<TripMemberOutputDto[]> {
    try {
      const members = await this.tripMemberRepository.find({
        where: { trip: { id: tripId } },
        relations: ['user'],
        order: { createdAt: 'ASC' },
      });

      return members.map((m) => this.mapToOutput(m));
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * A\u00f1ade un nuevo miembro a un viaje.
   *
   * @param tripId Identificador del viaje.
   * @param dto Datos del nuevo miembro.
   * @returns Informaci\u00f3n del miembro creado.
   */
  async addMember(
    tripId: string,
    dto: CreateTripMemberDto,
  ): Promise<TripMemberOutputDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.USER_NOT_FOUND' as any),
        );
      }

      const existing = await this.tripMemberRepository.findOne({
        where: { trip: { id: tripId }, user: { id: dto.userId } },
      });

      if (existing) {
        throw new ErrorManager(
          'CONFLICT',
          this.i18n.t('error.TRIP.ALREADY_MEMBER' as any),
        );
      }

      const member = this.tripMemberRepository.create({
        user: { id: dto.userId },
        trip: { id: tripId },
        canEditBudget: dto.canEditBudget ?? false,
        canEditTrip: dto.canEditTrip ?? false,
        canEditDetails: dto.canEditDetails ?? false,
        canModifyMembers: dto.canModifyMembers ?? false,
        canInviteMembers: dto.canInviteMembers ?? false,
        canManageTickets: dto.canManageTickets ?? false,
        decorativeRole: dto.decorativeRole ?? null,
      });

      const saved = await this.tripMemberRepository.save(member);
      const loaded = await this.tripMemberRepository.findOneOrFail({
        where: { id: saved.id },
        relations: ['user'],
      });

      return this.mapToOutput(loaded);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Actualiza los permisos y/o rol decorativo de un miembro existente.
   *
   * @param memberId Identificador del miembro a actualizar.
   * @param dto Campos a actualizar.
   * @returns Informaci\u00f3n actualizada del miembro.
   */
  async updateMember(
    memberId: string,
    dto: UpdateTripMemberDto,
  ): Promise<TripMemberOutputDto> {
    try {
      const member = await this.tripMemberRepository.findOne({
        where: { id: memberId },
        relations: ['user'],
      });

      if (!member) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.MEMBER_NOT_FOUND' as any),
        );
      }

      if (member.isCreator) {
        throw new ForbiddenException(
          'No es posible modificar los permisos del creador del viaje.',
        );
      }

      if (dto.canEditBudget !== undefined)
        member.canEditBudget = dto.canEditBudget;
      if (dto.canEditTrip !== undefined) member.canEditTrip = dto.canEditTrip;
      if (dto.canEditDetails !== undefined)
        member.canEditDetails = dto.canEditDetails;
      if (dto.canModifyMembers !== undefined)
        member.canModifyMembers = dto.canModifyMembers;
      if (dto.canInviteMembers !== undefined)
        member.canInviteMembers = dto.canInviteMembers;
      if (dto.canManageTickets !== undefined)
        member.canManageTickets = dto.canManageTickets;
      if (dto.decorativeRole !== undefined)
        member.decorativeRole = dto.decorativeRole ?? null;

      const saved = await this.tripMemberRepository.save(member);

      return this.mapToOutput(saved);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Elimina un miembro de un viaje.
   *
   * @param memberId Identificador del miembro a eliminar.
   */
  async removeMember(memberId: string): Promise<void> {
    try {
      const member = await this.tripMemberRepository.findOne({
        where: { id: memberId },
      });

      if (!member) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.MEMBER_NOT_FOUND' as any),
        );
      }

      if (member.isCreator) {
        throw new ForbiddenException(
          'No es posible eliminar al creador del viaje.',
        );
      }

      await this.tripMemberRepository.softRemove(member);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Mapea una entidad `TripMember` al DTO de salida.
   *
   * @param member Entidad del miembro.
   * @returns DTO de salida del miembro.
   */
  private mapToOutput(member: TripMember): TripMemberOutputDto {
    return {
      id: member.id,
      user: {
        id: member.user.id,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        email: member.user.email,
      },
      canEditBudget: member.canEditBudget,
      canEditTrip: member.canEditTrip,
      canEditDetails: member.canEditDetails,
      canModifyMembers: member.canModifyMembers,
      canInviteMembers: member.canInviteMembers,
      canManageTickets: member.canManageTickets,
      isCreator: member.isCreator,
      decorativeRole: member.decorativeRole,
      createdAt: member.createdAt,
    };
  }
}
