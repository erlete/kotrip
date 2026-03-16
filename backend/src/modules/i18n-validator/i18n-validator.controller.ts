import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { Role } from '@kotrip/data';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18nValidatorService } from './i18n-validator.service';

/**
 * ### I18nValidatorController
 *
 * Controlador REST que expone endpoints para validar traducciones i18n.
 *
 *
 * @version 1.0.0



 */
@Controller('i18n-validator')
@ApiTags('i18n - Validador i18n')
@ApiBearerAuth()
export class I18nValidatorController {
  constructor(private readonly i18nValidatorService: I18nValidatorService) {}

  @Get('missing-translations')
  @Auth(Role.ADMIN)
  async getMissingTranslations() {
    const missingTranslations =
      await this.i18nValidatorService.findMissingTranslations();

    return {
      data: {
        count: missingTranslations.length,
        missingTranslations: missingTranslations.map((mt) => ({
          example: `this.i18n.t('${mt.key}', { lang: activeUser.language || I18nContext.current().lang ||Language.ES })`,
          file: mt.file,
          key: mt.key,
          line: mt.line,
          missingLanguages: mt.missingLanguages,
        })),
      },
      message: 'Traducciones i18n faltantes encontradas',
    };
  }

  /**
   * Endpoint para obtener estadísticas generales sobre el estado de las traducciones.
   *
   */
  @Get('statistics')
  @Auth(Role.ADMIN)
  async getI18nStatistics() {
    const statistics = await this.i18nValidatorService.getI18nStatistics();

    return {
      data: statistics,
      message: 'Estadísticas de i18n obtenidas exitosamente',
    };
  }

  /**
   * Endpoint para obtener únicamente las claves que están completamente sin traducir.
   *
   */
  @Get('completely-missing')
  @Auth(Role.ADMIN)
  async getCompletelyMissingTranslations() {
    const missingTranslations =
      await this.i18nValidatorService.findMissingTranslations();
    const statistics = await this.i18nValidatorService.getI18nStatistics();

    const completelyMissing = missingTranslations.filter(
      (mt) => mt.missingLanguages.length === statistics.languagesFound.length,
    );

    return {
      data: {
        completelyMissingTranslations: completelyMissing.map((mt) => ({
          example: `this.i18n.t('${mt.key}', { lang: activeUser.language || I18nContext.current().lang ||Language.ES })`,
          file: mt.file,
          key: mt.key,
          line: mt.line,
          suggestedJsonStructure: this.generateJsonStructure(mt.key),
        })),
        count: completelyMissing.length,
        languagesChecked: statistics.languagesFound,
      },
      message: 'Traducciones i18n completamente faltantes encontradas',
    };
  }

  /**
   * Método auxiliar que genera una estructura JSON anidada para una clave de traducción.
   * Convierte claves como 'error.USER.NOT_FOUND' en estructura de objeto anidado.
   *
   * Ejemplo de transformación:
   * Entrada: 'error.USER.NOT_FOUND'
   * Salida: {
   *   error: {
   *     USER: {
   *       NOT_FOUND: "Translation for error.USER.NOT_FOUND"
   *     }
   *   }
   * }
   *
   * @param key Clave de traducción con notación de puntos
   * @returns Objeto JSON con estructura anidada correspondiente
   */
  private generateJsonStructure(key: string): any {
    const keys = key.split('.'); // Dividir 'error.USER.NOT_FOUND' -> ['error', 'USER', 'NOT_FOUND']
    const result: any = {};
    let current = result;

    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        current[keys[i]] = `Translation for ${key}`;
      } else {
        current[keys[i]] = {};
        current = current[keys[i]];
      }
    }

    return result;
  }
}
