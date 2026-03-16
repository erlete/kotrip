'use server';

import { authenticatedClient } from '@/lib/backend/client';
import type { BackendTypes } from '@/lib/backend/types';

/** Tipo de un viaje en vista de lista. */
export type TripListItem = BackendTypes['TripListOutputDto'];

/** Tipo del detalle completo de un viaje. */
export type TripDetail = BackendTypes['TripOutputDto'];

/** Tipo de una invitación a un viaje. */
export type Invitation = BackendTypes['InvitationOutputDto'];

/** Tipo de los datos necesarios para crear un viaje. */
export type CreateTripInput = BackendTypes['CreateTripDto'];

/** Tipo de los datos para actualizar un viaje. */
export type UpdateTripInput = BackendTypes['UpdateTripDto'];

/** Tipo de los datos para actualizar un miembro del viaje. */
export type UpdateTripMemberInput = BackendTypes['UpdateTripMemberDto'];

/** Tipo de los datos para crear un gasto. */
export type CreateExpenseInput = BackendTypes['CreateExpenseDto'];

/** Tipo de los datos para crear un ticket. */
export type CreateTicketInput = BackendTypes['CreateTicketDto'];

/** Tipo de los datos para actualizar un ticket. */
export type UpdateTicketInput = BackendTypes['UpdateTicketDto'];

/** Tipo de los datos para crear una parada de itinerario. */
export type CreateItineraryStopInput = BackendTypes['CreateItineraryStopDto'];

/** Tipo de los datos para actualizar una parada de itinerario. */
export type UpdateItineraryStopInput = BackendTypes['UpdateItineraryStopDto'];

/** Tipo de los datos para actualizar un gasto. */
export type UpdateExpenseInput = BackendTypes['UpdateExpenseDto'];

/** Tipo de los datos para invitar a un miembro. */
export type InviteMemberInput = BackendTypes['InviteMemberDto'];

/** Tipo de la información básica de un usuario (búsqueda). */
export type UserInfo = BackendTypes['UserInfoDTO'];

/**
 * Tipo de una localidad devuelta por el endpoint de búsqueda.
 *
 * @remarks
 * El tipo generado por OpenAPI es `Record<string, never>` debido a que
 * Swagger no expone las propiedades de la entidad Locality. Se define
 * manualmente a partir de la entidad del backend.
 */
export interface LocalitySearchResult {
  /** Identificador auto-incremental de la localidad. */
  id: number;
  /** Nombre del municipio. */
  name: string;
  /** Provincia a la que pertenece el municipio. */
  province: string;
  /** Comunidad autónoma a la que pertenece el municipio. */
  autonomousCommunity: string;
}

/** Tipo de una parada de itinerario. */
export type ItineraryStop = BackendTypes['ItineraryOutputDto'];

/** Tipo de un gasto de viaje. */
export type Expense = BackendTypes['ExpenseOutputDto'];

/** Tipo de un usuario asociado a un gasto. */
export type ExpenseUser = BackendTypes['ExpenseUserOutputDto'];

/** Tipo de un ticket de itinerario. */
export type Ticket = BackendTypes['TicketOutputDto'];

/** Tipo de un miembro de viaje. */
export type TripMember = BackendTypes['TripMemberOutputDto'];

/**
 * Extrae el mensaje de error de una respuesta errónea del backend.
 *
 * @param error Objeto de error devuelto por el cliente OpenAPI.
 * @returns Mensaje de error legible.
 */
function extractError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Error desconocido';
  const obj = error as Record<string, unknown>;
  if ('message' in obj) {
    const msg = obj.message;
    return Array.isArray(msg) ? (msg[0] as string) : String(msg);
  }
  return 'Error inesperado';
}

/**
 * Obtiene la lista de viajes del usuario autenticado.
 *
 * @returns Lista de viajes o un objeto con error.
 */
export async function fetchTrips(): Promise<
  { trips: TripListItem[] } | { error: string }
> {
  const { data, error } = await authenticatedClient.GET('/trip');

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { trips: data };
}

/**
 * Obtiene el detalle completo de un viaje.
 *
 * @param id Identificador UUID del viaje.
 * @returns Detalle del viaje o un objeto con error.
 */
