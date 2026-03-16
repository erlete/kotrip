/**
 * Backend client error.
 *
 * This error is used to handle OpenAPI client errors appeared while
 * communicating with the backend API.
 */
export class BackendClientError extends Error {
  constructor(error: object) {
    super(`Backend Client Error: ${JSON.stringify(error)}`);
    Object.setPrototypeOf(this, BackendClientError.prototype);
  }
}
