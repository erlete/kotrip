import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';
import format from '../../../scripts/modules/format.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.resolve(
  __dirname,
  '../../src/lib/backend/openapi.d.ts',
);

/**
 * Construye la URL base del backend a partir de las variables de entorno
 * `BACKEND_CLUSTER_HOST` y `BACKEND_CLUSTER_PORT`.
 *
 * Lógica equivalente a `url-core.ts` en formato ESM puro.
 *
 * @returns {string} URL HTTP(S) base del backend, sin barra final.
 */
function buildBackendBaseUrl() {
  const host = process.env.BACKEND_CLUSTER_HOST ?? '127.0.0.1';
  const port = process.env.BACKEND_CLUSTER_PORT;

  if (port) return `http://${host}:${port}`;

  const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const LOCAL = new Set(['127.0.0.1', 'localhost', '::1']);

  if (LOCAL.has(host) || IPV4.test(host)) return `http://${host}:3050`;

  return `https://${host}`;
}

/**
 * Genera tipos TypeScript a partir de la especificación OpenAPI del backend.
 *
 * Implementa reintentos con backoff exponencial cuando el endpoint no está disponible.
 * - Intentos máximos: 5
 * - Backoff base: 5000ms (5s), se duplica en cada reintento
 *
 * @returns {Promise<void>}
 */
async function main() {
  const url = `${buildBackendBaseUrl()}/docs-json`;
  console.log(`Fetching OpenAPI spec from ${url}...`);

  const fetchFn = globalThis.fetch ?? (await import('node-fetch')).default;

  const maxAttempts = 5;
  const baseBackoffMs = 5000;
  let spec = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetchFn(url);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch OpenAPI spec: ${res.status} ${res.statusText}`,
        );
      }
      spec = await res.json();
      break; // éxito
    } catch (err) {
      const isLast = attempt === maxAttempts;
      console.error(
        `Attempt ${attempt}/${maxAttempts} failed: ${err?.message ?? err}`,
      );
      if (isLast) throw err;

      const waitMs = baseBackoffMs * 2 ** (attempt - 1);
      console.log(`Retrying in ${waitMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  // openapi-typescript 7.x devuelve un AST (ts.Node[])
  const ast = await openapiTS(spec);

  const content = astToString(ast);

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, content, 'utf8');

  await format([OUTPUT_PATH]);

  console.log(`✓ Types generated successfully at ${OUTPUT_PATH}`);
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