export async function fetchTrip(
  id: string,
): Promise<{ trip: TripDetail } | { error: string }> {
  const { data, error } = await authenticatedClient.GET('/trip/{id}', {
    params: { path: { id } },
  });

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { trip: data };
}

/**
 * Obtiene las invitaciones pendientes del usuario autenticado.
 *
 * @returns Lista de invitaciones o un objeto con error.
 */
export async function fetchMyInvitations(): Promise<
  { invitations: Invitation[] } | { error: string }
> {
  const { data, error } = await authenticatedClient.GET(
    '/trip/invitation/mine',
  );

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { invitations: data };
}

/**
 * Responde a una invitación de viaje (aceptar o rechazar).
 *
 * @param invitationId Identificador UUID de la invitación.
 * @param accept `true` para aceptar, `false` para rechazar.
 * @returns Invitación actualizada o un objeto con error.
 */
export async function respondInvitation(
  invitationId: string,
  accept: boolean,
): Promise<{ invitation: Invitation } | { error: string }> {
  const { data, error } = await authenticatedClient.PUT(
    '/trip/invitation/{invitationId}',
    {
      params: { path: { invitationId } },
      body: { accept },
    },
  );

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { invitation: data };
}

/**
 * Crea un nuevo viaje.
 *
 * @param input Datos del viaje a crear.
 * @returns Detalle del viaje creado o un objeto con error.
 */
export async function createTrip(
  input: CreateTripInput,
): Promise<{ trip: TripDetail } | { error: string }> {
  const { data, error } = await authenticatedClient.POST('/trip', {
    body: input,
  });

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { trip: data };
}

/**
 * Obtiene la lista de miembros de un viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @returns Lista de miembros o un objeto con error.
 */
export async function fetchTripMembers(
  tripId: string,
): Promise<{ members: TripMember[] } | { error: string }> {
  const { data, error } = await authenticatedClient.GET('/trip/{id}/member', {
    params: { path: { id: tripId } },
  });

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { members: data };
}

/**
 * Obtiene las paradas de itinerario de un viaje ordenadas por posición.
 *
 * @param tripId Identificador UUID del viaje.
 * @returns Lista de paradas o un objeto con error.
 */
export async function fetchItinerary(
  tripId: string,
): Promise<{ stops: ItineraryStop[] } | { error: string }> {
  const { data, error } = await authenticatedClient.GET(
    '/trip/{id}/itinerary',
    {
      params: { path: { id: tripId } },
    },
  );

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { stops: data };
}

/**
 * Obtiene los gastos de un viaje ordenados por fecha descendente.
 *
 * @param tripId Identificador UUID del viaje.
 * @returns Lista de gastos o un objeto con error.
 */
export async function fetchExpenses(
  tripId: string,
): Promise<{ expenses: Expense[] } | { error: string }> {
  const { data, error } = await authenticatedClient.GET('/trip/{id}/expense', {
    params: { path: { id: tripId } },
  });

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { expenses: data };
}

/**
 * Obtiene los tickets de un viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @returns Lista de tickets o un objeto con error.
 */
export async function fetchTickets(
  tripId: string,
): Promise<{ tickets: Ticket[] } | { error: string }> {
  const { data, error } = await authenticatedClient.GET('/trip/{id}/ticket', {
    params: { path: { id: tripId } },
  });

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { tickets: data };
}

/**
 * Obtiene una URL pre-firmada para descargar un archivo de ticket desde MinIO.
 *
 * @param objectUrl Path del objeto en MinIO (ej. "trips/{id}/tickets/{id}/file.pdf").
 * @returns URL pre-firmada para la descarga, o null si falla.
 */
export async function getTicketDownloadUrl(
  objectUrl: string,
): Promise<string | null> {
  try {
    const { data, error } = await authenticatedClient.GET(
      '/files/file-url/{bucket}/{id}',
      {
        params: {
          path: {
            bucket: 'kotrip',
            id: objectUrl,
          },
        },
      },
    );

    if (error || !data) return null;

    const url = (data as { url?: string }).url;
    return url ?? null;
  } catch {
    return null;
  }
}

/**
 * Actualiza los permisos de un miembro del viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @param memberId Identificador UUID del miembro.
 * @param permissions Permisos a actualizar.
 * @returns Miembro actualizado o un objeto con error.
 */
