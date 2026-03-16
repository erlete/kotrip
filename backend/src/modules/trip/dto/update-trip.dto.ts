import { MAX_RATING, MIN_RATING, TripStatus } from '@kotrip/data';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { CreateTripDto } from './create-trip.dto';

/**
 * DTO para la actualizaci\u00f3n de un viaje existente.
 *
 * @remarks
 * Extiende `CreateTripDto` con `PartialType`, haciendo todos los campos opcionales.
 * Adem\u00e1s, a\u00f1ade campos adicionales para actualizaci\u00f3n: `rating` y `status`.
 */
export class UpdateTripDto extends PartialType(CreateTripDto) {
  /**
   * Puntuaci\u00f3n del viaje (escala 1-10).
   *
   * @remarks Opcional, solo aplicable a viajes finalizados.
   */
  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_INT' as any,
    ),
  })
  @Min(MIN_RATING, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.MIN' as any,
      { min: MIN_RATING },
    ),
  })
  @Max(MAX_RATING, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.MAX' as any,
      { max: MAX_RATING },
    ),
  })
  rating?: number;

  /**
   * Estado del viaje dentro de su ciclo de vida.
   */
  @ApiPropertyOptional({ enum: TripStatus, example: TripStatus.ACTIVE })
  @IsOptional()
  @IsEnum(TripStatus, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_ENUM' as any,
    ),
  })
  status?: TripStatus;
}
