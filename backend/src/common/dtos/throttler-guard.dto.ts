import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * ### ThrotterGuardErrorDto
 *
 * DTO para controlar los datos de salida de los errores generados por el ThrottlerGuard.
 * Este DTO existe para facilitar a front la información recibida.
 *
 * @version     1.0.0a




 * @see         [ThrottlerGuard](https://docs.nestjs.com/security/rate-limiting#throttler-module)
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
