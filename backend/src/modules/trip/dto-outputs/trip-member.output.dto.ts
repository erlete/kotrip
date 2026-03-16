import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de salida con informaci\u00f3n b\u00e1sica del usuario asociado a un miembro.
 */
export class MemberUserOutputDto {
  /** Identificador \u00fanico del usuario (UUID). */
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  id: string;

  /** Nombre del usuario. */
  @ApiPropertyOptional({ example: 'Carlos' })
  firstName: string | null;

  /** Apellidos del usuario. */
  @ApiPropertyOptional({ example: 'Garc\u00eda L\u00f3pez' })
  lastName: string | null;

  /** Correo electr\u00f3nico del usuario. */
  @ApiProperty({ example: 'carlos@example.com' })
  email: string;
}

/**
 * DTO de salida con la informaci\u00f3n completa de un miembro de viaje.
 *
 * @remarks
 * Incluye los datos b\u00e1sicos del usuario, permisos granulares
 * y el rol decorativo del miembro.
 */
export class TripMemberOutputDto {
  /** Identificador \u00fanico del miembro (UUID). */
  @ApiProperty({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  id: string;

  /** Datos b\u00e1sicos del usuario. */
  @ApiProperty({ type: () => MemberUserOutputDto })
  user: MemberUserOutputDto;

  /** Permiso para gestionar gastos. */
  @ApiProperty({ example: true })
  canEditBudget: boolean;

  /** Permiso para modificar datos generales del viaje. */
  @ApiProperty({ example: true })
  canEditTrip: boolean;

  /** Permiso para modificar detalles del itinerario. */
  @ApiProperty({ example: true })
  canEditDetails: boolean;

  /** Permiso para a\u00f1adir o eliminar miembros. */
  @ApiProperty({ example: true })
  canModifyMembers: boolean;

  /** Permiso para enviar invitaciones. */
  @ApiProperty({ example: true })
  canInviteMembers: boolean;

  /** Permiso para gestionar tickets. */
  @ApiProperty({ example: true })
  canManageTickets: boolean;

  /** Indica si el miembro es el creador del viaje. */
  @ApiProperty({ description: 'Indica si el miembro es el creador del viaje.' })
  isCreator: boolean;

  /** Rol decorativo del miembro. */
  @ApiPropertyOptional({ example: 'Conductor' })
  decorativeRole: string | null;

  /** Fecha de ingreso al viaje. */
  @ApiProperty({ example: '2026-03-12T10:00:00.000Z' })
  createdAt: Date;
}
