import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para la verificación de email mediante código de 6 dígitos.
 *
 * Se utiliza en el endpoint público `POST /auth/verify-email` donde
 * el usuario introduce el código recibido por correo electrónico.
 *
 * @see UserEmailVerification Entidad de verificación.
 * @see AuthService.verifyEmail Método del servicio que procesa la verificación.
 */
export class VerifyEmailDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario que se está verificando.',
    example: 'correo@hosting.com',
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY',
    ),
  })
  @IsString()
  @IsEmail(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'error.VALIDATION.MAIL_INVALID',
      ),
    },
  )
  readonly email: string;

  @ApiProperty({
    description: 'Código de verificación de 6 dígitos enviado por email.',
    example: '123456',
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY',
    ),
  })
  @IsString()
  @Length(6, 6, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY',
    ),
  })
  readonly code: string;
}
