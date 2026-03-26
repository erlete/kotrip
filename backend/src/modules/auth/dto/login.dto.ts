import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@kotrip/data';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para los datos de entrada de inicio de sesion.
 *
 * Contiene el email y la contrasena necesarios para autenticarse en la plataforma.
 */
export class LoginDto {
  /**
   * El correo electrónico del usuario para iniciar sesión
   */
  @ApiProperty({
    description: 'El correo electrónico del usuario para iniciar sesión',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'error.VALIDATION.MAIL_INVALID',
      ),
    },
  )
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  readonly email: string;

  /**
   * La contraseña debe cumplir las siguientes reglas:
   *  - No debe contener espacios
   *  - Al menos una letra mayúscula
   *  - Al menos una letra minúscula
   *  - Al menos un número
   *  - Al menos un carácter especial (de los de la lista)
   *  - Entre USER_PASSWORD_MIN_LENGTH y USER_PASSWORD_MAX_LENGTH caracteres (El límite de caracteres para hashear de Bcrypt es de 72Bytes)
   *  - Se permiten letras con tildes y ñ
   */
  @ApiProperty({
    example: 'example@mail.com',
  })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.NAME_MIN_LENGTH',
      {
        min: MIN_PASSWORD_LENGTH,
      },
    ),
  })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.PASSWORD_MAX_LENGTH',
      {
        max: MAX_PASSWORD_LENGTH,
      },
    ),
  })
  @Matches(/^\S*$/, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.PASSWORD_NO_SPACES',
    ),
  })
  @Matches(/.*[a-záéíóúüñ].*/, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.PASSWORD_ONE_LOWERCASE',
    ),
  })
  @Matches(/.*[A-ZÁÉÍÓÚÜÑ].*/, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.PASSWORD_ONE_UPPERCASE',
    ),
  })
  @Matches(/.*[0-9].*/, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.PASSWORD_ONE_NUMBER',
    ),
  })
  @Matches(/.*[!@#$%^&*()_+{}[\]:;<>,.?/~_+\-=|].*/, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.PASSWORD_ONE_SPECIAL_CHAR',
    ),
  })
  @Transform(({ value }: { value: string }) => value.trim())
  readonly password: string;
}
