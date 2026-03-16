import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@kotrip/data';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para el reinicio de contrasena por parte de un administrador.
 * A diferencia de `UpdatePasswordDto`, no requiere la contraseña anterior,
 * ya que la operación es ejecutada por un administrador autorizado.
 *
 * Las validaciones de seguridad de la contraseña son idénticas a las de
 * `UpdatePasswordDto` y `NewRegisterDto`.
 *
 * @see {@link UpdatePasswordDto}
 */
export class AdminResetPasswordDto {
  /**
   * La nueva contraseña debe cumplir las siguientes reglas:
   *  - Al menos una letra mayúscula
   *  - Al menos una letra minúscula
   *  - Al menos un número
   *  - Al menos un carácter especial (de los de la lista)
   *  - Entre MIN_PASSWORD_LENGTH y MAX_PASSWORD_LENGTH caracteres
   */
  @ApiProperty({
    description: 'Nueva contraseña para el usuario',
    example: 'NuevaPassword1234_',
    required: true,
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY',
    ),
  })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.PASSWORD_MIN_LENGTH',
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
  password: string;
}
