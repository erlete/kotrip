import { TravelMethod } from '@kotrip/data';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de salida con la informaci\u00f3n de una parada del itinerario.
 *
 * @remarks
 * Incluye coordenadas geogr\u00e1ficas, informaci\u00f3n de desplazamiento
 * y la posici\u00f3n en el itinerario.
 */
export class ItineraryOutputDto {
  /** Identificador \u00fanico de la parada (UUID). */
  @ApiProperty({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  id: string;

  /** Nombre de la parada o destino. */
  @ApiProperty({ example: 'Museo del Prado' })
  name: string;

  /** Latitud de la coordenada geogr\u00e1fica. */
  @ApiProperty({ example: 40.4138 })
  latitude: number;

  /** Longitud de la coordenada geogr\u00e1fica. */
  @ApiProperty({ example: -3.6921 })
  longitude: number;

  /** Tiempo estimado de viaje desde la parada anterior en segundos. */
  @ApiPropertyOptional({ example: 1800 })
  travelTime: number | null;

  /** M\u00e9todo de desplazamiento desde la parada anterior. */
  @ApiPropertyOptional({ enum: TravelMethod, example: TravelMethod.CAR })
  travelMethod: TravelMethod | null;

  /** Hora de llegada prevista a la parada. */
  @ApiPropertyOptional({ example: '2026-06-01T10:00:00.000Z' })
  arriveAt: Date | null;

  /** Posici\u00f3n en el itinerario (orden). */
  @ApiProperty({ example: 1 })
  order: number;

  /** UUID de la siguiente parada, si existe. */
  @ApiPropertyOptional({ example: 'd4e5f6a7-b890-1234-defa-234567890123' })
  nextDestinationId: string | null;

  /** UUID de la parada anterior, si existe. */
  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  previousDestinationId: string | null;

  /** Fecha de creaci\u00f3n de la parada. */
  @ApiProperty({ example: '2026-03-12T10:00:00.000Z' })
  createdAt: Date;
}
