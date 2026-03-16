import { LOCALE_COOKIE_NAME, routing } from '@/features/i18n';
import type { BackendTypes } from '@/lib/backend/types';
import { buildBackendBaseUrl } from '@/lib/backend/url-core';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookieOptions } from './features/auth/cookie-options';
import { decrypt, encrypt } from './features/auth/crypto';
import type { OtpFlow, OtpSessionPayload } from './features/auth/otp-session';
import type { Session, ValidatedSession } from './features/auth/types';

// ── Constantes ──────────────────────────────────────────────────────────

/** URL base del backend, resuelta a partir de las variables de entorno. */
const BACKEND_BASE_URL = buildBackendBaseUrl(
  process.env.BACKEND_CLUSTER_HOST ?? '127.0.0.1',
  process.env.BACKEND_CLUSTER_PORT,
);

/**
 * Porcentaje del _lifetime_ del JWT a partir del cual se considera que
 * debe refrescarse proactivamente (0.8 = 80 %).
 */
const REFRESH_THRESHOLD = parseFloat(
  process.env.TOKEN_REFRESH_THRESHOLD || '0.8',
);

// ── Tipos ───────────────────────────────────────────────────────────────

/**
 * Tipo de la respuesta del endpoint `/auth/refresh`.
 * Coincide con `LoginOutputDto` del backend.
 */
type RefreshResponseBody = {
  backendTokens: BackendTypes['BackendTokensDTO'];
  user: BackendTypes['UserDTO'];
};

// ── Utilidades de lectura de cookies ────────────────────────────────────
// Se leen directamente desde `request.cookies` (NextRequest) y se
// desencriptan con `decrypt` de crypto.ts, evitando importar funciones
// de archivos marcados con `'use server'` que no son invocables en el
// proxy de Next.js 16.

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 * Utilizado exclusivamente para leer los claims `exp`/`iat`.
 */
function decodeJwtPayload(
  token: string,
): { exp?: number; iat?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload) as { exp?: number; iat?: number };
  } catch {
    return null;
  }
}

/**
 * Determina si un access token ya expiró o está próximo a expirar
 * (superó el umbral configurable `TOKEN_REFRESH_THRESHOLD`).
 */
function isTokenExpiredOrNearExpiry(accessToken: string): boolean {
  const payload = decodeJwtPayload(accessToken);

  if (!payload?.exp || !payload?.iat) return true;

  const now = Math.floor(Date.now() / 1000);

  // Token ya expirado
  if (now >= payload.exp) return true;

  // Calcular si hemos alcanzado el umbral de refresco
  const lifetime = payload.exp - payload.iat;
  const refreshTime = payload.iat + lifetime * REFRESH_THRESHOLD;

  return now >= refreshTime;
}

// ── Lógica de refresco proactivo ────────────────────────────────────────

/**
 * Refresca proactivamente los tokens de autenticación si están expirados o
 * próximos a expirar. Opera sobre las cookies del `NextResponse`, lo que
 * permite que los Server Components posteriores lean los valores actualizados
 * mediante `cookies().get()`.
 *
 * Lee las cookies directamente desde `request.cookies` y desencripta con
 * `decrypt` (crypto.ts), sin depender de funciones de archivos `'use server'`.
 *
 * Si el refresco falla (red, token inválido, etc.) se degrada sin errores:
 * el flujo existente en `authMiddleware.onResponse` (client.ts) actúa como
 * respaldo de segunda línea.
 */
async function refreshTokensIfNeeded(
  request: NextRequest,
  response: NextResponse,
): Promise<void> {
  // 1. Leer access token encriptado
  const rawAccessToken = request.cookies.get('accessToken')?.value;
  if (!rawAccessToken) return; // No autenticado

  // 2. Desencriptar y comprobar expiración
  const accessToken = decrypt<string>(rawAccessToken);
  if (!accessToken) return; // Cookie corrupta

  // 3. Comprobar si hay sesión en estado de 2FA (no refrescar)
  const rawSession = request.cookies.get('session')?.value;
  if (rawSession) {
    const session = decrypt<Session>(rawSession);
    if (session && 'needsValidation' in session) return;
  }

  // 4. Comprobar si necesita refresco
  if (!isTokenExpiredOrNearExpiry(accessToken)) return;

  // 5. Leer refresh token
  const rawRefreshToken = request.cookies.get('refreshToken')?.value;
  if (!rawRefreshToken) return;

  const refreshToken = decrypt<string>(rawRefreshToken);
  if (!refreshToken) return;

  // 6. Llamar al backend para refrescar
  const res = await fetch(`${BACKEND_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Refresh ${refreshToken}` },
  });

  if (!res.ok) {
    console.warn(
      `[Proxy] Refresco de token fallido (status ${String(res.status)})`,
    );
    return;
  }

  const body = (await res.json()) as RefreshResponseBody;

  // 7. Persistir nuevos tokens encriptados en las cookies de la respuesta
  response.cookies.set(
    'accessToken',
    encrypt(body.backendTokens.accessToken),
    getCookieOptions('accessToken'),
  );
  response.cookies.set(
    'refreshToken',
    encrypt(body.backendTokens.refreshToken),
    getCookieOptions('refreshToken'),
  );
  response.cookies.set(
    'session',
    encrypt(body.user),
    getCookieOptions('session'),
  );
}

// ── Protección de rutas OTP ──────────────────────────────────────────

