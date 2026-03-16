import { TripStatus } from '@kotrip/data';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de salida con informaci\u00f3n completa de la localidad asociada a un viaje.
 */
export class TripLocalityOutputDto {
  /** Identificador de la localidad. */
  @ApiProperty({ example: 1 })
  id: number;

  /** Nombre del municipio. */
  @ApiProperty({ example: 'Madrid' })
  name: string;

  /** Provincia a la que pertenece. */
  @ApiProperty({ example: 'Madrid' })
  province: string;

  /** Comunidad aut\u00f3noma a la que pertenece. */
  @ApiProperty({ example: 'Comunidad de Madrid' })
  autonomousCommunity: string;
}

/**
 * DTO de salida con el detalle completo de un viaje.
 *
 * @remarks
 * Incluye toda la informaci\u00f3n del viaje, localidad asociada y conteo de miembros.
 */
export class TripOutputDto {
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

  /** Puntuaci\u00f3n del viaje (1-10). */
  @ApiPropertyOptional({ example: 8 })
  rating: number | null;

  /** Presupuesto estimado en euros. */
  @ApiPropertyOptional({ example: 1500.0 })
  budget: number | null;

  /** Estado del viaje. */
  @ApiProperty({ enum: TripStatus, example: TripStatus.PLANNED })
  status: TripStatus;

  /** Localidad asociada al viaje. */
  @ApiPropertyOptional({ type: () => TripLocalityOutputDto })
  locality: TripLocalityOutputDto | null;

  /** N\u00famero de miembros del viaje. */
  @ApiProperty({ example: 3 })
  memberCount: number;

  /** Fecha de creaci\u00f3n del viaje. */
  @ApiProperty({ example: '2026-03-12T10:00:00.000Z' })
  createdAt: Date;

  /** Fecha de \u00faltima actualizaci\u00f3n del viaje. */
  @ApiProperty({ example: '2026-03-12T10:00:00.000Z' })
  updatedAt: Date;
}
