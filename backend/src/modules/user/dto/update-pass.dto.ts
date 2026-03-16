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
 * ### UpdatePasswordDto
 *
 * DTO para controlar los datos de entrada al cambiar una contraseña. La nueva contraseña tiene diferentes
 * comprobciones de seguridad que deben coincider con las que se encuentran en el NewRegisterDto.
 *
 * @version     1.0.0a






 * @see         [User](../entities/user.entity.ts)
 * @see         [NewRegisterDto](../../auth/dto/new-register.dto.ts)
 */
export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'Old_Password_01',
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY',
    ),
  })
  @IsString()
  oldPassword: string;

  /**
   * La contraseña debe cumplir las siguientes reglas:
   *  - Al menos una letra mayúscula
   *  - Al menos una letra minúscula
   *  - Al menos un número
   *  - Al menos un carácter especial (de los de la lista)
   *  - Entre MIN_PASSWORD_LENGTH y MAX_PASSWORD_LENGTH caracteres (El límite de caracteres para hashear de Bcrypt es de 72Bytes)
   */
  @ApiProperty({ example: 'UnaPasswordMasFuerte1234_', required: true })
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
  newPassword: string;
}
