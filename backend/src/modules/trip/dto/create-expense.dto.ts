import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para la creaci\u00f3n de un gasto dentro de un viaje.
 *
 * @remarks
 * El pagador (`payer`) es siempre el usuario autenticado que realiza la petici\u00f3n.
 * Los `payeeIds` definen entre qui\u00e9nes se reparte el gasto.
 */
export class CreateExpenseDto {
  /**
   * Identificador del miembro que realiz\u00f3 el pago.
   */
  @ApiProperty({
    description: 'Identificador del miembro que realiz\u00f3 el pago.',
  })
  @IsUUID('4', {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_UUID' as any,
    ),
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY' as any,
    ),
  })
  payerId: string;

  /**
   * Fecha y hora en que se realiz\u00f3 el pago (ISO 8601).
   */
  @ApiProperty({ example: '2026-06-05T14:30:00.000Z' })
  @IsDateString(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'error.VALIDATION.IS_DATE_STRING' as any,
      ),
    },
  )
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY' as any,
    ),
  })
  paidAt: string;

  /**
   * Importe del gasto en euros.
   *
   * @remarks Debe ser un n\u00famero positivo.
   */
  @ApiProperty({ example: 45.5 })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'error.VALIDATION.IS_NUMBER' as any,
      ),
    },
  )
  @IsPositive({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_POSITIVE' as any,
    ),
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY' as any,
    ),
  })
  quantity: number;

  /**
   * UUIDs de los usuarios entre los que se reparte el gasto.
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
  payeeIds: string[];

  /**
   * UUID de la parada del itinerario asociada al gasto.
   *
   * @remarks Opcional, permite vincular el gasto a una parada espec\u00edfica.
   */
  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  @IsOptional()
  @IsUUID('4', {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_UUID' as any,
    ),
  })
  tripItineraryId?: string;
}
