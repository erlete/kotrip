import { SetMetadata } from '@nestjs/common';

/**
 * Clave de metadatos para el decorador de membresía de equipo.
 */
export const TEAM_MEMBERSHIP_KEY = 'team_membership_required';

/**
 * Decorador para requerir membresia de equipo en un viaje.
 *
 * Cuando se aplica a un endpoint, indica que el usuario debe ser
 * miembro del equipo del viaje para acceder al recurso.
 *
 * @remarks
 * Este decorador trabaja en conjunto con el guard de membresia.
 *
 * @returns Decorador que aplica el metadato correspondiente.
 */
export const RequireTeamMembership = () =>
  SetMetadata(TEAM_MEMBERSHIP_KEY, true);