export async function updateTripMember(
  tripId: string,
  memberId: string,
  permissions: UpdateTripMemberInput,
): Promise<{ member: TripMember } | { error: string }> {
  const { data, error } = await authenticatedClient.PUT(
    '/trip/{id}/member/{memberId}',
    {
      params: { path: { id: tripId, memberId } },
      body: permissions,
    },
  );

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { member: data };
}

/**
 * Elimina un miembro del viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @param memberId Identificador UUID del miembro.
 * @returns Indicador de éxito o un objeto con error.
 */
export async function removeTripMember(
  tripId: string,
  memberId: string,
): Promise<{ success: true } | { error: string }> {
  const { error } = await authenticatedClient.DELETE(
    '/trip/{id}/member/{memberId}',
    {
      params: { path: { id: tripId, memberId } },
    },
  );

  if (error) {
    return { error: extractError(error) };
  }

  return { success: true };
}

/**
 * Actualiza un viaje existente.
 *
 * @param tripId Identificador UUID del viaje.
 * @param input Datos parciales del viaje a actualizar.
 * @returns Detalle del viaje actualizado o un objeto con error.
 */
export async function updateTrip(
  tripId: string,
  input: UpdateTripInput,
): Promise<{ trip: TripDetail } | { error: string }> {
  const { data, error } = await authenticatedClient.PUT('/trip/{id}', {
    params: { path: { id: tripId } },
    body: input,
  });

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { trip: data };
}

/**
 * Busca localidades por prefijo de nombre para autocompletado.
 *
 * @param query Texto de búsqueda (prefijo del nombre del municipio).
 * @returns Lista de localidades o un objeto con error.
 */
export async function searchLocalities(
  query: string,
): Promise<{ localities: LocalitySearchResult[] } | { error: string }> {
  const { data, error } = await authenticatedClient.GET('/locality', {
    params: { query: { search: query } },
  });

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { localities: data as unknown as LocalitySearchResult[] };
}

/**
 * Crea un nuevo gasto en un viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @param input Datos del gasto a crear.
 * @returns Gasto creado o un objeto con error.
 */
export async function createExpense(
  tripId: string,
  input: CreateExpenseInput,
): Promise<{ expense: Expense } | { error: string }> {
  const { data, error } = await authenticatedClient.POST('/trip/{id}/expense', {
    params: { path: { id: tripId } },
    body: input,
  });

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { expense: data };
}

/**
 * Actualiza un gasto existente en un viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @param expenseId Identificador UUID del gasto.
 * @param input Datos parciales del gasto a actualizar.
 * @returns Gasto actualizado o un objeto con error.
 */
export async function updateExpense(
  tripId: string,
  expenseId: string,
  input: UpdateExpenseInput,
): Promise<{ expense: Expense } | { error: string }> {
  const { data, error } = await authenticatedClient.PUT(
    '/trip/{id}/expense/{expenseId}',
    {
      params: { path: { id: tripId, expenseId } },
      body: input,
    },
  );

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { expense: data };
}

/**
 * Elimina un gasto de un viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @param expenseId Identificador UUID del gasto.
 * @returns Indicador de éxito o un objeto con error.
 */
export async function deleteExpense(
  tripId: string,
  expenseId: string,
): Promise<{ success: true } | { error: string }> {
  const { error } = await authenticatedClient.DELETE(
    '/trip/{id}/expense/{expenseId}',
    {
      params: { path: { id: tripId, expenseId } },
    },
  );

  if (error) {
    return { error: extractError(error) };
  }

  return { success: true };
}

/**
 * Envía una invitación a un usuario para unirse a un viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @param input Datos de la invitación (receiverId).
 * @returns Invitación creada o un objeto con error.
 */
export async function inviteTripMember(
  tripId: string,
  input: InviteMemberInput,
): Promise<{ invitation: Invitation } | { error: string }> {
  const { data, error } = await authenticatedClient.POST(
    '/trip/{id}/invitation',
    {
      params: { path: { id: tripId } },
      body: input,
    },
  );

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { invitation: data };
}

/**
 * Busca usuarios por nombre o email para autocompletado.
 *
 * @param query Texto de búsqueda.
 * @returns Lista de usuarios o un objeto con error.
 */
