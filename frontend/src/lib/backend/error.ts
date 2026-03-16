/**
 * Error del cliente de backend.
 *
 * Representa un error producido por el cliente openapi-fetch al
 * comunicarse con la API del backend.
 */
export class BackendClientError extends Error {
  constructor(error: object) {
    super(`Backend Client Error: ${JSON.stringify(error)}`);
    Object.setPrototypeOf(this, BackendClientError.prototype);
  }
}
