/**
 * @file register-view-page.tsx
 * @description
 * -----------------------------------------------------
 * Página de vista de registro
 * -----------------------------------------------------
 * @version 1.0.0
 * @created 2026-02-03
 * @modified 2026-03-13



 */

'use client';

import { Link } from '@/features/i18n';
import { useTranslations } from 'next-intl';
import { RegisterForm } from '../components/register-form';

/**
 * Props para la página de registro.
 */
interface RegisterViewPageProps {
  /** Indica si el registro está habilitado en la plataforma. */
  registrationEnabled?: boolean;
}

/**
 * Página de vista de registro.
 *
 * Muestra el formulario de registro con enlaces a login,
 * adaptado al tema editorial oscuro del layout de autenticación.
 */
export function RegisterViewPage({
  registrationEnabled = true,
}: RegisterViewPageProps) {
  const t = useTranslations();

  if (!registrationEnabled) {
    return (
      <>
        <header className="flex flex-col gap-2">
          <h2 className="font-[family-name:var(--font-cormorant)] text-[2rem] font-semibold text-[var(--text)] tracking-[-0.01em]">
            {t('Titles.register')}
          </h2>
          <div className="mt-2 rounded-[var(--rounded-lg)] border border-[var(--warning-300)]/30 bg-[var(--warning-500)]/10 px-4 py-3 text-sm text-[var(--warning-400)]">
            {t('Auth.registrationDisabled')}
          </div>
        </header>

        <footer className="flex flex-col items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">
              {t('Auth.register.alreadyAccount?')}
            </span>
            <Link
              href="/login"
              className="font-semibold text-[var(--warning-400)] transition-colors hover:text-[var(--warning-300)] hover:underline"
            >
              {t('Auth.register.loginHere')}
            </Link>
          </div>
        </footer>
      </>
    );
  }

  return (
    <>
      <header className="flex flex-col gap-2">
        <h2 className="font-[family-name:var(--font-cormorant)] text-[2rem] font-semibold text-[var(--text)] tracking-[-0.01em]">
          {t('Titles.register')}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {t('Register.description')}
        </p>
      </header>

      <RegisterForm />

      <footer className="flex flex-col items-center gap-2 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)]">
            {t('Auth.register.alreadyAccount?')}
          </span>
          <Link
            href="/login"
            className="font-semibold text-[var(--warning-400)] transition-colors hover:text-[var(--warning-300)] hover:underline"
          >
            {t('Auth.register.loginHere')}
          </Link>
        </div>
      </footer>
    </>
  );
}
