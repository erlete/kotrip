import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO que contiene un correo electronico para identificar al usuario a eliminar.

 * @see         [User](../entities/user.entity.ts)
 */
export class MailDto {
  @ApiProperty({ example: 'correo@hosting.com' })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'error.VALIDATION.MAIL_INVALID',
      ),
    },
  )
  mail: string;
}
