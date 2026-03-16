import {
  MAX_TRIP_DESCRIPTION_LENGTH,
  MAX_TRIP_NAME_LENGTH,
  MIN_TRIP_NAME_LENGTH,
} from '@kotrip/data';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para la creaci\u00f3n de un viaje nuevo.
 *
 * @remarks
 * Contiene los campos requeridos y opcionales para dar de alta un viaje
 * en el sistema. Las validaciones se integran con el sistema de
 * internacionalizaci\u00f3n para devolver mensajes localizados.
 */
export class CreateTripDto {
  /**
   * Nombre del viaje.
   *
   * @remarks Obligatorio, entre 3 y 100 caracteres.
   */
  @ApiProperty({
    example: 'Viaje a Madrid',
    maxLength: MAX_TRIP_NAME_LENGTH,
    minLength: MIN_TRIP_NAME_LENGTH,
  })
  @IsString({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_STRING' as any,
    ),
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY' as any,
    ),
  })
  @MinLength(MIN_TRIP_NAME_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.MIN_LENGTH' as any,
      { min: MIN_TRIP_NAME_LENGTH },
    ),
  })
  @MaxLength(MAX_TRIP_NAME_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.MAX_LENGTH' as any,
      { max: MAX_TRIP_NAME_LENGTH },
    ),
  })
  name: string;

  /**
   * Descripci\u00f3n del viaje.
   *
   * @remarks Opcional, m\u00e1ximo 2000 caracteres.
   */
  @ApiPropertyOptional({
    example: 'Un viaje cultural por la capital de Espa\u00f1a',
    maxLength: MAX_TRIP_DESCRIPTION_LENGTH,
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_STRING' as any,
    ),
  })
  @MaxLength(MAX_TRIP_DESCRIPTION_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.MAX_LENGTH' as any,
      { max: MAX_TRIP_DESCRIPTION_LENGTH },
    ),
  })
  description?: string;

  /**
   * Fecha de inicio del viaje en formato ISO 8601.
   */
  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
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
  startDate: string;

  /**
   * Fecha de fin del viaje en formato ISO 8601.
   */
  @ApiProperty({ example: '2026-06-10T00:00:00.000Z' })
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
  endDate: string;

  /**
   * Presupuesto estimado del viaje en euros.
   *
   * @remarks Opcional, debe ser un n\u00famero positivo.
   */
  @ApiPropertyOptional({ example: 1500.0 })
  @IsOptional()
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
  budget?: number;

  /**
   * Identificador de la localidad asociada al viaje.
   *
   * @remarks Opcional, referencia a un municipio de la tabla de localidades.
   */
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_INT' as any,
    ),
  })
  localityId?: number;
}
