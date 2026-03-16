/**
 * Función principal del módulo.
 *
 * @remarks Esta función es el punto de entrada único del módulo, ejecutada siempre de forma directa, sin exportación.
 */
async function main() {}

// Ejecutar siempre la función principal:
main().catch((error) => {
  console.error('Error during execution:', error);
  process.exit(1);
});
