/**
 * Contexto del sistema de seeding basado en presets.
 *
 * Proporciona un DSL declarativo para definir usuarios. Las definiciones
 * se acumulan internamente y se materializan durante el flush del orquestador.
 *
 * @module seeder.context
 */
import type {
  AccumulatedExpense,
  AccumulatedItineraryStop,
  AccumulatedTicket,
  AccumulatedTrip,
  AccumulatedTripMember,
  AccumulatedUser,
  ExpenseInput,
  ItineraryStopInput,
  SeederIdMaps,
  TicketInput,
  TripInput,
  TripMemberInput,
  UserInput,
} from './seeder.types';

// ─────────────────────────────────────────────────────────────────────────────
// Contexto principal del seeder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Contexto de construccion del seeder.
 *
 * Proporciona un DSL declarativo para definir usuarios y viajes en presets
 * de semillado. Las definiciones se acumulan internamente y se materializan
 * posteriormente por el orquestador del seeder.
 *
 * @example
 * ```typescript
 * const myPreset: SeederPresetFn = (ctx) => {
 *   ctx.user('admin@kotrip.local', { ... });
 *   ctx.trip('admin@kotrip.local', { name: 'Mi viaje', ... });
 *   ctx.tripMember('Mi viaje', { userEmail: 'user1@kotrip.local', ... });
 * };
 * ```
 */
export class SeederContext {
  /** Usuarios acumulados para crear durante el semillado. */
  private users: AccumulatedUser[] = [];

  /** Viajes acumulados para crear durante el semillado. */
  private trips: AccumulatedTrip[] = [];

  /** Miembros de viaje acumulados para crear durante el semillado. */
  private tripMembers: AccumulatedTripMember[] = [];

  /** Paradas de itinerario acumuladas para crear durante el semillado. */
  private itineraryStops: AccumulatedItineraryStop[] = [];

  /** Contador de orden por viaje para asignar automáticamente. */
  private stopOrderCounters: Map<string, number> = new Map();

  /** Gastos acumulados para crear durante el semillado. */
  private expenses: AccumulatedExpense[] = [];

  /** Tickets acumulados para crear durante el semillado. */
  private tickets: AccumulatedTicket[] = [];

  /** Mapas de IDs compartidos entre presets. */
  private readonly idMaps: SeederIdMaps;

  /**
   * Crea una nueva instancia del contexto de seeding.
   *
   * @param idMaps - Mapas de resolucion de IDs compartidos entre presets.
   */
  constructor(idMaps: SeederIdMaps) {
    this.idMaps = idMaps;
  }

  /**
   * Registra un usuario para su creacion durante el semillado.
   *
   * @param email - Email unico del usuario (usado como identificador de referencia).
   * @param input - Datos de configuracion del usuario (nombre, contrasena, rol, idioma).
   */
  user(email: string, input: UserInput): void {
    this.users.push({ ...input, email });
  }

  /**
   * Registra un viaje para su creacion durante el semillado.
   *
   * El propietario (ownerEmail) se convierte automaticamente en miembro
   * con todos los permisos activados.
   *
   * @param ownerEmail - Email del usuario propietario del viaje.
   * @param input - Datos del viaje (nombre, fechas, etc.).
   */
  trip(ownerEmail: string, input: TripInput): void {
    this.trips.push({ ...input, ownerEmail });
  }

  /**
   * Registra un miembro adicional de viaje para su creacion durante el semillado.
   *
   * @param tripName - Nombre del viaje (debe coincidir con un viaje registrado).
   * @param input - Datos del miembro (email del usuario, permisos, rol decorativo).
   */
  tripMember(tripName: string, input: TripMemberInput): void {
    this.tripMembers.push({ ...input, tripName });
  }

  /**
   * Registra una parada de itinerario para su creacion durante el semillado.
   *
   * El orden se asigna automáticamente de forma secuencial por viaje.
   *
   * @param tripName - Nombre del viaje al que pertenece la parada.
   * @param input - Datos de la parada (nombre, coordenadas, etc.).
   */
  itineraryStop(tripName: string, input: ItineraryStopInput): void {
    const currentOrder = this.stopOrderCounters.get(tripName) ?? 0;
    this.itineraryStops.push({ ...input, tripName, order: currentOrder });
    this.stopOrderCounters.set(tripName, currentOrder + 1);
  }

  /**
   * Registra un gasto para su creacion durante el semillado.
   *
   * @param tripName - Nombre del viaje al que pertenece el gasto.
   * @param input - Datos del gasto (importe, pagador, beneficiarios, etc.).
   */
  expense(tripName: string, input: ExpenseInput): void {
    this.expenses.push({ ...input, tripName });
  }

  /**
   * Registra un ticket de itinerario para su creacion durante el semillado.
   *
   * @param tripName - Nombre del viaje al que pertenece el ticket.
   * @param stopName - Nombre de la parada del itinerario a la que se asocia.
   * @param input - Datos del ticket (nombre, descripcion, URL).
   */
  ticket(tripName: string, stopName: string, input: TicketInput): void {
    this.tickets.push({ ...input, tripName, stopName });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Getters para datos acumulados (usados por el orquestador durante el flush)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Obtiene la lista de usuarios acumulados.
   *
   * @returns Array de usuarios registrados en este contexto.
   */
  getUsers(): AccumulatedUser[] {
    return this.users;
  }

  /**
   * Obtiene la lista de viajes acumulados.
   *
   * @returns Array de viajes registrados en este contexto.
   */
  getTrips(): AccumulatedTrip[] {
    return this.trips;
  }

  /**
   * Obtiene la lista de miembros de viaje acumulados.
   *
   * @returns Array de miembros de viaje registrados en este contexto.
   */
  getTripMembers(): AccumulatedTripMember[] {
    return this.tripMembers;
  }

  /**
   * Obtiene la lista de paradas de itinerario acumuladas.
   *
   * @returns Array de paradas registradas en este contexto.
   */
  getItineraryStops(): AccumulatedItineraryStop[] {
    return this.itineraryStops;
  }

  /**
   * Obtiene la lista de gastos acumulados.
   *
   * @returns Array de gastos registrados en este contexto.
   */
  getExpenses(): AccumulatedExpense[] {
    return this.expenses;
  }

  /**
   * Obtiene la lista de tickets acumulados.
   *
   * @returns Array de tickets registrados en este contexto.
   */
  getTickets(): AccumulatedTicket[] {
    return this.tickets;
  }
}