/** Mapa de prefijos de ruta OTP a su flujo esperado. */
const OTP_FLOW_MAP: Record<string, OtpFlow[]> = {
  '/login/otp': ['login-otp'],
  '/register/otp': ['register'],
  '/recover-password/otp/edit': ['recover-edit'],
  '/recover-password/otp': ['recover'],
};

/**
 * Obtiene la ruta base a la que redirigir cuando falta o es inválida
 * la cookie de sesión OTP.
 */
function getOtpBaseRoute(pathname: string): string {
  if (pathname.startsWith('/login/otp')) return '/login';
  if (pathname.startsWith('/register/otp')) return '/register';
  if (pathname.startsWith('/recover-password/otp')) return '/recover-password';
  return '/login';
}

/**
 * Valida que el flujo de la cookie OTP corresponda a la ruta solicitada.
 * Las rutas más específicas se comprueban primero.
 */
function isFlowMatchingRoute(flow: OtpFlow, pathname: string): boolean {
  // Ordenar por longitud descendente para que las rutas más específicas
  // (e.g. /recover-password/otp/edit) se evalúen antes que las generales
  const sortedPrefixes = Object.keys(OTP_FLOW_MAP).sort(
    (a, b) => b.length - a.length,
  );

  for (const prefix of sortedPrefixes) {
    if (pathname.startsWith(prefix)) {
      return OTP_FLOW_MAP[prefix].includes(flow);
    }
  }

  return false;
}

// ── Proxy principal ─────────────────────────────────────────────────────

export default async function proxy(
  request: NextRequest,
): Promise<NextResponse> {
  // ── Redirección de la página de aterrizaje ────────────────────────────
  // Redirige `/` a `/home` (autenticado) o `/login` (invitado).
  // Anteriormente se gestionaba en `next.config.ts` vía `redirects()`,
  // pero la condición basada en cookies no se evalúa de forma fiable
  // con el plugin `next-intl`. Al ejecutarse en el proxy se garantiza
  // que la cookie `session` se lee directamente del request.
  if (request.nextUrl.pathname === '/') {
    const hasSession = request.cookies.has('session');
    const destination = hasSession ? '/home' : '/login';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // ── Protección de rutas OTP ──────────────────────────────────────
  // Verifica la cookie de sesión OTP en rutas que contengan `/otp`.
  // Si la cookie es inválida, expirada o no coincide con el flujo,
  // redirige al formulario base correspondiente.
  const { pathname } = request.nextUrl;

  if (pathname.match(/\/otp(\/|$)/)) {
    const otpCookie = request.cookies.get('otp-session')?.value;

    if (!otpCookie) {
      return NextResponse.redirect(
        new URL(getOtpBaseRoute(pathname), request.url),
      );
    }

    const otpPayload = decrypt<OtpSessionPayload>(otpCookie);

    if (!otpPayload || otpPayload.exp < Math.floor(Date.now() / 1000)) {
      const resp = NextResponse.redirect(
        new URL(getOtpBaseRoute(pathname), request.url),
      );
      resp.cookies.delete('otp-session');
      return resp;
    }

    if (!isFlowMatchingRoute(otpPayload.flow, pathname)) {
      return NextResponse.redirect(
        new URL(getOtpBaseRoute(pathname), request.url),
      );
    }
  }

  const response = NextResponse.next();

  // ── Refresco proactivo de tokens ──────────────────────────────────────
  // Se ejecuta antes de cualquier Server Component para que las cookies
  // ya contengan tokens válidos cuando se renderice la página.
  try {
    await refreshTokensIfNeeded(request, response);
  } catch (err) {
    // Nunca bloquear la navegación: si falla, el flujo de respaldo en
    // authMiddleware.onResponse (client.ts) se encargará.
    console.error('[Proxy] Error inesperado en refresco de tokens:', err);
  }

  // ── Locale & tema ────────────────────────────────────────────────────
  // Leer sesión directamente desde la cookie (sin importar de 'use server')
  const rawSession = request.cookies.get('session')?.value;
  const session: ValidatedSession | null = rawSession
    ? (decrypt<ValidatedSession>(rawSession) ?? null)
    : null;

  const localeFromSession =
    session && !('needsValidation' in session) ? session.language : undefined;
  const prevLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  // Usar idioma del usuario, si no usar el previo. Si no hay previo, el por defecto
  response.cookies.set(
    LOCALE_COOKIE_NAME,
    localeFromSession || prevLocale || routing.defaultLocale,
  );

  // TODO: El tema se manejará cuando se añada al DTO del backend
  const prevTheme = request.cookies.get('theme')?.value;

  // Usar tema previo. Si no hay previo, el por defecto
  response.cookies.set('theme', prevTheme || 'light');

  return response;
}

//! config prestada de Clerk 10/2025 (adaptada para que sea más completa)
export const config = {
  matcher: [
    /**
     * Ejecutar el middleware en TODAS las rutas
     * EXCEPTO:
     * - Next.js internals (_next, __nextjs)
     * - API routes (/api)
     * - assets
     * - .well-known
     * - archivos estáticos (imagenes, css, js, fuentes, maps, etc.)
     * - favicon, robots, sitemap
     */
    '/((?!api|_next|__nextjs|assets|\\.well-known|favicon\\.ico|robots\\.txt|sitemap\\.xml|[^?]*\\.(?:html?|css|js(?!on)|map|jpe?g|png|gif|webp|svg|ico|ttf|woff2?|eot)).*)',
  ],
};
