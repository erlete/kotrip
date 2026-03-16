import { CUDTzEntity } from '@/lib/data/entities/timestamped.entity';
import {
  MAX_TRIP_DESCRIPTION_LENGTH,
  MAX_TRIP_NAME_LENGTH,
  TripStatus,
} from '@kotrip/data';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Locality } from '../../locality/entities/locality.entity';
import { Expense } from './expense.entity';
import { TripItinerary } from './trip-itinerary.entity';
import { TripMemberInvitation } from './trip-member-invitation.entity';
import { TripMember } from './trip-member.entity';

/**
 * Entidad Trip (Viaje).
 *
 * Representa un viaje planificado por uno o más usuarios del sistema Kotrip.
 * Cada viaje tiene un nombre, fechas de inicio y fin, un estado de ciclo de vida,
 * y puede contener miembros, itinerarios y gastos asociados.
 *
 * @remarks
 * Alcance funcional:
 * - Define los datos generales del viaje (nombre, descripción, fechas, presupuesto).
 * - Gestiona el ciclo de vida mediante el campo `status` (PLANNED -> ACTIVE -> FINISHED).
 * - Puede asociarse opcionalmente a una localidad de referencia (municipio español).
 * - Soporta puntuación del usuario (rating 1-10) una vez finalizado.
 *
 * @see TripMember Entidad de miembros del viaje.
 * @see TripItinerary Entidad de paradas del itinerario.
 * @see Expense Entidad de gastos del viaje.
 */
@Entity({
  comment: 'Viajes planificados por los usuarios de Kotrip',
  name: 'trip',
})
@Index('idx_trip_status', ['status'])
@Index('idx_trip_start_date', ['startDate'])
export class Trip extends CUDTzEntity {
  // #region Primary Key

  /**
   * Identificador único del viaje (UUID v4).
   *
   * @remarks Se genera automáticamente al crear el viaje.
   */
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Identificador único del viaje (UUID v4)',
    name: 'id',
  })
  id: string;

  // #endregion

  // #region Columns - Información general

  /**
   * Nombre del viaje.
   *
   * @remarks
   * - Obligatorio.
   * - Longitud máxima definida por `MAX_TRIP_NAME_LENGTH`.
   */
  @Column({
    comment: 'Nombre del viaje',
    length: MAX_TRIP_NAME_LENGTH,
    name: 'name',
    type: 'varchar',
  })
  name: string;

  /**
   * Descripción del viaje.
   *
   * @remarks
   * - Opcional, puede ser null.
   * - Longitud máxima definida por `MAX_TRIP_DESCRIPTION_LENGTH`.
   */
  @Column({
    comment: 'Descripción del viaje',
    length: MAX_TRIP_DESCRIPTION_LENGTH,
    name: 'description',
    nullable: true,
    type: 'varchar',
  })
  description: string | null;

  /**
   * Fecha de inicio del viaje.
   *
   * @remarks Incluye zona horaria (timestamptz).
   */
  @Column({
    comment: 'Fecha de inicio del viaje',
    name: 'start_date',
    type: 'timestamptz',
  })
  startDate: Date;

  /**
   * Fecha de fin del viaje.
   *
   * @remarks Incluye zona horaria (timestamptz).
   */
  @Column({
    comment: 'Fecha de fin del viaje',
    name: 'end_date',
    type: 'timestamptz',
  })
  endDate: Date;

  // #endregion

  // #region Columns - Valoración y presupuesto

  /**
   * Puntuación del viaje asignada por el usuario.
   *
   * @remarks
   * - Escala de 1 a 10 (entero).
   * - Opcional, puede ser null si aún no se ha valorado.
   */
  @Column({
    comment: 'Puntuación del viaje (1-10)',
    name: 'rating',
    nullable: true,
    type: 'smallint',
  })
  rating: number | null;

  /**
   * Presupuesto estimado del viaje en euros.
   *
   * @remarks
   * - Precisión de 10 dígitos con 2 decimales.
   * - Opcional, puede ser null si no se ha definido presupuesto.
   */
  @Column({
    comment: 'Presupuesto estimado del viaje en EUR',
    name: 'budget',
    nullable: true,
    precision: 10,
    scale: 2,
    type: 'decimal',
  })
  budget: number | null;

  // #endregion

  // #region Columns - Estado

  /**
   * Estado actual del viaje dentro de su ciclo de vida.
   *
   * @remarks
   * Estados disponibles:
   * - PLANNED: El viaje está planificado pero aún no ha comenzado.
   * - ACTIVE: El viaje está en curso.
   * - FINISHED: El viaje ha finalizado.
   * - CANCELLED: El viaje ha sido cancelado.
   */
  @Column({
    comment: 'Estado actual del viaje en su ciclo de vida',
    default: TripStatus.PLANNED,
    enum: TripStatus,
    enumName: 'TripStatus',
    name: 'status',
    type: 'enum',
  })
  status: TripStatus;

  // #endregion

  // #region Relations

  /**
   * Localidad asociada al viaje.
   *
   * @remarks
   * - Referencia opcional a un municipio de la tabla de localidades.
   * - Permite clasificar el destino principal del viaje.
   */
  @ManyToOne(() => Locality, { nullable: true })
  locality: Locality | null;

  /**
   * Miembros del viaje.
   */
  @OneToMany(() => TripMember, (member) => member.trip)
  members: TripMember[];

  /**
   * Invitaciones pendientes al viaje.
   */
  @OneToMany(() => TripMemberInvitation, (invitation) => invitation.trip)
  invitations: TripMemberInvitation[];

  /**
   * Paradas del itinerario del viaje.
   */
  @OneToMany(() => TripItinerary, (itinerary) => itinerary.trip)
  itineraries: TripItinerary[];

  /**
   * Gastos asociados al viaje.
   */
  @OneToMany(() => Expense, (expense) => expense.trip)
  expenses: Expense[];

  // #endregion
}
