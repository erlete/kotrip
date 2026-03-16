import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para responder a una invitaci\u00f3n de viaje (aceptar o rechazar).
 */
export class RespondInvitationDto {
  /**
   * Indica si se acepta (`true`) o rechaza (`false`) la invitaci\u00f3n.
   */
  @ApiProperty({ example: true })
  @IsBoolean({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_BOOLEAN' as any,
    ),
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY' as any,
    ),
  })
  accept: boolean;
}
