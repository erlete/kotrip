import { CUDTzEntity } from '@/lib/data/entities/timestamped.entity';
import { MAX_ITINERARY_NAME_LENGTH, TravelMethod } from '@kotrip/data';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Expense } from './expense.entity';
import type { TripItineraryTicket } from './trip-itinerary-ticket.entity';
import type { Trip } from './trip.entity';

/**
 * Entidad TripItinerary (Parada del Itinerario).
 *
 * Representa una parada o destino dentro del itinerario de un viaje.
 * Las paradas forman una lista doblemente enlazada mediante `nextDestination`
 * y `previousDestination`, con un campo `order` desnormalizado para facilitar
 * la ordenación en consultas.
 *
 * @remarks
 * **Estructura de lista enlazada**:
 * - Cada parada puede apuntar a la siguiente y a la anterior.
 * - El campo `order` es un índice entero que refleja la posición en el itinerario.
 * - Las operaciones de inserción, eliminación y reordenamiento deben actualizar
 *   tanto los punteros como el campo `order` dentro de una transacción.
 *
 * **Información de desplazamiento**:
 * - `travelTime` indica el tiempo estimado para llegar a esta parada desde la anterior.
 * - `travelMethod` indica el medio de transporte utilizado (coche, a pie).
 *
 * @see Trip Entidad del viaje al que pertenece.
 * @see TripItineraryTicket Tickets asociados a esta parada.
 * @see Expense Gastos asociados a esta parada.
 */
@Entity({
  comment: 'Paradas del itinerario de un viaje',
  name: 'trip_itinerary',
})
@Index('idx_itinerary_trip_order', ['trip', 'order'])
export class TripItinerary extends CUDTzEntity {
  // #region Primary Key

  /**
   * Identificador único de la parada del itinerario (UUID v4).
   *
   * @remarks Se genera automáticamente al crear la parada.
   */
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Identificador único de la parada del itinerario (UUID v4)',
    name: 'id',
  })
  id: string;

  // #endregion

  // #region Columns - Información de la parada

  /**
   * Nombre de la parada o destino.
   *
   * @remarks
   * - Obligatorio.
   * - Longitud máxima definida por `MAX_ITINERARY_NAME_LENGTH`.
   */
  @Column({
    comment: 'Nombre de la parada o destino',
    length: MAX_ITINERARY_NAME_LENGTH,
    name: 'name',
    type: 'varchar',
  })
  name: string;

  /**
   * Latitud de la coordenada geográfica de la parada.
   *
   * @remarks Precisión de doble precisión para coordenadas GPS.
   */
  @Column({
    comment: 'Latitud de la coordenada geográfica',
    name: 'latitude',
    type: 'double precision',
  })
  latitude: number;

  /**
   * Longitud de la coordenada geográfica de la parada.
   *
   * @remarks Precisión de doble precisión para coordenadas GPS.
   */
  @Column({
    comment: 'Longitud de la coordenada geográfica',
    name: 'longitude',
    type: 'double precision',
  })
  longitude: number;

  // #endregion

  // #region Columns - Desplazamiento

  /**
   * Tiempo estimado de viaje desde la parada anterior en segundos.
   *
   * @remarks
   * - Opcional, puede ser null para la primera parada del itinerario.
   */
  @Column({
    comment: 'Tiempo estimado de viaje desde la parada anterior (segundos)',
    name: 'travel_time',
    nullable: true,
    type: 'integer',
  })
  travelTime: number | null;

  /**
   * Método de desplazamiento para llegar a esta parada desde la anterior.
   *
   * @remarks
   * - Opcional, puede ser null para la primera parada.
   */
  @Column({
    comment: 'Método de desplazamiento desde la parada anterior',
    enum: TravelMethod,
    enumName: 'TravelMethod',
    name: 'travel_method',
    nullable: true,
    type: 'enum',
  })
  travelMethod: TravelMethod | null;

  /**
   * Hora de llegada prevista a la parada.
   *
   * @remarks Incluye zona horaria (timestamptz). Opcional.
   */
  @Column({
    comment: 'Hora de llegada prevista a la parada',
    name: 'arrive_at',
    nullable: true,
    type: 'timestamptz',
  })
  arriveAt: Date | null;

  // #endregion

  // #region Columns - Ordenación

  /**
   * Índice de orden desnormalizado para la posición en el itinerario.
   *
   * @remarks
   * - Facilita consultas ordenadas sin necesidad de recorrer la lista enlazada.
   * - Debe mantenerse sincronizado con los punteros `nextDestination` / `previousDestination`.
   */
  @Column({
    comment: 'Índice de orden desnormalizado (posición en el itinerario)',
    name: 'order',
    type: 'integer',
  })
  order: number;

  // #endregion

  // #region Relations

  /**
   * Viaje al que pertenece esta parada.
   */
  @ManyToOne('Trip', 'itineraries', { nullable: false })
  trip: Trip;

  /**
   * Siguiente parada en el itinerario.
   *
   * @remarks Null si es la última parada.
   */
  @ManyToOne(() => TripItinerary, { nullable: true })
  nextDestination: TripItinerary | null;

  /**
   * Parada anterior en el itinerario.
   *
   * @remarks Null si es la primera parada.
   */
  @ManyToOne(() => TripItinerary, { nullable: true })
  previousDestination: TripItinerary | null;

  /**
   * Tickets asociados a esta parada del itinerario.
   */
  @OneToMany('TripItineraryTicket', 'tripItinerary')
  tickets: TripItineraryTicket[];

  /**
   * Gastos asociados a esta parada del itinerario.
   */
  @OneToMany('Expense', 'tripItinerary')
  expenses: Expense[];

  // #endregion
}
