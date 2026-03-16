/**
 * Descarga los municipios de España desde la API pública de OpenDataSoft.
 *
 * La fuente original de los datos es el INE (Instituto Nacional de Estadística).
 * El dataset utilizado es "georef-spain-municipio", que contiene información
 * geográfica y administrativa de todos los municipios españoles.
 *
 * El archivo resultante se almacena en `backend/src/modules/seeder/inputs/data/localities.json`
 * y es consumido por el seeder de localidades al arrancar la aplicación.
 *
 * @remarks
 * - El archivo generado está excluido de git (`.gitignore`).
 * - Si el archivo ya existe, la descarga se omite para evitar llamadas innecesarias.
 * - En caso de error de red, se muestra un aviso sin interrumpir la ejecución.
 *
 * @module scripts/modules/fetch-localities
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import https from 'https';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(
  __dirname,
  '..',
  '..',
  'backend',
  'src',
  'modules',
  'seeder',
  'inputs',
  'data',
  'localities.json',
);

const API_BASE =
  'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-spain-municipio/records';
const PAGE_SIZE = 100;

/**
 * Realiza una petición GET HTTPS y devuelve el JSON parseado.
 *
 * @param {string} url - URL a la que realizar la petición.
 * @returns {Promise<object>} Respuesta JSON parseada.
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`Error al parsear JSON: ${err.message}`));
          }
        });
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

/**
 * Descarga todos los municipios de España paginando la API de OpenDataSoft.
 *
 * @returns {Promise<Array<{name: string, province: string, autonomousCommunity: string}>>}
 */
async function fetchAllLocalities() {
  const allRecords = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const url = `${API_BASE}?limit=${PAGE_SIZE}&offset=${offset}&select=mun_name,prov_name,acom_name&order_by=acom_name,prov_name,mun_name`;
    const page = await fetchJson(url);

    total = page.total_count;
    allRecords.push(...page.results);
    offset += PAGE_SIZE;

    if (offset % 1000 === 0 || offset >= total) {
      console.log(
        `  Localidades: ${Math.min(offset, total)}/${total} descargadas...`,
      );
    }
  }

  // Transformar al formato esperado por el seeder.
  const localities = allRecords.map((r) => ({
    name: r.mun_name,
    province: r.prov_name,
    autonomousCommunity: r.acom_name,
  }));

  // Deduplicar por nombre+provincia y ordenar.
  const unique = [
    ...new Map(localities.map((l) => [`${l.name}|${l.province}`, l])).values(),
  ];

  unique.sort(
    (a, b) =>
      a.autonomousCommunity.localeCompare(b.autonomousCommunity) ||
      a.province.localeCompare(b.province) ||
      a.name.localeCompare(b.name),
  );

  return unique;
}

/**
 * Punto de entrada: descarga las localidades si el archivo no existe.
 */
export default async function fetchLocalities() {
  if (existsSync(OUTPUT_PATH)) {
    console.log('  Localidades: archivo ya existe, omitiendo descarga.');
    return;
  }

  console.log(
    '  Localidades: descargando municipios de España (INE/OpenDataSoft)...',
  );

  try {
    const localities = await fetchAllLocalities();

    // Asegurar que el directorio destino existe.
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(localities, null, 2));

    console.log(
      `  Localidades: ${localities.length} municipios guardados en localities.json`,
    );
  } catch (error) {
    console.warn(
      `  Localidades: no se pudo descargar los municipios (${error.message}). ` +
        'El seeder de localidades no podrá ejecutarse hasta que el archivo exista.',
    );
  }
}
