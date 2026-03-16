'use server';

import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { unauthorized } from 'next/navigation';

export type ApiError = {
  message: string;
  status?: number;
  details?: unknown;
};

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

/**
 * Manejador de solicitudes API con manejo integral de errores.
 *
 * El refresco de tokens ante un 401 se gestiona de forma transparente en el
 * `authMiddleware` del cliente autenticado (`lib/backend/client.ts`).
 * Si tras el reintento automático la respuesta sigue siendo 401, se interpreta
 * como sesión inválida y se delega a `unauthorized()` de Next.js.
 *
 * @remarks
 * Accede a cookies() al inicio para habilitar renderizado dinámico
 * y evitar warnings de Math.random() en prerenderizado de Next.js 16+.
 * Los mensajes de error se traducen mediante `next-intl/server` usando
 * el namespace `Errors.api`.
 */
export async function handleApiRequest<T>(
  apiCall: () => Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<ApiResult<T>> {
  // Acceso a cookies habilita renderizado dinámico antes de cualquier operación random
  await cookies();

  const t = await getTranslations('Errors.api');

  try {
    const { data, error, response } = await apiCall();

    // Handle HTTP errors
    if (error) {
      console.log('<API ERROR RESPONSE>');
      const status = response.status;
      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : t('unknownError');

      // 401 tras el reintento automático del middleware: sesión inválida
      if (status === 401) {
        unauthorized();
      }

      switch (status) {
        case 400:
          console.error(
            '[handleApiRequest] Bad Request:',
            JSON.stringify(error, null, 2),
          );

          return {
            success: false,
            error: {
              message: errorMessage,
              status,
              details: error,
            },
          };
        case 403:
          return {
            success: false,
            error: {
              message: t('accessForbidden'),
              status,
              details: error,
            },
          };
        case 404:
          return {
            success: false,
            error: {
              message: t('resourceNotFound'),
              status,
              details: error,
            },
          };
        case 409:
        case 413:
        case 429:
          return {
            success: false,
            error: {
              message: errorMessage,
              status,
              details: error,
            },
          };
        case 422:
          return {
            success: false,
            error: {
              message: t('validationError'),
              status,
              details: error,
            },
          };
        case 500:
        case 502:
        case 503:
          return {
            success: false,
            error: {
              message: t('serverError'),
              status,
              details: error,
            },
          };
        default:
          return {
            success: false,
            error: {
              message: errorMessage,
              status,
              details: error,
            },
          };
      }
    }

    // Handle missing data
    if (!data) {
      return {
        success: false,
        error: {
          message: t('noData'),
        },
      };
    }

    return { success: true, data };
  } catch (error) {
    // Allow Next.js control-flow errors (unauthorized, redirects) to bubble up
    if (error instanceof Error && error.message.startsWith('NEXT_HTTP_ERROR')) {
      throw error;
    }

    console.error('Unexpected error in API request:', error);
    return {
      success: false,
      error: {
        message: t('unexpectedError'),
        details: error instanceof Error ? error.message : error,
      },
    };
  }
}
