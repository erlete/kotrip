import { CUDTzEntity } from '@/lib/data/entities/timestamped.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import type { TripItinerary } from './trip-itinerary.entity';
import type { Trip } from './trip.entity';

/**
 * Entidad Expense (Gasto).
 *
 * Representa un gasto individual dentro de un viaje, registrando quién pagó,
 * cuánto se pagó y entre quiénes se divide el coste.
 *
 * @remarks
 * **Modelo de reparto**:
 * - `payer`: El usuario que realizó el pago físico.
 * - `payees`: Los usuarios entre los que se reparte el gasto (quienes deben su parte).
 * - El importe por persona se calcula dividiendo `quantity` entre el número de `payees`.
 *
 * **Asociación**:
 * - Siempre pertenece a un viaje (`trip`).
 * - Opcionalmente puede estar vinculado a una parada específica del itinerario.
 *
 * @see Trip Entidad del viaje al que pertenece.
 * @see TripItinerary Parada del itinerario opcionalmente asociada.
 */
@Entity({
  comment: 'Gastos individuales de un viaje',
  name: 'expense',
})
export class Expense extends CUDTzEntity {
  // #region Primary Key

  /**
   * Identificador único del gasto (UUID v4).
   *
   * @remarks Se genera automáticamente al crear el gasto.
   */
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Identificador único del gasto (UUID v4)',
    name: 'id',
  })
  id: string;

  // #endregion

  // #region Columns - Datos del gasto

  /**
   * Fecha y hora en que se realizó el pago.
   *
   * @remarks Incluye zona horaria (timestamptz).
   */
  @Column({
    comment: 'Fecha y hora en que se realizó el pago',
    name: 'paid_at',
    type: 'timestamptz',
  })
  paidAt: Date;

  /**
   * Importe del gasto en euros.
   *
   * @remarks
   * - Precisión de 10 dígitos con 2 decimales.
   * - Siempre en EUR.
   */
  @Column({
    comment: 'Importe del gasto en EUR',
    name: 'quantity',
    precision: 10,
    scale: 2,
    type: 'decimal',
  })
  quantity: number;

  // #endregion

  // #region Relations

  /**
   * Usuario que realizó el pago.
   */
  @ManyToOne(() => User, { nullable: false })
  payer: User;

  /**
   * Usuarios entre los que se reparte el gasto.
   *
   * @remarks
   * Relación ManyToMany con tabla de unión `expense_payee`.
   * Cada usuario en esta lista debe su parte proporcional del gasto.
   */
  @ManyToMany(() => User)
  @JoinTable({ name: 'expense_payee' })
  payees: User[];

  /**
   * Viaje al que pertenece este gasto.
   */
  @ManyToOne('Trip', 'expenses', { nullable: false })
  trip: Trip;

  /**
   * Parada del itinerario asociada al gasto.
   *
   * @remarks Opcional, puede ser null si el gasto no está vinculado a una parada específica.
   */
  @ManyToOne('TripItinerary', 'expenses', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  tripItinerary: TripItinerary | null;

  // #endregion
}
