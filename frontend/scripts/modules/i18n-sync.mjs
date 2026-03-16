import fs from 'fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import format from '../../../scripts/modules/format.mjs';
import i18nTypegen from './i18n-typegen.mjs';

/**
 * Directorio del paquete frontend, resuelto a partir de la ubicación del script.
 */
const FRONTEND_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

/**
 * Directorio que contiene los archivos JSON de traducción.
 */
const MESSAGES_DIR = resolve(
  FRONTEND_DIR,
  'src',
  'features',
  'i18n',
  'messages',
);

/**
 * Determina si un nombre de archivo corresponde a un JSON de traducción de dos letras.
 *
 * @param {string} filename - Nombre del archivo a verificar.
 * @returns {boolean} `true` si el nombre coincide con el patrón `xx.json`.
 */
function isTwoLetterJSON(filename) {
  return /^[a-z]{2}\.json$/.test(filename);
}

/**
 * Carga y parsea un archivo JSON.
 *
 * @param {string} filePath - Ruta del archivo JSON.
 * @returns {Promise<object>} Contenido del archivo parseado.
 */
async function loadJSON(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Guarda un objeto como JSON con formato legible y salto de línea final.
 *
 * @param {string} filePath - Ruta del archivo de destino.
 * @param {object} data - Datos a serializar.
 */
async function saveJSON(filePath, data) {
  let pretty = JSON.stringify(data, null, 2);
  // Asegurar exactamente un salto de línea al final del archivo
  pretty = pretty.replace(/\s*$/, '') + '\n';
  await fs.writeFile(filePath, pretty, 'utf-8');
}

/**
 * Ordena recursivamente las claves de un objeto.
 *
 * @param {*} obj - Valor a ordenar (objetos se ordenan, otros tipos se devuelven sin cambio).
 * @returns {*} El valor con las claves ordenadas alfabéticamente.
 */
function sortObject(obj) {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj && typeof obj === 'object') {
    const sorted = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = sortObject(obj[key]);
      });
    return sorted;
  }
  return obj;
}

/**
 * Fusiona un objeto JSON en el registro de claves de forma recursiva.
 *
 * @param {object} registry - Registro acumulado de claves.
 * @param {object} obj - Objeto origen a fusionar.
 * @returns {object} El registro actualizado.
 */
function mergeRegistry(registry, obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (!(key in registry)) {
      registry[key] = typeof value === 'object' && value !== null ? {} : null;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      registry[key] = mergeRegistry(registry[key] || {}, value);
    }
  }
  return registry;
}

/**
 * Rellena las claves faltantes en un objeto destino a partir de una plantilla.
 *
 * @param {object} template - Plantilla con la estructura completa de claves.
 * @param {object} target - Objeto destino a completar.
 */
function fillMissingKeys(template, target) {
  for (const [key, value] of Object.entries(template)) {
    if (!(key in target)) {
      target[key] = value === null ? 'TODO: translate this key term' : {};
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!(key in target) || typeof target[key] !== 'object') {
        target[key] = {};
      }
      fillMissingKeys(value, target[key]);
    }
  }
}

/**
 * Función principal del módulo.
 *
 * @remarks Sincroniza los archivos JSON de traducción, asegurando que todos los idiomas
 * contengan las mismas claves y estén ordenados alfabéticamente.
 */
async function main() {
  const files = (await fs.readdir(MESSAGES_DIR)).filter(isTwoLetterJSON);
  console.log('Found JSON files:', files);

  const dataMap = {};
  const registry = {};

  // Cargar y ordenar archivos
  for (const file of files) {
    const filePath = resolve(MESSAGES_DIR, file);
    const data = await loadJSON(filePath);
    const sortedData = sortObject(data);
    dataMap[file] = sortedData;
    mergeRegistry(registry, sortedData);
  }

  // Rellenar claves faltantes y reescribir archivos
  for (const [file, data] of Object.entries(dataMap)) {
    fillMissingKeys(registry, data);
    const sortedFilled = sortObject(data);
    await saveJSON(resolve(MESSAGES_DIR, file), sortedFilled);

    await format([resolve(MESSAGES_DIR, file)]);

    console.log(`Updated ${file} with missing keys.`);
  }

  await i18nTypegen();
}

// Exportar la función principal como exportación nombrada y por defecto:
export { main, main as default };

// Ejecutar la función principal en invocación directa:
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error('Error during execution:', error);
    process.exit(1);
  });
}
