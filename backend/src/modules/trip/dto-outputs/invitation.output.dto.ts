import { InvitationStatus } from '@kotrip/data';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de salida con informaci\u00f3n b\u00e1sica de un usuario en el contexto de invitaciones.
 */
export class InvitationUserOutputDto {
  /** Identificador \u00fanico del usuario (UUID). */
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  id: string;

  /** Nombre del usuario. */
  @ApiProperty({ example: 'Carlos' })
  firstName: string | null;

  /** Apellidos del usuario. */
  @ApiProperty({ example: 'Garc\u00eda L\u00f3pez' })
  lastName: string | null;

  /** Correo electr\u00f3nico del usuario. */
  @ApiProperty({ example: 'carlos@example.com' })
  email: string;
}

/**
 * DTO de salida con informaci\u00f3n b\u00e1sica del viaje en el contexto de invitaciones.
 */
export class InvitationTripOutputDto {
  /** Identificador \u00fanico del viaje (UUID). */
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  /** Nombre del viaje. */
  @ApiProperty({ example: 'Viaje a Madrid' })
  name: string;
}

/**
 * DTO de salida con la informaci\u00f3n completa de una invitaci\u00f3n a un viaje.
 *
 * @remarks
 * Incluye los datos del emisor, receptor, viaje y estado de la invitaci\u00f3n.
 */
export class InvitationOutputDto {
  /** Identificador \u00fanico de la invitaci\u00f3n (UUID). */
  @ApiProperty({ example: 'd4e5f6a7-b890-1234-defa-234567890123' })
  id: string;

  /** Estado actual de la invitaci\u00f3n. */
  @ApiProperty({ enum: InvitationStatus, example: InvitationStatus.PENDING })
  status: InvitationStatus;

  /** Usuario que envi\u00f3 la invitaci\u00f3n. */
  @ApiProperty({ type: () => InvitationUserOutputDto })
  issuer: InvitationUserOutputDto;

  /** Usuario que recibe la invitaci\u00f3n. */
  @ApiProperty({ type: () => InvitationUserOutputDto })
  receiver: InvitationUserOutputDto;

  /** Viaje asociado a la invitaci\u00f3n. */
  @ApiProperty({ type: () => InvitationTripOutputDto })
  trip: InvitationTripOutputDto;

  /** Fecha de creaci\u00f3n de la invitaci\u00f3n. */
  @ApiProperty({ example: '2026-03-12T10:00:00.000Z' })
  createdAt: Date;
}
