import {
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '@kotrip/data';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { MatchPasswords } from '../decorators/password-matches.decorator';

/**
 * ### NewRegisterDto
 *
 * DTO para controlar los datos de entrada de un nuevo registro. Todos los datos aquí reglados son “heredados”
 * de la entidad de verificación y estos, a su vez, son “heredados” de la entidad de usuario. Afectaran
 * directamente a la base de datos. Si se cambia cualquier dato, añade o borra uno, debe verse reflejado en
 * este DTO.
 *
 * @version     1.0.0a






 * @see         [User](../../user/entities/user.entity.ts)
 * @see         [Verification](../entities/verification.entity.ts)
 */
export class NewRegisterDto {
  @ApiProperty({ example: 'correo@hosting.com' })
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
  readonly mail: string;

  /**
   * Los nombres deben cumplir las siguientes reglas:
   *  - Primera letra en mayúscula
   *  - Entre MIN_NAME_LENGTH y MAX_NAME_LENGTH letras (sumando primera mayúscula y resto)
   *  - Permite tildes
   *  - Permite espacios (para nombres compuestos)
   */
  @ApiProperty({ example: 'Carlos', required: true })
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY',
    ),
  })
  @MinLength(MIN_NAME_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.NAME_MIN_LENGTH',
      {
        min: MIN_NAME_LENGTH,
      },
    ),
  })
  @MaxLength(MAX_NAME_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.NAME_MAX_LENGTH',
      {
        max: MAX_NAME_LENGTH,
      },
    ),
  })
  @Matches(/^[A-ZÁÉÍÓÚÜÑ]/, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.NAME_STARTS_UPPERCASE',
    ),
  })
  @Matches(/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]*$/, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.NAME_FORMAT',
    ),
  })
  readonly firstName: string;

  /**
   * Los apellidos deben cumplir las mismas reglas que el nombre.
   */
  @ApiProperty({ example: 'García López', required: true })
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY',
    ),
  })
  @MinLength(MIN_NAME_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.NAME_MIN_LENGTH',
      {
        min: MIN_NAME_LENGTH,
      },
    ),
  })
  @MaxLength(MAX_NAME_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.NAME_MAX_LENGTH',
      {
        max: MAX_NAME_LENGTH,
      },
    ),
  })
  @Matches(/^[A-ZÁÉÍÓÚÜÑ]/, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.NAME_STARTS_UPPERCASE',
    ),
  })
  @Matches(/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]*$/, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.NAME_FORMAT',
    ),
  })
  readonly lastName: string;

  /**
   * La contraseña debe cumplir las siguientes reglas:
   *  - No debe contener espacios
   *  - Al menos una letra mayúscula
   *  - Al menos una letra minúscula
   *  - Al menos un número
   *  - Al menos un carácter especial (de los de la lista)
   *  - Entre MIN_PASSWORD_LENGTH y MAX_PASSWORD_LENGTH caracteres (El límite de caracteres para hashear de Bcrypt es de 72Bytes)
   *  - Se permiten letras con tildes y ñ
   */
  @ApiProperty({
    example: 'example@mail.com',
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
  @Matches(/.*[!@#$%^&*()_+{}[\]:;<>,.?\/~_\+\-=|].*/, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.PASSWORD_ONE_SPECIAL_CHAR',
    ),
  })
  @Transform(({ value }) => value.trim())
  readonly password: string;

  /**
   *  Se utiliza el decorador personalizado MatchPasswords para comprobar que la contraseña y la contraseña repetida
   */
  @ApiProperty({
    example: 'example@mail.com',
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY',
    ),
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  @MatchPasswords('password', {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.PASSWORDS_NOT_MATCHING',
    ),
  })
  readonly repeatPassword: string;
}
