import { ErrorManager } from '@/common/error-handling/error.manager';
import { User } from '@/modules/user/entities/user.entity';
import { InvitationStatus } from '@kotrip/data';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { Repository } from 'typeorm';
import { InvitationOutputDto } from '../dto-outputs/invitation.output.dto';
import { InviteMemberDto } from '../dto/invite-member.dto';
import { TripMemberInvitation } from '../entities/trip-member-invitation.entity';
import { TripMember } from '../entities/trip-member.entity';

/**
 * Servicio para la gesti\u00f3n de invitaciones a viajes.
 *
 * @remarks
 * Gestiona el ciclo de vida completo de las invitaciones: creaci\u00f3n,
 * listado y respuesta (aceptaci\u00f3n o rechazo). Al aceptar una invitaci\u00f3n,
 * se crea autom\u00e1ticamente un `TripMember` para el receptor.
 */
@Injectable()
export class TripInvitationService {
  /**
   * @param invitationRepository Repositorio de invitaciones.
   * @param tripMemberRepository Repositorio de miembros de viaje.
   * @param userRepository Repositorio de usuarios.
   * @param i18n Servicio de internacionalizaci\u00f3n.
   */
  constructor(
    @InjectRepository(TripMemberInvitation)
    private readonly invitationRepository: Repository<TripMemberInvitation>,
    @InjectRepository(TripMember)
    private readonly tripMemberRepository: Repository<TripMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Crea una nueva invitaci\u00f3n a un viaje.
   *
   * @remarks
   * Valida que:
   * - El emisor no se invite a s\u00ed mismo.
   * - El receptor no sea ya miembro del viaje.
   * - No exista una invitaci\u00f3n pendiente duplicada.
   *
   * @param tripId Identificador del viaje.
   * @param issuerId Identificador del usuario emisor.
   * @param dto Datos de la invitaci\u00f3n.
   * @returns Detalle de la invitaci\u00f3n creada.
   */
  async create(
    tripId: string,
    issuerId: string,
    dto: InviteMemberDto,
  ): Promise<InvitationOutputDto> {
    try {
      if (issuerId === dto.receiverId) {
        throw new ErrorManager(
          'BAD_REQUEST',
          this.i18n.t('error.TRIP.CANNOT_INVITE_SELF' as any),
        );
      }

      const receiver = await this.userRepository.findOne({
        where: { id: dto.receiverId },
      });

      if (!receiver) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.USER_NOT_FOUND' as any),
        );
      }

      const existingMember = await this.tripMemberRepository.findOne({
        where: { trip: { id: tripId }, user: { id: dto.receiverId } },
      });

      if (existingMember) {
        throw new ErrorManager(
          'CONFLICT',
          this.i18n.t('error.TRIP.ALREADY_MEMBER' as any),
        );
      }

      const existingInvitation = await this.invitationRepository.findOne({
        where: {
          trip: { id: tripId },
          receiver: { id: dto.receiverId },
          status: InvitationStatus.PENDING,
        },
      });

      if (existingInvitation) {
        throw new ErrorManager(
          'CONFLICT',
          this.i18n.t('error.TRIP.INVITATION_ALREADY_EXISTS' as any),
        );
      }

      const invitation = this.invitationRepository.create({
        trip: { id: tripId },
        issuer: { id: issuerId },
        receiver: { id: dto.receiverId },
        status: InvitationStatus.PENDING,
      });

      const saved = await this.invitationRepository.save(invitation);
      const loaded = await this.invitationRepository.findOneOrFail({
        where: { id: saved.id },
        relations: ['issuer', 'receiver', 'trip'],
      });

      return this.mapToOutput(loaded);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Obtiene todas las invitaciones de un viaje.
   *
   * @param tripId Identificador del viaje.
   * @returns Lista de invitaciones del viaje.
   */
  async findAllByTrip(tripId: string): Promise<InvitationOutputDto[]> {
    try {
      const invitations = await this.invitationRepository.find({
        where: { trip: { id: tripId } },
        relations: ['issuer', 'receiver', 'trip'],
        order: { createdAt: 'DESC' },
      });

      return invitations.map((inv) => this.mapToOutput(inv));
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Obtiene las invitaciones pendientes del usuario autenticado.
   *
   * @param userId Identificador del usuario.
   * @returns Lista de invitaciones pendientes.
   */
  async findMyPending(userId: string): Promise<InvitationOutputDto[]> {
    try {
      const invitations = await this.invitationRepository.find({
        where: {
          receiver: { id: userId },
          status: InvitationStatus.PENDING,
        },
        relations: ['issuer', 'receiver', 'trip'],
        order: { createdAt: 'DESC' },
      });

      return invitations.map((inv) => this.mapToOutput(inv));
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Responde a una invitaci\u00f3n (aceptar o rechazar).
   *
   * @remarks
   * Al aceptar, se crea autom\u00e1ticamente un `TripMember` con permisos por defecto.
   *
   * @param invitationId Identificador de la invitaci\u00f3n.
   * @param userId Identificador del usuario que responde.
   * @param accept `true` para aceptar, `false` para rechazar.
   * @returns Detalle actualizado de la invitaci\u00f3n.
   */
  async respond(
    invitationId: string,
    userId: string,
    accept: boolean,
  ): Promise<InvitationOutputDto> {
    try {
      const invitation = await this.invitationRepository.findOne({
        where: { id: invitationId },
        relations: ['issuer', 'receiver', 'trip'],
      });

      if (!invitation) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.INVITATION_NOT_FOUND' as any),
        );
      }

      if (invitation.receiver.id !== userId) {
        throw new ErrorManager(
          'FORBIDDEN',
          this.i18n.t('error.TRIP.PERMISSION_DENIED' as any),
        );
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new ErrorManager(
          'BAD_REQUEST',
          this.i18n.t('error.TRIP.INVITATION_ALREADY_RESPONDED' as any),
        );
      }

      if (accept) {
        invitation.status = InvitationStatus.ACCEPTED;
        await this.invitationRepository.save(invitation);

        // Check for existing membership (including soft-deleted records)
        const existing = await this.tripMemberRepository.findOne({
          where: { user: { id: userId }, trip: { id: invitation.trip.id } },
          withDeleted: true,
        });

        if (existing && existing.deletedAt) {
          // Restore soft-deleted member
          existing.deletedAt = null;
          await this.tripMemberRepository.save(existing);
        } else if (!existing) {
          const member = this.tripMemberRepository.create({
            user: { id: userId },
            trip: { id: invitation.trip.id },
            canEditBudget: false,
            canEditTrip: false,
            canEditDetails: false,
            canModifyMembers: false,
            canInviteMembers: false,
            canManageTickets: false,
          });

          await this.tripMemberRepository.save(member);
        }
        // If existing and not deleted, user is already a member - skip insert

        return this.mapToOutput(invitation);
      } else {
        const output = this.mapToOutput(invitation);
        await this.invitationRepository.remove(invitation);
        return output;
      }
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Mapea una entidad `TripMemberInvitation` al DTO de salida.
   *
   * @param invitation Entidad de la invitaci\u00f3n.
   * @returns DTO de salida de la invitaci\u00f3n.
   */
  private mapToOutput(invitation: TripMemberInvitation): InvitationOutputDto {
    return {
      id: invitation.id,
      status: invitation.status,
      issuer: {
        id: invitation.issuer.id,
        firstName: invitation.issuer.firstName,
        lastName: invitation.issuer.lastName,
        email: invitation.issuer.email,
      },
      receiver: {
        id: invitation.receiver.id,
        firstName: invitation.receiver.firstName,
        lastName: invitation.receiver.lastName,
        email: invitation.receiver.email,
      },
      trip: {
        id: invitation.trip.id,
        name: invitation.trip.name,
      },
      createdAt: invitation.createdAt,
    };
  }
}