export async function searchUsers(
  query: string,
): Promise<{ users: UserInfo[] } | { error: string }> {
  const { data, error } = await authenticatedClient.GET('/user/search', {
    params: { query: { q: query } },
  });

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { users: data };
}

/**
 * Crea un nuevo ticket en un viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @param input Datos del ticket a crear.
 * @returns Ticket creado o un objeto con error.
 */
export async function createTicket(
  tripId: string,
  input: CreateTicketInput,
): Promise<{ ticket: Ticket } | { error: string }> {
  const { data, error } = await authenticatedClient.POST('/trip/{id}/ticket', {
    params: { path: { id: tripId } },
    body: input,
  });

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { ticket: data };
}

/**
 * Actualiza un ticket existente en un viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @param ticketId Identificador UUID del ticket.
 * @param input Datos parciales del ticket a actualizar.
 * @returns Ticket actualizado o un objeto con error.
 */
export async function updateTicket(
  tripId: string,
  ticketId: string,
  input: UpdateTicketInput,
): Promise<{ ticket: Ticket } | { error: string }> {
  const { data, error } = await authenticatedClient.PUT(
    '/trip/{id}/ticket/{ticketId}',
    {
      params: { path: { id: tripId, ticketId } },
      body: input,
    },
  );

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { ticket: data };
}

/**
 * Elimina un ticket de un viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @param ticketId Identificador UUID del ticket.
 * @returns Indicador de éxito o un objeto con error.
 */
export async function deleteTicket(
  tripId: string,
  ticketId: string,
): Promise<{ success: true } | { error: string }> {
  const { error } = await authenticatedClient.DELETE(
    '/trip/{id}/ticket/{ticketId}',
    {
      params: { path: { id: tripId, ticketId } },
    },
  );

  if (error) {
    return { error: extractError(error) };
  }

  return { success: true };
}

/**
 * Crea una nueva parada de itinerario en un viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @param input Datos de la parada a crear.
 * @returns Parada creada o un objeto con error.
 */
export async function createItineraryStop(
  tripId: string,
  input: CreateItineraryStopInput,
): Promise<{ stop: ItineraryStop } | { error: string }> {
  const { data, error } = await authenticatedClient.POST(
    '/trip/{id}/itinerary',
    {
      params: { path: { id: tripId } },
      body: input,
    },
  );

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { stop: data };
}

/**
 * Actualiza una parada de itinerario existente.
 *
 * @param tripId Identificador UUID del viaje.
 * @param stopId Identificador UUID de la parada.
 * @param input Datos parciales a actualizar.
 * @returns Parada actualizada o un objeto con error.
 */
export async function updateItineraryStop(
  tripId: string,
  stopId: string,
  input: UpdateItineraryStopInput,
): Promise<{ stop: ItineraryStop } | { error: string }> {
  const { data, error } = await authenticatedClient.PUT(
    '/trip/{id}/itinerary/{stopId}',
    {
      params: { path: { id: tripId, stopId } },
      body: input,
    },
  );

  if (error || !data) {
    return { error: extractError(error) };
  }

  return { stop: data };
}

/**
 * Elimina una parada de itinerario.
 *
 * @param tripId Identificador UUID del viaje.
 * @param stopId Identificador UUID de la parada.
 * @returns Indicador de éxito o un objeto con error.
 */
export async function deleteItineraryStop(
  tripId: string,
  stopId: string,
): Promise<{ success: true } | { error: string }> {
  const { error } = await authenticatedClient.DELETE(
    '/trip/{id}/itinerary/{stopId}',
    {
      params: { path: { id: tripId, stopId } },
    },
  );

  if (error) {
    return { error: extractError(error) };
  }

  return { success: true };
}

/**
 * Reordena las paradas de itinerario de un viaje.
 *
 * @param tripId Identificador UUID del viaje.
 * @param stopIds Array ordenado de IDs de paradas.
 * @returns Indicador de éxito o un objeto con error.
 */
export async function reorderItinerary(
  tripId: string,
  stopIds: string[],
): Promise<{ success: true } | { error: string }> {
  const { error } = await authenticatedClient.PUT(
    '/trip/{id}/itinerary/reorder',
    {
      params: { path: { id: tripId } },
      body: { stopIds },
    },
  );

  if (error) {
    return { error: extractError(error) };
  }

  return { success: true };
}
