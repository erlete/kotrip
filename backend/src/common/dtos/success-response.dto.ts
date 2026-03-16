import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para respuestas de éxito simples.
 *
 * Se utiliza en endpoints que no retornan datos específicos,
 * como operaciones de eliminación o actualizaciones que solo
 * necesitan confirmar que la operación fue exitosa.
 *
 * @example
 * ```typescript
 * @ApiResponse({ status: 200, type: SuccessResponseDto })
 * async delete(): Promise<SuccessResponseDto> {
 *   await this.service.delete(id);
 *   return { success: true };
 * }
 * ```
 */
export class SuccessResponseDto {
  /**
   * Indica si la operación fue exitosa.
   *
   * @remarks
   * Siempre será `true` cuando la respuesta se envía correctamente.
   * En caso de error, se lanzará una excepción en lugar de retornar este DTO.
   */
  @ApiProperty({
    description: 'Indica si la operación se completó exitosamente',
    example: true,
    type: Boolean,
  })
  success: boolean;
}
