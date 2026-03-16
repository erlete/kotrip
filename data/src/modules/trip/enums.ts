/**
 * Estado de un viaje.
 *
 * @remarks
 * Refleja el ciclo de vida del viaje desde su planificación hasta su cancelación.
 */
export enum TripStatus {
  /** El viaje esta planificado pero aun no ha comenzado. */
  PLANNED = 'PLANNED',
  /** El viaje esta en curso. */
  ACTIVE = 'ACTIVE',
  /** El viaje ha finalizado. */
  FINISHED = 'FINISHED',
  /** El viaje fue cancelado. */
  CANCELLED = 'CANCELLED',
}

/**
 * Estado de una invitación a un viaje.
 *
 * @remarks
 * Una invitación comienza como PENDING y el receptor puede aceptarla o rechazarla.
 */
export enum InvitationStatus {
  /** La invitacion esta pendiente de respuesta. */
  PENDING = 'PENDING',
  /** La invitacion fue aceptada por el receptor. */
  ACCEPTED = 'ACCEPTED',
  /** La invitacion fue rechazada por el receptor. */
  REJECTED = 'REJECTED',
}

/**
 * Método de desplazamiento entre paradas de un itinerario.
 */
export enum TravelMethod {
  /** Desplazamiento en coche. */
  CAR = 'CAR',
  /** Desplazamiento a pie. */
  WALKING = 'WALKING',
}
