/**
 * Tipos del sistema de seeding basado en presets TypeScript.
 *
 * Define las interfaces de entrada para cada entidad que el DSL de builders
 * acepta, asi como los tipos acumulados internos que el contexto gestiona
 * antes de hacer flush a la base de datos.
 *
 * @module seeder.types
 */
import type { Language, Role, TravelMethod, TripStatus } from '@kotrip/data';
import type { SeederContext } from './seeder.context';

// ─────────────────────────────────────────────────────────────────────────────
// Preset
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Funcion que recibe un contexto de seeding y lo configura declarativamente.
 *
 * @param ctx - Contexto de seeding donde se registran usuarios.
 */
export type SeederPresetFn = (ctx: SeederContext) => void | Promise<void>;

/**
 * Entrada de preset con nombre descriptivo y funcion de configuracion.
 */
export interface SeederPresetEntry {
  /** Nombre descriptivo del preset para logs. */
  name: string;
  /** Funcion que configura el contexto. */
  fn: SeederPresetFn;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inputs de builder (lo que el usuario del DSL proporciona)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Datos de entrada para crear un usuario.
 * El email se proporciona como primer argumento del metodo `user()` del contexto.
 */
export interface UserInput {
  /** Nombre del usuario. */
  firstName: string;
  /** Apellidos del usuario. */
  lastName: string;
  /** Contrasena en texto plano (se hashea durante el flush). */
  password: string;
  /** Rol del usuario en la plataforma. */
  role: Role;
  /** Idioma preferido del usuario. */
  language?: Language;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos acumulados internos (almacenados por el contexto antes del flush)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Usuario acumulado con su email ya incorporado.
 */
export type AccumulatedUser = UserInput & {
  /** Email del usuario. */
  email: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Trip
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Datos de entrada para crear un viaje.
 * El nombre se usa como clave de referencia cruzada en otros presets.
 */
export interface TripInput {
  /** Nombre del viaje. */
  name: string;
  /** Descripcion del viaje. */
  description?: string;
  /** Fecha de inicio. */
  startDate: Date;
  /** Fecha de fin. */
  endDate: Date;
  /** Presupuesto estimado en EUR. */
  budget?: number;
  /** Nombre de la localidad asociada (se resuelve a ID real). */
  localityName?: string;
  /** Estado del viaje. */
  status?: TripStatus;
  /** Puntuación del viaje (1-10). */
  rating?: number;
}

/**
 * Viaje acumulado con el email del propietario incorporado.
 */
export type AccumulatedTrip = TripInput & {
  /** Email del usuario propietario (creador con todos los permisos). */
  ownerEmail: string;
};

/**
 * Datos de entrada para crear un miembro de viaje.
 */
export interface TripMemberInput {
  /** Email del usuario a añadir como miembro. */
  userEmail: string;
  /** Permiso para gestionar gastos. */
  canEditBudget?: boolean;
  /** Permiso para modificar datos generales del viaje. */
  canEditTrip?: boolean;
  /** Permiso para modificar detalles del itinerario. */
  canEditDetails?: boolean;
  /** Permiso para añadir/eliminar miembros. */
  canModifyMembers?: boolean;
  /** Permiso para enviar invitaciones. */
  canInviteMembers?: boolean;
  /** Permiso para gestionar tickets. */
  canManageTickets?: boolean;
  /** Rol decorativo. */
  decorativeRole?: string;
}

/**
 * Miembro de viaje acumulado con el nombre del viaje incorporado.
 */
export type AccumulatedTripMember = TripMemberInput & {
  /** Nombre del viaje al que se añade el miembro. */
  tripName: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Itinerary Stop
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Datos de entrada para crear una parada de itinerario.
 * El nombre de la parada se usa como clave de referencia para tickets.
 */
export interface ItineraryStopInput {
  /** Nombre de la parada o destino. */
  name: string;
  /** Latitud de la coordenada geográfica. */
  latitude: number;
  /** Longitud de la coordenada geográfica. */
  longitude: number;
  /** Tiempo de viaje desde la parada anterior en segundos. */
  travelTime?: number;
  /** Método de desplazamiento desde la parada anterior. */
  travelMethod?: TravelMethod;
  /** Hora de llegada prevista. */
  arriveAt?: Date;
}

/**
 * Parada de itinerario acumulada con el nombre del viaje incorporado.
 */
export type AccumulatedItineraryStop = ItineraryStopInput & {
  /** Nombre del viaje al que pertenece la parada. */
  tripName: string;
  /** Orden de inserción (asignado automáticamente). */
  order: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Expense
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Datos de entrada para crear un gasto de viaje.
 */
export interface ExpenseInput {
  /** Fecha y hora del pago. */
  paidAt: Date;
  /** Importe del gasto en EUR. */
  quantity: number;
  /** Email del usuario que pagó. */
  payerEmail: string;
  /** Emails de los usuarios entre los que se reparte el gasto. */
  payeeEmails: string[];
  /** Nombre de la parada de itinerario asociada (opcional). */
  stopName?: string;
}

/**
 * Gasto acumulado con el nombre del viaje incorporado.
 */
export type AccumulatedExpense = ExpenseInput & {
  /** Nombre del viaje al que pertenece el gasto. */
  tripName: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Ticket
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Datos de entrada para crear un ticket de itinerario.
 */
export interface TicketInput {
  /** Nombre del ticket. */
  name: string;
  /** Descripción del ticket. */
  description?: string;
  /** URL del objeto asociado (path de MinIO o URL externa). */
  objectUrl?: string;
}

/**
 * Ticket acumulado con el nombre del viaje y la parada incorporados.
 */
export type AccumulatedTicket = TicketInput & {
  /** Nombre del viaje al que pertenece el ticket. */
  tripName: string;
  /** Nombre de la parada del itinerario a la que pertenece el ticket. */
  stopName: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Mapas de IDs (resolucion de referencias a UUIDs reales)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mapas de resolucion de identificadores textuales a UUIDs de base de datos.
 * Se comparten entre presets para permitir referencias cruzadas.
 */
export interface SeederIdMaps {
  /** Email de usuario a UUID. */
  userEmailToId: Map<string, string>;
  /** Nombre de viaje a UUID. */
  tripNameToId: Map<string, string>;
  /** Clave compuesta "tripName::stopName" a UUID de parada. */
  stopKeyToId: Map<string, string>;
}
