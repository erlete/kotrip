import { CUDTzEntity } from '@/lib/data/entities/timestamped.entity';
import { InvitationStatus } from '@kotrip/data';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import type { Trip } from './trip.entity';

/**
 * Entidad TripMemberInvitation (Invitación a Viaje).
 *
 * Representa una invitación enviada por un miembro del viaje a otro usuario
 * para que se una como miembro.
 *
 * @remarks
 * **Ciclo de vida**:
 * - Se crea con estado PENDING cuando un miembro con permiso `canInviteMembers` invita.
 * - El receptor puede aceptar (ACCEPTED) o rechazar (REJECTED).
 * - Al aceptarse, se crea automáticamente un `TripMember` para el receptor.
 *
 * **Restricción de unicidad**:
 * - Solo puede existir una invitación activa por par (viaje, receptor).
 *
 * @see Trip Entidad del viaje asociado.
 * @see TripMember Entidad creada al aceptarse la invitación.
 */
@Entity({
  comment: 'Invitaciones a viajes pendientes de respuesta',
  name: 'trip_member_invitation',
})
@Unique('uq_invitation_trip_receiver', ['trip', 'receiver'])
export class TripMemberInvitation extends CUDTzEntity {
  // #region Primary Key

  /**
   * Identificador único de la invitación (UUID v4).
   *
   * @remarks Se genera automáticamente al crear la invitación.
   */
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Identificador único de la invitación (UUID v4)',
    name: 'id',
  })
  id: string;

  // #endregion

  // #region Columns - Estado

  /**
   * Estado actual de la invitación.
   *
   * @remarks
   * Estados disponibles:
   * - PENDING: La invitación está pendiente de respuesta.
   * - ACCEPTED: El receptor ha aceptado la invitación.
   * - REJECTED: El receptor ha rechazado la invitación.
   */
  @Column({
    comment: 'Estado actual de la invitación',
    default: InvitationStatus.PENDING,
    enum: InvitationStatus,
    enumName: 'InvitationStatus',
    name: 'status',
    type: 'enum',
  })
  status: InvitationStatus;

  // #endregion

  // #region Relations

  /**
   * Viaje al que se refiere la invitación.
   */
  @ManyToOne('Trip', 'invitations', { nullable: false })
  trip: Trip;

  /**
   * Usuario que envía la invitación.
   */
  @ManyToOne(() => User, { nullable: false })
  issuer: User;

  /**
   * Usuario que recibe la invitación.
   */
  @ManyToOne(() => User, { nullable: false })
  receiver: User;

  // #endregion
}
