import * as fs from 'node:fs';
import * as path from 'node:path';
import { Injectable } from '@nestjs/common';
import { glob } from 'glob';

/**
 * Servicio de validacion de traducciones i18n.
 *
 * Escanea los archivos TypeScript del proyecto buscando llamadas a `this.i18n.t()`
 * y verifica si existen las traducciones correspondientes en los archivos JSON.
 *
 * Funcionalidades principales:
 * - Extraer claves de traduccion usadas en el codigo.
 * - Cargar traducciones disponibles desde archivos JSON.
 * - Comparar claves usadas vs disponibles para encontrar faltantes.
 * - Generar estadisticas de cobertura de traducciones.
 */
@Injectable()
export class I18nValidatorService {
  // Ruta base del código fuente donde buscar archivos TypeScript
  private readonly srcPath = path.join(process.cwd(), 'src');
  // Ruta donde se encuentran los archivos de traducción JSON
  private readonly i18nPath = path.join(process.cwd(), 'src/i18n');

  /**
   * Método principal que encuentra todas las traducciones faltantes.
   * Combina la extracción de claves usadas con la carga de traducciones disponibles
   * para identificar qué traducciones faltan en qué idiomas.
   *
   */
  async findMissingTranslations(): Promise<MissingTranslation[]> {
    const usedKeys = await this.extractI18nKeys();

    const availableTranslations = await this.loadAvailableTranslations();

    const missingTranslations: MissingTranslation[] = [];

    for (const usedKey of usedKeys) {
      const missingLanguages: string[] = [];

      for (const [language, translations] of Object.entries(
        availableTranslations,
      )) {
        if (!this.hasNestedKey(translations, usedKey.key)) {
          missingLanguages.push(language);
        }
      }

      if (missingLanguages.length > 0) {
        missingTranslations.push({
          file: usedKey.file,
          key: usedKey.key,
          line: usedKey.line,
          missingLanguages,
        });
      }
    }

    return missingTranslations;
  }

