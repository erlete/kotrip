/**
 * @file verify-email-view-page.tsx
 * @description
 * Pagina de verificacion de email mediante codigo OTP de 6 digitos
 * enviado durante el registro de usuarios.
 */

'use client';

import { useTranslations } from 'next-intl';
import { VerifyEmailForm } from '../components/verify-email-form';

/**
 * Props para la página de verificación de email.
 */
interface VerifyEmailViewPageProps {
  /** Correo electrónico del usuario a verificar. */
  mail: string;
}

/**
 * Página de vista de verificación de email.
 *
 * Muestra el formulario para ingresar el código de verificación
 * de 6 dígitos enviado por correo electrónico durante el registro,
 * adaptado al tema editorial oscuro del layout de autenticación.
 */
export function VerifyEmailViewPage({ mail }: VerifyEmailViewPageProps) {
  const t = useTranslations();

  return (
    <>
      <header className="flex flex-col gap-2">
        <h2 className="font-[family-name:var(--font-cormorant)] text-[2rem] font-semibold text-[var(--text)] tracking-[-0.01em]">
          {t('Titles.verifyEmail')}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {t('Auth.verifyEmail.description', { email: mail || '...' })}
        </p>
      </header>

      <VerifyEmailForm email={mail} />
    </>
  );
}
