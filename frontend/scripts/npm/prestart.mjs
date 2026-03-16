import ensureAppConfig from '../modules/ensure-app-config.mjs';
import generateBackendTypes from '../modules/generate-backend-types.mjs';
import generateRouteRegistry from '../modules/generate-route-registry.mjs';
import i18nSync from '../modules/i18n-sync.mjs';

/**
 * Función principal del módulo.
 *
 * @remarks Esta función es el punto de entrada único del módulo, ejecutada siempre de forma directa, sin exportación.
 * Garantiza primero la existencia del archivo de configuración de la aplicación y luego
 * ejecuta en paralelo la generación de tipos del backend, el registro de rutas y la sincronización i18n.
 */
async function main() {
  // Debe ejecutarse antes del resto de tareas para que el bundler encuentre el módulo:
  await ensureAppConfig();

  await Promise.all([
    generateBackendTypes(),
    generateRouteRegistry(),
    i18nSync(),
  ]);
}

// Ejecutar siempre la función principal:
main().catch((error) => {
  console.error('Error during execution:', error);
  process.exit(1);
});
