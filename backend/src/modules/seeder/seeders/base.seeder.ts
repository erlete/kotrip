/**
 * Clase base para seeders del sistema.
 *
 * Proporciona utilidades comunes de logging, reporte de progreso y carga de
 * datos JSON para seeders legacy. Los seeders que dependen de archivos JSON
 * pueden utilizar la funcionalidad de carga proporcionada.
 *
 * @remarks
 * En el nuevo sistema de presets, la logica de materializacion se centraliza
 * en el {@link SeederOrchestrator}. Esta clase se mantiene como utilidad
 * para seeders que aun necesitan funcionalidad de reporte estandarizada
 * y/o carga de datos JSON.
 *
 * @see SeederOrchestrator Para la logica centralizada de materializacion.
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export abstract class BaseSeeder<T = unknown> {
  /**
   * Nombre de la entidad para mensajes de log.
   *
   * @deprecated Se mantiene para compatibilidad con seeders legacy.
   */
  protected readonly entityName: string = '';

  /**
   * Nombre del archivo JSON de entrada en `inputs/data/`.
   *
   * @deprecated Se mantiene para compatibilidad con seeders legacy.
   */
  protected readonly inputFileName: string = '';

  /** Logger con el contexto del seeder concreto. */
  protected readonly logger: Logger;

  /**
   * Crea una nueva instancia del seeder base.
   *
   * @param loggerContext - Nombre del contexto para el logger.
   */
  constructor(loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  /**
   * Metodo principal de seeding. Debe ser implementado por cada seeder concreto.
   */
  abstract seed(): Promise<void>;

  /**
   * Carga datos desde un archivo JSON de entrada.
   *
   * Soporta dos formatos:
   * 1. Array directo: `[{...}, {...}]`
   * 2. Objeto con schema: `{ "$schema": "...", "data": [{...}, {...}] }`
   *
   * El segundo formato permite validacion con JSON Schema en el IDE.
   *
   * @returns Array de datos parseados del archivo.
   *
   * @deprecated Utilizar el sistema de presets en lugar de archivos JSON.
   */
  protected async loadData(): Promise<T[]> {
    const inputPath = path.join(
      __dirname,
      '..',
      'inputs',
      'data',
      this.inputFileName,
    );

    try {
      const fileContent = await fs.readFile(inputPath, 'utf-8');
      const parsed = JSON.parse(fileContent) as
        | { $schema?: string; data: T[] }
        | T[];

      let data: T[];

      if (Array.isArray(parsed)) {
        data = parsed;
      } else if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'data' in parsed &&
        Array.isArray(parsed.data)
      ) {
        data = parsed.data;
      } else {
        throw new Error(
          `Invalid format in ${this.inputFileName}. ` +
            `Expected array or object with "data" array property.`,
        );
      }

      this.logger.debug(
        `Loaded ${data.length} ${this.entityName || 'entries'} from file`,
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to load ${this.inputFileName}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Reporta progreso durante el seeding.
   *
   * @param current - Indice actual del elemento siendo procesado.
   * @param total   - Total de elementos a procesar.
   * @param item    - Nombre o identificador opcional del elemento actual.
   */
  protected reportProgress(
    current: number,
    total: number,
    item?: string,
  ): void {
    const percentage = ((current / total) * 100).toFixed(0);
    const itemInfo = item ? ` (${item})` : '';
    this.logger.debug(
      `Progress: ${current}/${total} (${percentage}%)${itemInfo}`,
    );
  }

  /**
   * Reporta finalizacion del seeding.
   *
   * @param count   - Cantidad de entidades creadas.
   * @param skipped - Cantidad de entidades omitidas por duplicado.
   */
  protected reportComplete(count: number, skipped: number = 0): void {
    const skippedInfo = skipped > 0 ? ` (${skipped} skipped)` : '';
    this.logger.debug(
      `${this.entityName || 'Entity'} seeding complete: ${count} created${skippedInfo}`,
    );
  }

  /**
   * Reporta un error durante el seeding.
   *
   * @param error   - Error ocurrido.
   * @param context - Contexto adicional sobre donde ocurrio el error.
   */
  protected reportError(error: Error, context?: string): void {
    const contextInfo = context ? ` [${context}]` : '';
    this.logger.error(`Error${contextInfo}: ${error.message}`);
  }
}
