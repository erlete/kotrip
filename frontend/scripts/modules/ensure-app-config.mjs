import { copyFileSync, existsSync } from 'fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'path';

/**
 * Garantiza la existencia del archivo de sobrecargas de configuración
 * `app.config.ts` antes de que el bundler intente resolver la importación.
 *
 * Si el archivo no existe (caso habitual en despliegues nuevos o en el
 * contenedor Docker, donde el archivo está excluido por `.gitignore`), se
 * copia el módulo de reserva `app.config.empty.ts` como `app.config.ts`.
 * De esta forma, la importación estática en `resolve-config.ts` siempre
 * encuentra un módulo válido sin necesidad de alias de resolución en el
 * bundler.
 */
async function main() {
  const configDir = resolve(import.meta.dirname, '../../src/config');
  const target = resolve(configDir, 'app.config.ts');
  const fallback = resolve(configDir, 'app.config.empty.ts');

  if (existsSync(target)) {
    return;
  }

  copyFileSync(fallback, target);
  console.log(
    '✔ Sin sobrecargas, generado app.config.ts desde app.config.empty.ts',
  );
}

// Exportar la función principal como exportación nombrada y por defecto:
export { main, main as default };

// Ejecutar la función principal en invocación directa:
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('Error during execution:', error);
    process.exit(1);
  });
}
