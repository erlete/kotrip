import { SetMetadata } from '@nestjs/common';

/**
 * Clave de metadatos para el decorador de membresía de equipo.
 */
export const TEAM_MEMBERSHIP_KEY = 'team_membership_required';

/**
 * Decorador para requerir membresía de equipo.
 *
 * Cuando se aplica a un endpoint, indica que el usuario debe ser
 * miembro de un equipo en el curso para acceder al recurso.
 *
 * @remarks
 * Este decorador trabaja en conjunto con `TeamMembershipGuard`.
 * Solo tiene efecto en cursos con modo de participación TEAM.
 *
 * **Uso típico**:
 * - Endpoints de entrega de intentos.
 * - Acceso a contenido del curso.
 * - Vistas de actividades y unidades.
 *
 * @example
 * ```typescript
 * @Get(':courseId/content')
 * @RequireTeamMembership()
 * async getCourseContent(@Param('courseId') courseId: string) {
 *   // Solo accesible si el usuario es miembro de un equipo
 * }
 * ```
 *
 * @returns Decorador que aplica el metadato.
 */
export const RequireTeamMembership = () =>
  SetMetadata(TEAM_MEMBERSHIP_KEY, true);
