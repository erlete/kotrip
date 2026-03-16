import {
  MAX_TICKET_DESCRIPTION_LENGTH,
  MAX_TICKET_NAME_LENGTH,
  MAX_TICKET_URL_LENGTH,
} from '@kotrip/data';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para la creaci\u00f3n de un ticket asociado a una parada del itinerario.
 *
 * @remarks
 * Los tickets representan documentos, comprobantes o entradas vinculados
 * a una parada espec\u00edfica del viaje.
 */
export class CreateTicketDto {
  /**
   * Nombre del ticket.
   *
   * @remarks Obligatorio, m\u00e1ximo 200 caracteres.
   */
  @ApiProperty({
    example: 'Entrada Museo del Prado',
    maxLength: MAX_TICKET_NAME_LENGTH,
  })
  @IsString({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_STRING' as any,
    ),
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY' as any,
    ),
  })
  @MaxLength(MAX_TICKET_NAME_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.MAX_LENGTH' as any,
      { max: MAX_TICKET_NAME_LENGTH },
    ),
  })
  name: string;

  /**
   * Descripci\u00f3n del ticket.
   *
   * @remarks Opcional, m\u00e1ximo 1000 caracteres.
   */
  @ApiPropertyOptional({
    example: 'Entrada general para adultos',
    maxLength: MAX_TICKET_DESCRIPTION_LENGTH,
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_STRING' as any,
    ),
  })
  @MaxLength(MAX_TICKET_DESCRIPTION_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.MAX_LENGTH' as any,
      { max: MAX_TICKET_DESCRIPTION_LENGTH },
    ),
  })
  description?: string;

  /**
   * URL del objeto asociado al ticket (MinIO o URL externa).
   *
   * @remarks Opcional, m\u00e1ximo 2048 caracteres.
   */
  @ApiPropertyOptional({
    example: 'https://example.com/ticket.pdf',
    maxLength: MAX_TICKET_URL_LENGTH,
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_STRING' as any,
    ),
  })
  @MaxLength(MAX_TICKET_URL_LENGTH, {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.MAX_LENGTH' as any,
      { max: MAX_TICKET_URL_LENGTH },
    ),
  })
  objectUrl?: string;

  /**
   * UUID de la parada del itinerario a la que pertenece este ticket.
   */
  @ApiProperty({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
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
  tripItineraryId: string;

  /**
   * UUID del gasto asociado al ticket.
   *
   * @remarks Opcional, permite vincular el coste del ticket a un gasto.
   */
  @ApiPropertyOptional({ example: 'd4e5f6a7-b890-1234-defa-234567890123' })
  @IsOptional()
  @IsUUID('4', {
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_UUID' as any,
    ),
  })
  expenseId?: string;
}
