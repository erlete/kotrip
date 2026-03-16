import { CUDTzEntity } from '@/lib/data/entities/timestamped.entity';
import { MAX_DECORATIVE_ROLE_LENGTH } from '@kotrip/data';
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
 * Entidad TripMember (Miembro de Viaje).
 *
 * Representa la pertenencia de un usuario a un viaje, incluyendo sus permisos
 * granulares y un rol decorativo opcional.
 *
 * @remarks
 * Alcance funcional:
 * - Define la relación usuario ↔ viaje con permisos booleanos individuales.
 * - El creador del viaje recibe automáticamente todos los permisos activados.
 * - El `decorativeRole` es un texto libre para etiquetas como "conductor", "fotógrafo", etc.
 *
 * Permisos:
 * - `canEditTrip`: Modificar datos generales del viaje (nombre, fechas, etc.).
 * - `canEditBudget`: Gestionar gastos.
 * - `canEditDetails`: Modificar el itinerario.
 * - `canModifyMembers`: Añadir/eliminar miembros directamente.
 * - `canInviteMembers`: Enviar invitaciones.
 * - `canManageTickets`: Gestionar tickets/documentos del viaje.
 *
 * @see Trip Entidad del viaje al que pertenece.
 * @see User Entidad del usuario miembro.
 */
@Entity({
  comment: 'Miembros de un viaje con permisos granulares',
  name: 'trip_member',
})
@Unique('uq_trip_member_user_trip', ['user', 'trip'])
export class TripMember extends CUDTzEntity {
  // #region Primary Key

  /**
   * Identificador único del miembro del viaje (UUID v4).
   *
   * @remarks Se genera automáticamente al asociar al usuario.
   */
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Identificador único del miembro del viaje (UUID v4)',
    name: 'id',
  })
  id: string;

  // #endregion

  // #region Columns - Creador

  /**
   * Indica si el miembro es el creador del viaje.
   *
   * @remarks Por defecto `false`. Solo un miembro por viaje debería tener este campo a `true`.
   */
  @Column({
    comment: 'Indica si el miembro es el creador del viaje',
    default: false,
    name: 'is_creator',
    type: 'boolean',
  })
  isCreator: boolean;

  // #endregion

  // #region Columns - Permisos

  /**
   * Permiso para gestionar gastos del viaje.
   *
   * @remarks Por defecto desactivado.
   */
  @Column({
    comment: 'Permiso para gestionar gastos del viaje',
    default: false,
    name: 'can_edit_budget',
    type: 'boolean',
  })
  canEditBudget: boolean;

  /**
   * Permiso para modificar datos generales del viaje.
   *
   * @remarks Por defecto desactivado.
   */
  @Column({
    comment: 'Permiso para modificar datos generales del viaje',
    default: false,
    name: 'can_edit_trip',
    type: 'boolean',
  })
  canEditTrip: boolean;

  /**
   * Permiso para modificar detalles del itinerario.
   *
   * @remarks Por defecto desactivado.
   */
  @Column({
    comment: 'Permiso para modificar detalles del itinerario',
    default: false,
    name: 'can_edit_details',
    type: 'boolean',
  })
  canEditDetails: boolean;

  /**
   * Permiso para añadir o eliminar miembros directamente.
   *
   * @remarks Por defecto desactivado.
   */
  @Column({
    comment: 'Permiso para añadir o eliminar miembros directamente',
    default: false,
    name: 'can_modify_members',
    type: 'boolean',
  })
  canModifyMembers: boolean;

  /**
   * Permiso para enviar invitaciones al viaje.
   *
   * @remarks Por defecto desactivado.
   */
  @Column({
    comment: 'Permiso para enviar invitaciones al viaje',
    default: false,
    name: 'can_invite_members',
    type: 'boolean',
  })
  canInviteMembers: boolean;

  /**
   * Permiso para gestionar tickets y documentos del viaje.
   *
   * @remarks Por defecto desactivado.
   */
  @Column({
    comment: 'Permiso para gestionar tickets y documentos',
    default: false,
    name: 'can_manage_tickets',
    type: 'boolean',
  })
  canManageTickets: boolean;

  // #endregion

  // #region Columns - Rol decorativo

  /**
   * Rol decorativo del miembro dentro del viaje.
   *
   * @remarks
   * - Texto libre para etiquetas como "conductor", "fotógrafo", "tesorero", etc.
   * - No afecta a los permisos reales del miembro.
   * - Opcional, puede ser null.
   */
  @Column({
    comment: 'Rol decorativo del miembro (texto libre)',
    length: MAX_DECORATIVE_ROLE_LENGTH,
    name: 'decorative_role',
    nullable: true,
    type: 'varchar',
  })
  decorativeRole: string | null;

  // #endregion

  // #region Relations

  /**
   * Usuario que es miembro del viaje.
   */
  @ManyToOne(() => User, { nullable: false })
  user: User;

  /**
   * Viaje al que pertenece el miembro.
   */
  @ManyToOne('Trip', 'members', { nullable: false })
  trip: Trip;

  // #endregion
}
