import 'server-only';
import { buildBackendBaseUrl } from './url-core';

/**
 * Construye la URL HTTP base del backend a partir de las variables de entorno
 * `BACKEND_CLUSTER_HOST` y `BACKEND_CLUSTER_PORT`.
 *
 * Resolución delegada a {@link buildBackendBaseUrl}:
 * - Si `BACKEND_CLUSTER_PORT` está definido: `http://{host}:{port}`.
 * - Si no hay puerto y el host es una IP o `localhost`: `http://{host}:3050`.
 * - Si no hay puerto y el host es un dominio: `https://{host}`.
 *
 * @returns URL HTTP(S) base del backend, sin barra final.
 */
export function getBackendBaseUrl(): string {
  const host = process.env.BACKEND_CLUSTER_HOST ?? '127.0.0.1';
  const port = process.env.BACKEND_CLUSTER_PORT;
  return buildBackendBaseUrl(host, port);
}

/**
 * Construye la URL WebSocket base del backend.
 *
 * Convierte el protocolo HTTP(S) de {@link getBackendBaseUrl} en su
 * equivalente WS(S).
 *
 * @returns URL WebSocket base del backend, sin barra final.
 */
export function getBackendWsBaseUrl(): string {
  const httpUrl = getBackendBaseUrl();
  return httpUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
}
