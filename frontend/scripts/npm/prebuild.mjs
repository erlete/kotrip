import generateRouteRegistry from '../modules/generate-route-registry.mjs';
import i18nSync from '../modules/i18n-sync.mjs';

/**
 * Función principal del módulo.
 *
 * @remarks Esta función es el punto de entrada único del módulo, ejecutada siempre de forma directa, sin exportación.
 * Ejecuta en paralelo la generación del registro de rutas y la sincronización i18n.
 */
async function main() {
  await Promise.all([generateRouteRegistry(), i18nSync()]);
}

// Ejecutar siempre la función principal:
main().catch((error) => {
  console.error('Error during execution:', error);
  process.exit(1);
});
