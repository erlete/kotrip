import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para la información de un bucket.
 *
 * Representa un bucket disponible en el sistema de almacenamiento
 * de archivos.
 */
export class BucketInfoDto {
  /**
   * Identificador numérico del bucket.
   */
  @ApiProperty({
    description: 'ID numérico del bucket',
    example: 1,
    type: Number,
  })
  id: number;

  /**
   * Nombre del bucket.
   */
  @ApiProperty({
    description: 'Nombre del bucket',
    example: 'public',
    type: String,
  })
  name: string;
}
