/**
 * Lógica pura de construcción de URL del backend.
 *
 * Este modulo no importa `server-only`, por lo que es compatible con
 * el Edge Runtime de Next.js (middleware) y con cualquier otro contexto.
 *
 * @see {@link ./url.ts} para la variante con protección `server-only`.
 */

/** Patrón de expresión regular para identificar direcciones IPv4. */
const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;

/** Hosts locales que implican acceso por puerto directo sin TLS. */
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);

/** Puerto por defecto del backend al acceder desde fuera del clúster Docker. */
const DEFAULT_EXTERNAL_PORT = 3050;

/**
 * Determina si el host dado es una dirección IP (IPv4) o un host local.
 */
function isIpOrLocalhost(host: string): boolean {
  return LOCAL_HOSTS.has(host) || IPV4_PATTERN.test(host);
}

/**
 * Construye la URL HTTP base del backend a partir de un host y un puerto
 * opcionales.
 *
 * Reglas de resolución:
 * 1. Si `port` está definido: `http://{host}:{port}`.
 * 2. Si no hay puerto y el host es una IP o `localhost`:
 *    `http://{host}:3050`.
 * 3. Si no hay puerto y el host es un dominio: `https://{host}`.
 *
 * @param host - Nombre de host, dirección IP o nombre de servicio Docker.
 * @param port - Puerto explícito (opcional).
 * @returns URL HTTP(S) base del backend, sin barra final.
 */
export function buildBackendBaseUrl(
  host: string,
  port: string | undefined,
): string {
  if (port) {
    return `http://${host}:${port}`;
  }

  if (isIpOrLocalhost(host)) {
    return `http://${host}:${DEFAULT_EXTERNAL_PORT}`;
  }

  return `https://${host}`;
}
