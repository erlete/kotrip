import { MAX_DECORATIVE_ROLE_LENGTH } from '@kotrip/data';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para a\u00f1adir un nuevo miembro a un viaje.
 *
 * @remarks
 * Permite especificar el usuario a a\u00f1adir, sus permisos granulares
 * y un rol decorativo opcional.
 */
export class CreateTripMemberDto {
  /**
   * UUID del usuario a a\u00f1adir como miembro.
   */
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
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
  userId: string;

  /** Permiso para gestionar gastos. */
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_BOOLEAN' as any,
    ),
  })
  canEditBudget?: boolean;

  /** Permiso para modificar datos generales del viaje. */
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_BOOLEAN' as any,
    ),
  })
  canEditTrip?: boolean;

  /** Permiso para modificar detalles del itinerario. */
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_BOOLEAN' as any,
    ),
  })
  canEditDetails?: boolean;

  /** Permiso para a\u00f1adir o eliminar miembros. */
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_BOOLEAN' as any,
    ),
  })
  canModifyMembers?: boolean;

  /** Permiso para enviar invitaciones. */
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_BOOLEAN' as any,
    ),
  })
  canInviteMembers?: boolean;

  /** Permiso para gestionar tickets. */
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_BOOLEAN' as any,
    ),
  })
  canManageTickets?: boolean;

  /**
   * Rol decorativo del miembro (texto libre).
   *
   * @remarks M\u00e1ximo 50 caracteres. Ej: "conductor", "fot\u00f3grafo".
   */
  @ApiPropertyOptional({ example: 'Conductor' })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_STRING' as any,
    ),
  })
  @MaxLength(MAX_DECORATIVE_ROLE_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.MAX_LENGTH' as any,
      { max: MAX_DECORATIVE_ROLE_LENGTH },
    ),
  })
  decorativeRole?: string;
}
