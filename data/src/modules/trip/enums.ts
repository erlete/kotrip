/**
 * Estado de un viaje.
 *
 * @remarks
 * Refleja el ciclo de vida del viaje desde su planificación hasta su cancelación.
 */
export enum TripStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

/**
 * Estado de una invitación a un viaje.
 *
 * @remarks
 * Una invitación comienza como PENDING y el receptor puede aceptarla o rechazarla.
 */
export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

/**
 * Método de desplazamiento entre paradas de un itinerario.
 */
export enum TravelMethod {
  CAR = 'CAR',
  WALKING = 'WALKING',
}
