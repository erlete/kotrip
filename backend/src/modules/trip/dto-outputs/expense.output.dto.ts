import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de salida con informaci\u00f3n b\u00e1sica de un usuario en el contexto de gastos.
 */
export class ExpenseUserOutputDto {
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
 * DTO de salida con la informaci\u00f3n completa de un gasto del viaje.
 *
 * @remarks
 * Incluye los datos del gasto, el pagador y los beneficiarios.
 */
export class ExpenseOutputDto {
  /** Identificador \u00fanico del gasto (UUID). */
  @ApiProperty({ example: 'd4e5f6a7-b890-1234-defa-234567890123' })
  id: string;

  /** Fecha y hora del pago. */
  @ApiProperty({ example: '2026-06-05T14:30:00.000Z' })
  paidAt: Date;

  /** Importe del gasto en euros. */
  @ApiProperty({ example: 45.5 })
  quantity: number;

  /** Usuario que realiz\u00f3 el pago. */
  @ApiProperty({ type: () => ExpenseUserOutputDto })
  payer: ExpenseUserOutputDto;

  /** Usuarios entre los que se reparte el gasto. */
  @ApiProperty({ isArray: true, type: () => ExpenseUserOutputDto })
  payees: ExpenseUserOutputDto[];

  /** UUID de la parada del itinerario asociada, si existe. */
  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  tripItineraryId: string | null;

  /** Fecha de creaci\u00f3n del gasto. */
  @ApiProperty({ example: '2026-03-12T10:00:00.000Z' })
  createdAt: Date;
}
