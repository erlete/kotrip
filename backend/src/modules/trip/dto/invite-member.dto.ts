import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para enviar una invitaci\u00f3n a un usuario para unirse a un viaje.
 */
export class InviteMemberDto {
  /**
   * UUID del usuario al que se env\u00eda la invitaci\u00f3n.
   */
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
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
  receiverId: string;
}