  /**
   * Extrae todas las claves de traducción i18n utilizadas en archivos TypeScript.
   * Busca patrones como: this.i18n.t('clave.de.traduccion', {...})
   *
   * Proceso:
   * 1. Busca todos los archivos .ts en src/ (excluyendo .d.ts y carpetas irrelevantes)
   * 2. Lee cada archivo línea por línea
   * 3. Usa regex para encontrar llamadas a this.i18n.t()
   * 4. Extrae la clave de traducción de cada llamada
   *
   */
  private async extractI18nKeys(): Promise<
    Array<{ file: string; key: string; line: number }>
  > {
    // Buscar archivos TypeScript recursivamente, excluyendo archivos de definición y carpetas build
    const tsFiles = await glob('**/*.ts', {
      cwd: this.srcPath,
      ignore: ['**/*.d.ts', '**/node_modules/**', '**/dist/**'],
    });

    const keys: Array<{ file: string; key: string; line: number }> = [];

    // Procesar cada archivo TypeScript encontrado
    for (const file of tsFiles) {
      const filePath = path.join(this.srcPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Expresión regular para capturar llamadas a this.i18n.t() con comillas simples, dobles o backticks
      // Captura el grupo entre comillas que contiene la clave de traducción
      const i18nRegex = /this\.i18n\.t\(\s*['"`]([^'"`]+)['"`]/g;

      // Examinar cada línea del archivo en busca de patrones i18n
      lines.forEach((line, index) => {
        let match;
        while ((match = i18nRegex.exec(line)) !== null) {
          keys.push({
            file: file,
            key: match[1],
            line: index + 1,
          });
        }
      });
    }

    return keys;
  }

  /**
   * Carga y parsea todos los archivos de traducción JSON disponibles.
   * Soporta múltiples estructuras de organización de archivos i18n:
   *
   * Estructura 1: Archivos directos en i18n/
   * - src/i18n/en.json
   * - src/i18n/es.json
   *
   * Estructura 2: Carpetas por idioma con archivos de namespace
   * - src/i18n/en/translation.json (archivo principal)
   * - src/i18n/en/validation.json (namespace específico)
   * - src/i18n/es/translation.json
   * - src/i18n/es/validation.json
   *
   */
  private async loadAvailableTranslations(): Promise<Record<string, any>> {
    const translations: Record<string, any> = {};

    try {
      const languageFiles = ['en.json', 'es.json'];

      for (const langFile of languageFiles) {
        const filePath = path.join(this.i18nPath, langFile);
        if (fs.existsSync(filePath)) {
          const language = path.basename(langFile, '.json');
          const content = fs.readFileSync(filePath, 'utf-8');
          translations[language] = JSON.parse(content);
        }
      }

      //  verificar estructura de carpetas por idioma
      if (fs.existsSync(this.i18nPath)) {
        const entries = fs.readdirSync(this.i18nPath, { withFileTypes: true });

        // Iterar sobre cada entrada en el directorio i18n
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const langDir = path.join(this.i18nPath, entry.name);
            const files = fs
              .readdirSync(langDir)
              .filter((f) => f.endsWith('.json'));

            if (files.length > 0) {
              translations[entry.name] = {};

              // Procesar cada archivo JSON en la carpeta del idioma
              for (const file of files) {
                const filePath = path.join(langDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const namespace = path.basename(file, '.json');

                if (namespace === 'translation') {
                  Object.assign(translations[entry.name], JSON.parse(content));
                } else {
                  translations[entry.name][namespace] = JSON.parse(content);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error cargando traducciones:', error);
    }

    return translations;
  }

  /**
   * Verifica si una clave anidada existe en un objeto de traducciones.
   * Maneja claves como 'error.USER.NOT_FOUND' navegando por la estructura anidada.
   *
   * Ejemplo:
   * - Objeto: { error: { USER: { NOT_FOUND: "Usuario no encontrado" } } }
   * - Clave: "error.USER.NOT_FOUND"
   * - Resultado: true
   *
   * @param obj Objeto de traducciones donde buscar
   * @param key Clave con puntos para navegar (ej: 'error.USER.NOT_FOUND')
   * @returns true si la clave existe y tiene un valor, false en caso contrario
   */
  private hasNestedKey(obj: any, key: string): boolean {
    const keys = key.split('.'); // Dividir por puntos: ['error', 'USER', 'NOT_FOUND']
    let current = obj;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return false;
      }
    }

    return current !== undefined;
  }

  /**
   * Genera estadísticas completas sobre el uso de traducciones i18n en el proyecto.
   * Proporciona métricas útiles para evaluar la cobertura de internacionalización.
   *
   * Métricas incluidas:
   * - Número total de claves únicas utilizadas en el código
   * - Número de traducciones faltantes encontradas
   * - Lista de idiomas disponibles en los archivos JSON
   * - Desglose de traducciones faltantes por idioma específico
   *
   */
  async getI18nStatistics(): Promise<{
    languagesFound: string[];
    missingByLanguage: Record<string, number>;
    missingTranslations: number;
    totalKeys: number;
  }> {
    const missingTranslations = await this.findMissingTranslations();
    const availableTranslations = await this.loadAvailableTranslations();

    const usedKeys = await this.extractI18nKeys();
    const uniqueKeys = [...new Set(usedKeys.map((k) => k.key))];

    const missingByLanguage: Record<string, number> = {};
    const languagesFound = Object.keys(availableTranslations);

    for (const lang of languagesFound) {
      missingByLanguage[lang] = missingTranslations.filter((mt) =>
        mt.missingLanguages.includes(lang),
      ).length;
    }

    return {
      languagesFound,
      missingByLanguage,
      missingTranslations: missingTranslations.length,
      totalKeys: uniqueKeys.length,
    };
  }
}
