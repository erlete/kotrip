import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para reordenar las paradas del itinerario de un viaje.
 *
 * @remarks
 * Recibe un array con todos los UUID de las paradas en el nuevo orden deseado.
 */
export class ReorderItineraryDto {
  /**
   * Array ordenado de UUIDs de las paradas del itinerario.
   *
   * @remarks Debe contener todos los UUIDs de las paradas del viaje, en el nuevo orden.
   */
  @ApiProperty({
    example: [
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    ],
    isArray: true,
    type: String,
  })
  @IsArray({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_ARRAY' as any,
    ),
  })
  @ArrayNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.ARRAY_NOT_EMPTY' as any,
    ),
  })
  @IsUUID('4', {
    each: true,
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_UUID' as any,
    ),
  })
  stopIds: string[];
}
