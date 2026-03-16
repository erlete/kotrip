/**
 * @file login-view-page.tsx
 * @description
 * -----------------------------------------------------
 * Página de vista de inicio de sesión
 * -----------------------------------------------------
 * @version 1.0.0
 * @created 2025-11-24
 * @modified 2026-03-13



 */

'use client';

import { Link } from '@/features/i18n';
import { useTranslations } from 'next-intl';
import { LoginForm } from '../components/login-form';

/**
 * Props para la página de login.
 */
interface LoginViewPageProps {
  /** Indica si el login está habilitado en la plataforma. */
  loginEnabled?: boolean;
}

/**
 * Página de vista de inicio de sesión.
 *
 * Muestra el formulario de login con enlaces a registro y recuperación de contraseña,
 * adaptado al tema editorial oscuro del layout de autenticación.
 */
export function LoginViewPage({ loginEnabled = true }: LoginViewPageProps) {
  const t = useTranslations();

  return (
    <>
      <header className="flex flex-col gap-2">
        <h2 className="font-[family-name:var(--font-cormorant)] text-[2rem] font-semibold text-[var(--text)] tracking-[-0.01em]">
          {t('Titles.login')}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {t('Login.subtitle')}
        </p>
        {!loginEnabled && (
          <div className="mt-2 rounded-[var(--rounded-lg)] border border-[var(--warning-300)]/30 bg-[var(--warning-500)]/10 px-4 py-3 text-sm text-[var(--warning-400)]">
            {t('Auth.loginDisabledBanner')}
          </div>
        )}
      </header>

      <LoginForm />

      <footer className="flex flex-col items-center gap-2 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)]">
            {t('Auth.login.notAccount?')}
          </span>
          <Link
            href="/register"
            className="font-semibold text-[var(--warning-400)] transition-colors hover:text-[var(--warning-300)] hover:underline"
            data-testid="login-form__register-link"
          >
            {t('Auth.login.registerHere')}
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)]">
            {t('Login.text-link-forgot-password')}
          </span>
          <Link
            href="/recover-password"
            className="font-medium text-[var(--primary-400)] transition-colors hover:text-[var(--primary-300)] hover:underline"
            data-testid="login-form__forgot-password-link"
          >
            {t('Login.link-forgot-password')}
          </Link>
        </div>
      </footer>
    </>
  );
}
