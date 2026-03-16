import { execSync } from 'child_process';
import fetchLocalities from '../modules/fetch-localities.mjs';

/**
 * Comprueba si git está instalado en el sistema.
 *
 * @returns {boolean} `true` si git está disponible, `false` en caso contrario.
 */
function isGitInstalled() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Instala lefthook si git está disponible.
 */
function installLefthook() {
  if (!isGitInstalled()) {
    console.warn(
      'postinstall warn Git is not installed. Skipping lefthook installation.',
    );
    return;
  }

  try {
    console.log('Installing lefthook...');
    execSync('npm exec lefthook install', { stdio: 'inherit' });
    console.log('✓ Lefthook installed successfully');
  } catch (error) {
    console.error('Failed to install lefthook:', error.message);
    process.exit(1);
  }
}

/**
 * Función principal del módulo.
 *
 * @remarks Esta función es el punto de entrada único del módulo, ejecutada siempre de forma directa, sin exportación.
 * Ejecuta la instalación de lefthook.
 */
async function main() {
  installLefthook();
  await fetchLocalities();
}

// Ejecutar siempre la función principal:
main().catch((error) => {
  console.error('Error during execution:', error);
  process.exit(1);
});
