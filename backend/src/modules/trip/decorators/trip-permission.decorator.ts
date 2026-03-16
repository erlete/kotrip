import { SetMetadata } from '@nestjs/common';

/**
 * Clave de metadatos para el permiso de viaje requerido.
 *
 * @remarks
 * Utilizada por el `TripPermissionGuard` para leer el permiso asociado
 * al handler mediante `Reflector`.
 */
export const TRIP_PERMISSION_KEY = 'tripPermission';

/**
 * Decorador que asocia un permiso de viaje al handler del controlador.
 *
 * @param permission - Nombre del campo booleano de `TripMember` que se requiere
 *                     (por ejemplo, `'canEditTrip'`, `'canEditBudget'`).
 * @returns Decorador de metadatos de NestJS.
 */
export const TripPermission = (permission: string) =>
  SetMetadata(TRIP_PERMISSION_KEY, permission);
