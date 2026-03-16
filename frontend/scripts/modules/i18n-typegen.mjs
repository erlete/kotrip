import { execFile } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Directorio raíz del paquete frontend, resuelto de forma relativa
 * a la ubicación del propio script.
 */
const FRONTEND_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

/**
 * Directorio raíz del repositorio.
 */
const ROOT_DIR = resolve(FRONTEND_DIR, '..');

/**
 * Ruta absoluta al módulo CLI de Next.js.
 */
const NEXT_CLI = resolve(
  ROOT_DIR,
  'node_modules',
  'next',
  'dist',
  'bin',
  'next',
);

/**
 * Genera los archivos de declaración de tipos para los mensajes de next-intl
 * mediante el comando `next typegen`.
 *
 * @remarks Esta función es el punto de entrada único del módulo, exportada tanto
 *   como exportación nombrada como por defecto.
 */
async function main() {
  await execFileAsync(process.execPath, [NEXT_CLI, 'typegen'], {
    cwd: FRONTEND_DIR,
  });

  console.log('Declaraciones de tipos i18n generadas correctamente.');
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
