/**
 * Barrel export del feature `auth`.
 *
 * Objetivo: que el resto de la app consuma el API publico desde `@/features/auth`
 * sin importar rutas internas (components/, hooks/, providers/, etc.).
 */

// ===== Server utilities =====
export * from './cookies';
export * from './types';
export * from './actions';

// ===== Providers =====
export * from './providers/auth-provider';

// ===== Hooks =====
export * from './hooks/use-session';

// ===== Views =====
export * from './views/login-view-page';
export * from './views/register-view-page';
export * from './views/verify-email-view-page';
export * from './views/recover-password-view-page';
export * from './views/recover-password-success-view-page';

// ===== Components =====
export * from './components/client-auth-guard';
export * from './components/server-auth-guard';
export * from './components/session-activity-tracker';

export * from './components/login-form';
export * from './components/logout-form';
export * from './components/register-form';
export * from './components/verify-email-form';
