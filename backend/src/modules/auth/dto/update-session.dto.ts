import {
  Language,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  Role,
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
 * DTO para actualizar parcialmente la sesion o perfil del usuario.
 *
 * Permite modificar campos individuales como idioma, nombre, email, avatar,
 * contrasena o rol sin necesidad de enviar todos los datos.
 *
 * Nota: Si se cambia la contrasena, se debe proporcionar la contrasena anterior
 * en el campo `oldPassword` para validar la operacion.
 *
 * @see User Entidad del usuario.
 * @see UpdatePasswordDto DTO para cambio de contrasena desde el modulo de usuario.
 */
export class UpdateSessionDto {
  @ApiPropertyOptional({
    description: 'Nombre del archivo de avatar/foto de perfil',
    example: 'avatar-123456789.jpg',
  })
  @IsOptional()
  @IsString()
  avatarFileName?: string;

  @ApiPropertyOptional({
    description: 'Idioma preferido del usuario',
    enum: Language,
    enumName: 'Language',
    example: Language.ES,
  })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiPropertyOptional({
    description: 'Correo electrónico del usuario',
    example: 'correo@hosting.com',
  })
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

  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Carlos',
  })
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

  @ApiPropertyOptional({
    description: 'Apellidos del usuario',
    example: 'García López',
  })
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
    description:
      'Contraseña actual (requerida si se desea cambiar la contraseña)',
    example: 'PasswordActual123_',
  })
  @IsOptional()
  @IsString()
  oldPassword?: string;

  @ApiPropertyOptional({
    description: 'Nueva contraseña del usuario',
    example: 'NuevaPassword123_',
  })
  @IsOptional()
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
  password?: string;

  /**
   * Rol del usuario en el sistema. Solo puede ser modificado por ADMIN.
   * El servicio debe validar los permisos antes de aplicar cambios de rol.
   */
  @ApiPropertyOptional({
    description: 'Rol del usuario en el sistema',
    enum: Role,
    enumName: 'Role',
    example: Role.USER,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  /**
   * Indica si el usuario tiene habilitada la autenticación de dos factores (2FA).
   */
  @ApiPropertyOptional({
    description: 'Indica si habilitar o deshabilitar la autenticación 2FA',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;
}
