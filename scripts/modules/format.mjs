import { execFile } from 'node:child_process';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Directorio raíz del repositorio, resuelto de forma relativa
 * a la ubicación del propio script.
 */
const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Ruta absoluta al archivo de configuración global de Prettier.
 */
const CONFIG_PATH = resolve(ROOT_DIR, 'prettier.config.mjs');

/**
 * Ruta absoluta al archivo `.prettierignore` del repositorio.
 */
const IGNORE_PATH = resolve(ROOT_DIR, '.prettierignore');

/**
 * Ruta absoluta al módulo CLI de Prettier.
 */
const PRETTIER_CLI = resolve(
  ROOT_DIR,
  'node_modules',
  'prettier',
  'bin',
  'prettier.cjs',
);

/**
 * Formatea archivos mediante Prettier.
 *
 * @param {string[]} [files] - Lista opcional de rutas de archivos a formatear.
 *   Las rutas relativas se resuelven respecto al directorio de trabajo actual.
 *   Si se omite, se formatea el repositorio completo.
 *
 * @remarks Esta función es el punto de entrada único del módulo, exportada tanto
 *   como exportación nombrada como por defecto.
 */
async function main(files) {
  const args = [
    PRETTIER_CLI,
    '--write',
    '--ignore-unknown',
    '--config',
    CONFIG_PATH,
    '--ignore-path',
    IGNORE_PATH,
  ];

  if (files && files.length > 0) {
    // Sin --cache cuando se formatean archivos específicos: evita corrupción
    // de la caché de Prettier en invocaciones paralelas.
    const resolved = files.map((f) => (isAbsolute(f) ? f : resolve(f)));
    args.push(...resolved);
  } else {
    // --cache solo para formateo completo del repositorio (secuencial).
    args.splice(1, 0, '--cache');
    args.push(ROOT_DIR);
  }

  await execFileAsync(process.execPath, args, { cwd: ROOT_DIR });
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
