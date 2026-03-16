import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import { Locality } from '../../locality/entities/locality.entity';

const logger = new Logger('LocalitiesPreset');

/**
 * Interfaz de un registro de localidad del archivo JSON generado.
 */
interface LocalityRecord {
  name: string;
  province: string;
  autonomousCommunity: string;
}

/**
 * Carga las localidades de España en la base de datos.
 *
 * Lee el archivo `localities.json` generado por el script de postinstalación
 * y realiza una inserción masiva. Si la tabla ya contiene datos, se omite
 * la carga para evitar duplicados.
 *
 * @remarks
 * Este preset se ejecuta directamente con el `DataSource` en lugar de usar
 * el DSL del `SeederContext`, ya que maneja un volumen masivo de datos de
 * referencia (~8.200 registros) que requiere inserción por lotes.
 *
 * @param dataSource - Conexión activa a la base de datos.
 */
export async function flushLocalities(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Locality);

  // Verificar si ya hay datos cargados.
  const count = await repo.count();
  if (count > 0) {
    logger.debug(`Localidades: ${count} ya existentes, omitiendo carga.`);
    return;
  }

  // Leer archivo JSON.
  const jsonPath = path.join(
    __dirname,
    '..',
    'inputs',
    'data',
    'localities.json',
  );

  if (!fs.existsSync(jsonPath)) {
    logger.warn(
      'Localidades: archivo localities.json no encontrado. ' +
        'Ejecute "npm run postinstall" o "node scripts/modules/fetch-localities.mjs" ' +
        'para descargarlo.',
    );
    return;
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const records: LocalityRecord[] = JSON.parse(rawData);

  if (records.length === 0) {
    logger.warn('Localidades: archivo vacío, nada que cargar.');
    return;
  }

  // Inserción por lotes de 500 registros para evitar problemas de memoria.
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const entities = batch.map((r) =>
      repo.create({
        autonomousCommunity: r.autonomousCommunity,
        name: r.name,
        province: r.province,
      }),
    );

    await repo.insert(entities);
    inserted += entities.length;
  }

  logger.log(`Localidades: ${inserted} municipios insertados.`);
}
