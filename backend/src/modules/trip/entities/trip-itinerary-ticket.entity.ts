import { CUDTzEntity } from '@/lib/data/entities/timestamped.entity';
import {
  MAX_TICKET_DESCRIPTION_LENGTH,
  MAX_TICKET_NAME_LENGTH,
  MAX_TICKET_URL_LENGTH,
} from '@kotrip/data';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Expense } from './expense.entity';
import type { TripItinerary } from './trip-itinerary.entity';
import type { Trip } from './trip.entity';

/**
 * Entidad TripItineraryTicket (Ticket de Itinerario).
 *
 * Representa un documento o comprobante asociado a una parada del itinerario,
 * como entradas, reservas, billetes de transporte, etc.
 *
 * @remarks
 * Alcance funcional:
 * - Almacena metadatos del ticket (nombre, descripción).
 * - Puede referenciar un archivo almacenado en MinIO o una URL externa.
 * - Opcionalmente puede vincularse a un gasto para asociar el coste del ticket.
 *
 * Almacenamiento de archivos:
 * - El campo `objectUrl` puede contener tanto un path de MinIO como una URL externa.
 * - Para archivos almacenados en MinIO, se usa `getTripTicketPath()` de `@kotrip/data`.
 *
 * @see TripItinerary Parada del itinerario a la que pertenece.
 * @see Expense Gasto asociado opcionalmente al ticket.
 */
@Entity({
  comment: 'Tickets y documentos asociados a paradas del itinerario',
  name: 'trip_itinerary_ticket',
})
export class TripItineraryTicket extends CUDTzEntity {
  // #region Primary Key

  /**
   * Identificador único del ticket (UUID v4).
   *
   * @remarks Se genera automáticamente al crear el ticket.
   */
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Identificador único del ticket (UUID v4)',
    name: 'id',
  })
  id: string;

  // #endregion

  // #region Columns - Información del ticket

  /**
   * Nombre del ticket.
   *
   * @remarks
   * - Obligatorio.
   * - Longitud máxima definida por `MAX_TICKET_NAME_LENGTH`.
   */
  @Column({
    comment: 'Nombre del ticket',
    length: MAX_TICKET_NAME_LENGTH,
    name: 'name',
    type: 'varchar',
  })
  name: string;

  /**
   * Descripción del ticket.
   *
   * @remarks
   * - Opcional, puede ser null.
   * - Longitud máxima definida por `MAX_TICKET_DESCRIPTION_LENGTH`.
   */
  @Column({
    comment: 'Descripción del ticket',
    length: MAX_TICKET_DESCRIPTION_LENGTH,
    name: 'description',
    nullable: true,
    type: 'varchar',
  })
  description: string | null;

  /**
   * URL del objeto asociado al ticket.
   *
   * @remarks
   * - Puede ser un path de MinIO o una URL externa.
   * - Opcional, puede ser null si el ticket no tiene archivo asociado.
   */
  @Column({
    comment: 'URL del objeto asociado (MinIO o URL externa)',
    length: MAX_TICKET_URL_LENGTH,
    name: 'object_url',
    nullable: true,
    type: 'varchar',
  })
  objectUrl: string | null;

  // #endregion

  // #region Relations

  /**
   * Viaje al que pertenece este ticket.
   */
  @ManyToOne('Trip', { nullable: false })
  trip: Trip;

  /**
   * Parada del itinerario a la que pertenece este ticket.
   *
   * @remarks Puede ser null si la parada asociada fue eliminada (SET NULL).
   */
  @ManyToOne('TripItinerary', 'tickets', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  tripItinerary: TripItinerary | null;

  /**
   * Gasto asociado al ticket.
   *
   * @remarks Opcional, puede ser null si el ticket no tiene coste asociado.
   */
  @ManyToOne(() => Expense, { nullable: true })
  expense: Expense | null;

  // #endregion
}
