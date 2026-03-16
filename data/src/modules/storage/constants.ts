/**
 * Nombre del bucket único de almacenamiento de la plataforma.
 *
 * Todos los archivos de la plataforma se almacenan bajo este bucket,
 * organizados mediante paths jerárquicos que reflejan la estructura
 * lógica de los recursos.
 */
export const KOTRIP_BUCKET = 'kotrip';

// ---------------------------------------------------------------------------
// Funciones de construcción de paths
// ---------------------------------------------------------------------------

/**
 * Genera el path de almacenamiento para el avatar de un usuario.
 *
 * @param userId   - Identificador UUID del usuario.
 * @param fileName - Nombre del archivo (ej. `avatar.webp`).
 * @returns Path relativo dentro del bucket: `users/{userId}/avatars/{fileName}`.
 */
export function getUserAvatarPath(userId: string, fileName: string): string {
  return `users/${userId}/avatars/${fileName}`;
}

/**
 * Genera el path de almacenamiento para el ticket de un viaje.
 *
 * @param tripId   - Identificador UUID del viaje.
 * @param ticketId - Identificador UUID del ticket.
 * @param fileName - Nombre del archivo (ej. `boarding-pass.pdf`).
 * @returns Path relativo dentro del bucket:
 *          `trips/{tripId}/tickets/{ticketId}/{fileName}`.
 */
export function getTripTicketPath(
  tripId: string,
  ticketId: string,
  fileName: string,
): string {
  return `trips/${tripId}/tickets/${ticketId}/${fileName}`;
}
