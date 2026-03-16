import {
  Language,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  Role,
} from '@kotrip/data';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * ### CreateUserDto
 *
 * DTO para controlar los datos de entrada al crear un usuario nuevo. La información aquí reglada está
 * relacionada directamente con la base de datos (entidad User), si se cambia algo en la entidad, se
 * debe reflejar aquí para el correcto funcionamiento.
 *
 * IMPORTANTE: Normalmente se crean los usuarios mediante AUTH, no mediante USER. Este DTO será usado solo
 * como CRUD básico para, por ejemplo, el seeder. Permite menos comproaciones de seguridad para la contraseña
 * o el nombre de usuario.
 *
 * @version     1.0.0a







 * @see         [Role](src/common/enums/role.enum)
 * @see         [User](../entities/user.entity.ts)
 * @see         [APPConstants](src/common/constants/app-constants)
 */
export class CreateUserDto {
  @IsEmail(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'error.VALIDATION.MAIL_INVALID',
      ),
    },
  )
  mail: string;

  /**
   * El nombre debe cumplir las siguientes reglas:
   *  - Primera letra en mayúscula
   *  - Entre MIN_NAME_LENGTH y MAX_NAME_LENGTH caracteres
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
  firstName: string;

  /**
   * Los apellidos deben cumplir las siguientes reglas:
   *  - Primera letra en mayúscula
   *  - Entre MIN_NAME_LENGTH y MAX_NAME_LENGTH caracteres
   *  - Permite tildes
   *  - Permite espacios (para apellidos compuestos)
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
  lastName: string;

  /**
   * La contraseña debe cumplir las siguientes reglas:
   *  - Al menos una letra mayúscula
   *  - Al menos una letra minúscula
   *  - Al menos un número
   *  - Al menos un carácter especial (de los de la lista)
   *  - Entre MIN_PASSWORD_LENGTH y MAX_PASSWORD_LENGTH caracteres (El límite de caracteres para hashear de Bcrypt es de 72Bytes)
   */
  @ApiPropertyOptional({
    enum: Language,
    enumName: 'Language',
    example: Language.ES,
    required: false,
  })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

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
  password: string;

  @ApiPropertyOptional({
    enum: Role,
    enumName: 'Role',
    example: Role.USER,
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
