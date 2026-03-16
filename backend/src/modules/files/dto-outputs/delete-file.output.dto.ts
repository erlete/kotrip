import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para la eliminación de archivos.
 *
 * Representa el resultado de una operación de eliminación de archivo,
 * indicando si la operación fue exitosa y el identificador del archivo eliminado.
 */
export class DeleteFileOutputDto {
  /**
   * Identificador del archivo eliminado.
   */
  @ApiProperty({
    description: 'ID del archivo eliminado',
    example: '1',
    type: String,
  })
  id: string;

  /**
   * Estado de la operación de eliminación.
   *
   * @remarks
   * `true` si el archivo se eliminó correctamente,
   * `false` si ocurrió algún problema durante la eliminación.
   */
  @ApiProperty({
    description: 'Indica si la eliminación fue exitosa',
    example: true,
    type: Boolean,
  })
  status: boolean;
}
