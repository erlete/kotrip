import {
  Language,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  Role,
  UserStatus,
} from '@kotrip/data';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para la actualizacion de informacion de un usuario por parte del administrador.
 *
 * Permite cambiar todos los campos excepto la contrasena (controlada por UpdatePasswordDto).
 * Las validaciones de formato coinciden con las del registro.





 * @see         [User](../entities/user.entity.ts)
 * @see         [NewRegisterDto](../../auth/dto/new-register.dto.ts)
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'correo1@hosting.com' })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'error.VALIDATION.MAIL_INVALID',
      ),
    },
  )
  @IsOptional()
  mail?: string;

  /**
   * Los nombres deben cumplir las siguientes reglas:
   *  - Primera letra en mayúscula
   *  - Entre MIN_NAME_LENGTH y MAX_NAME_LENGTH letras (sumando primera mayúscula y resto)
   *  - Permite tildes
   *  - Permite espacios (para nombres compuestos)
   */
  @ApiPropertyOptional({
    enum: Language,
    enumName: 'Language',
    example: Language.ES,
  })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiPropertyOptional({ example: 'Carlos' })
  @IsOptional()
  @IsString()
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
  firstName?: string;

  @ApiPropertyOptional({ example: 'García López' })
  @IsOptional()
  @IsString()
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
  lastName?: string;

  @ApiPropertyOptional({
    enum: Role,
    enumName: 'Role',
    example: Role.ADMIN,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({
    description: 'Indica si habilitar o deshabilitar la autenticación 2FA.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  twoFactorCode?: boolean;

  @ApiPropertyOptional({
    description:
      'Estado del usuario en la plataforma. Solo modificable por administradores.',
    enum: UserStatus,
    enumName: 'UserStatus',
    example: UserStatus.APPROVED,
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
