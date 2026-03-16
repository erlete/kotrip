import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de salida con la informaci\u00f3n de un ticket del itinerario.
 *
 * @remarks
 * Incluye los datos del ticket, la referencia a la parada
 * del itinerario y al gasto asociado (si existe).
 */
export class TicketOutputDto {
  /** Identificador \u00fanico del ticket (UUID). */
  @ApiProperty({ example: 'e5f6a7b8-9012-3456-efab-345678901234' })
  id: string;

  /** Nombre del ticket. */
  @ApiProperty({ example: 'Entrada Museo del Prado' })
  name: string;

  /** Descripci\u00f3n del ticket. */
  @ApiPropertyOptional({ example: 'Entrada general para adultos' })
  description: string | null;

  /** URL del objeto asociado al ticket. */
  @ApiPropertyOptional({ example: 'https://example.com/ticket.pdf' })
  objectUrl: string | null;

  /** UUID de la parada del itinerario asociada, o null si fue eliminada. */
  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  tripItineraryId: string | null;

  /** UUID del gasto asociado, si existe. */
  @ApiPropertyOptional({ example: 'd4e5f6a7-b890-1234-defa-234567890123' })
  expenseId: string | null;

  /** Fecha de creaci\u00f3n del ticket. */
  @ApiProperty({ example: '2026-03-12T10:00:00.000Z' })
  createdAt: Date;
}
