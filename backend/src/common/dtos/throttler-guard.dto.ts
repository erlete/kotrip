import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * DTO para la respuesta de error del ThrottlerGuard (rate limiting).
 *
 * Estructura el mensaje y codigo de estado que se envia al frontend
 * cuando se superan los limites de peticiones configurados.
 *
 * @see {@link https://docs.nestjs.com/security/rate-limiting | ThrottlerGuard}
 */
export class ThrotterGuardErrorDto {
  @ApiProperty({ example: 'ThrottlerException: Too Many Requests' })
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY',
    ),
  })
  message: string;

  @IsNumber()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'error.VALIDATION.IS_NOT_EMPTY',
    ),
  })
  @ApiProperty({ example: 429 })
  statusCode: number;
}
