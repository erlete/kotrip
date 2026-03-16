import { TripStatus } from '@kotrip/data';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de salida simplificado de un viaje para vistas de lista.
 *
 * @remarks
 * Contiene solo los campos esenciales para representar un viaje
 * en listados y tarjetas de resumen.
 */
export class TripListOutputDto {
  /** Identificador \u00fanico del viaje (UUID). */
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  /** Nombre del viaje. */
  @ApiProperty({ example: 'Viaje a Madrid' })
  name: string;

  /** Descripci\u00f3n del viaje. */
  @ApiPropertyOptional({ example: 'Un viaje cultural por la capital' })
  description: string | null;

  /** Fecha de inicio del viaje. */
  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  startDate: Date;

  /** Fecha de fin del viaje. */
  @ApiProperty({ example: '2026-06-10T00:00:00.000Z' })
  endDate: Date;

  /** Estado del viaje. */
  @ApiProperty({ enum: TripStatus, example: TripStatus.PLANNED })
  status: TripStatus;

  /** N\u00famero de miembros del viaje. */
  @ApiProperty({ example: 3 })
  memberCount: number;

  /** Nombre de la localidad asociada, si existe. */
  @ApiPropertyOptional({ example: 'Madrid' })
  localityName: string | null;
}
