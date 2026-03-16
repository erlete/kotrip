import { MAX_ITINERARY_NAME_LENGTH, TravelMethod } from '@kotrip/data';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para a\u00f1adir una nueva parada al itinerario de un viaje.
 *
 * @remarks
 * Permite especificar la ubicaci\u00f3n, informaci\u00f3n de desplazamiento
 * y la posici\u00f3n relativa en el itinerario.
 */
export class CreateItineraryStopDto {
  /**
   * Nombre de la parada o destino.
   *
   * @remarks Obligatorio, m\u00e1ximo 200 caracteres.
   */
  @ApiProperty({
    example: 'Museo del Prado',
    maxLength: MAX_ITINERARY_NAME_LENGTH,
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
  @MaxLength(MAX_ITINERARY_NAME_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.MAX_LENGTH' as any,
      { max: MAX_ITINERARY_NAME_LENGTH },
    ),
  })
  name: string;

  /**
   * Latitud de la coordenada geogr\u00e1fica.
   */
  @ApiProperty({ example: 40.4138 })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'error.VALIDATION.IS_NUMBER' as any,
      ),
    },
  )
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY' as any,
    ),
  })
  latitude: number;

  /**
   * Longitud de la coordenada geogr\u00e1fica.
   */
  @ApiProperty({ example: -3.6921 })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'error.VALIDATION.IS_NUMBER' as any,
      ),
    },
  )
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY' as any,
    ),
  })
  longitude: number;

  /**
   * Tiempo estimado de viaje desde la parada anterior en segundos.
   */
  @ApiPropertyOptional({ example: 1800 })
  @IsOptional()
  @IsInt({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_INT' as any,
    ),
  })
  travelTime?: number;

  /**
   * M\u00e9todo de desplazamiento para llegar a esta parada.
   */
  @ApiPropertyOptional({ enum: TravelMethod, example: TravelMethod.CAR })
  @IsOptional()
  @IsEnum(TravelMethod, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_ENUM' as any,
    ),
  })
  travelMethod?: TravelMethod;

  /**
   * Hora de llegada prevista a la parada (ISO 8601).
   */
  @ApiPropertyOptional({ example: '2026-06-01T10:00:00.000Z' })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'error.VALIDATION.IS_DATE_STRING' as any,
      ),
    },
  )
  arriveAt?: string;

  /**
   * UUID de la parada tras la cual insertar esta nueva parada.
   *
   * @remarks Si no se proporciona, la parada se a\u00f1ade al final del itinerario.
   */
  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  @IsOptional()
  @IsUUID('4', {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_UUID' as any,
    ),
  })
  afterStopId?: string;
}
