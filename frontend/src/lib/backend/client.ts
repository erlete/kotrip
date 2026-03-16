import 'server-only';
import { getAccessToken, getRefreshToken } from '@/features/auth';
import { connection } from 'next/server';
import createClient, { Middleware } from 'openapi-fetch';
import type { paths } from './openapi';
import { getBackendBaseUrl } from './url';

/** URL base del backend, resuelta a partir de las variables de entorno. */
const BACKEND_BASE_URL = getBackendBaseUrl();

/**
 * Cliente básico para comunicarse con el backend API.
 */
export const backendClient = createClient<paths>({
  baseUrl: BACKEND_BASE_URL,
});

/**
 * Middleware que añade automáticamente los headers de autenticación
 * y gestiona el refresco transparente de tokens ante respuestas 401.
 *
 * Flujo ante un 401:
 * 1. Invoca `refreshAuthTokens()` para obtener un nuevo access token.
 * 2. Si el refresco tiene éxito, clona la petición original con el nuevo
 *    token y la reenvía directamente con `fetch()`.
 * 3. Si el refresco falla, devuelve la respuesta 401 original para que
 *    `handleApiRequest` gestione el cierre de sesión.
 *
 * Se usa `fetch()` directo para el reintento porque `cookies().get()` en
 * Next.js Server Actions no refleja valores establecidos con `cookies().set()`
 * dentro de la misma ejecución, por lo que el middleware no podría leer el
 * token recién guardado desde las cookies.
 *
 * Nota: `connection()` no se invoca en `onRequest` porque `openapi-fetch`
 * llama a `Math.random()` (para generar IDs de middleware) antes de ejecutar
 * `onRequest`. Next.js 16 prohíbe `Math.random()` en Server Components
 * antes de señalizar dinamismo. Por ello, `connection()` se invoca en
 * {@link withConnection} que envuelve cada método del cliente.
 */
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    if (refreshToken) {
      request.headers.set('x-refresh-token', refreshToken);
    }

    // Preservar el body para un posible reintento tras refresco de token.
    // El body de un Request es un stream que solo puede leerse una vez;
    // al clonarlo aquí, se garantiza que el reintento pueda reenviarlo.
    if (request.body && !request.bodyUsed) {
      (request as Request & { _bodyClone?: ReadableStream | null })._bodyClone =
        request.clone().body;
    }

    return request;
  },

  async onResponse({ request, response }) {
    if (response.status !== 401) {
      return response;
    }

    // Intentar refrescar el token
    const { refreshAuthTokens } = await import('@/features/auth/actions');
    const refreshResult = await refreshAuthTokens();

    if (!refreshResult.success || !refreshResult.accessToken) {
      // Refresco fallido: devolver la 401 original
      return response;
    }

    // Recuperar el body clonado en onRequest para reenviarlo.
    const bodyClone = (
      request as Request & { _bodyClone?: ReadableStream | null }
    )._bodyClone;

    // Clonar la petición original con el nuevo token
    const retryRequest = new Request(request.url, {
      method: request.method,
      headers: new Headers(request.headers),
      body: bodyClone ?? null,
      redirect: request.redirect,
      ...(bodyClone ? { duplex: 'half' as const } : {}),
    } as RequestInit);
    retryRequest.headers.set(
      'Authorization',
      `Bearer ${refreshResult.accessToken}`,
    );

    // Reintentar con fetch directo (evita pasar por el middleware de nuevo)
    return fetch(retryRequest);
  },
};

const rawClient = createClient<paths>({
  baseUrl: BACKEND_BASE_URL,
});
rawClient.use(authMiddleware);

/**
 * Envuelve una función del cliente para invocar `connection()` antes de
 * delegar en `openapi-fetch`.
 *
 * `openapi-fetch` genera un ID aleatorio con `Math.random()` al inicio de
 * cada petición (antes de ejecutar middlewares). En Next.js 16, las rutas
 * Server Component no pueden llamar a `Math.random()` sin haber señalizado
 * antes que la ruta es dinámica. `connection()` cumple esa función.
 */
function withConnection<F extends (...args: never[]) => Promise<unknown>>(
  fn: F,
): F {
  return (async (...args: Parameters<F>) => {
    await connection();
    return fn(...args);
  }) as unknown as F;
}

/**
 * Cliente autenticado que añade automáticamente los tokens en cada petición.
 *
 * Cada método HTTP está envuelto con `withConnection()` para señalizar
 * dinamismo a Next.js antes de que `openapi-fetch` invoque `Math.random()`.
 *
 * El refresco de tokens se gestiona directamente en el `authMiddleware`:
 * cuando el backend responde con 401, se intenta refrescar el token y
 * reintentar la petición con el nuevo token antes de devolver la respuesta.
 *
 * Como respaldo adicional, `handleApiRequest` (lib/fetch.ts) también maneja
 * respuestas 401 invocando `unauthorized()` para cerrar la sesión.
 */
export const authenticatedClient = {
  ...rawClient,
  GET: withConnection(rawClient.GET),
  POST: withConnection(rawClient.POST),
  PUT: withConnection(rawClient.PUT),
  PATCH: withConnection(rawClient.PATCH),
  DELETE: withConnection(rawClient.DELETE),
  OPTIONS: withConnection(rawClient.OPTIONS),
  HEAD: withConnection(rawClient.HEAD),
  TRACE: withConnection(rawClient.TRACE),
  use: rawClient.use.bind(rawClient),
  eject: rawClient.eject.bind(rawClient),
};
