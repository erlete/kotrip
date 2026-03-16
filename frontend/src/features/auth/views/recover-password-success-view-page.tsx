/**
 * @file recover-password-success-view-page.tsx
 * @description
 * Pagina de confirmacion tras la recuperacion exitosa de contrasena,
 * con enlace para volver al inicio de sesion.
 */

'use client';

import { Link } from '@/features/i18n';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';

/**
 * Página de vista de confirmación de recuperación de contraseña exitosa.
 *
 * Muestra un mensaje de éxito y un enlace para volver al inicio de sesión,
 * adaptado al tema editorial oscuro del layout de autenticación.
 */
export function RecoverPasswordSuccessViewPage() {
  const t = useTranslations();
  const tBtn = useTranslations('Buttons');

  return (
    <>
      <header className="flex flex-col gap-2">
        <h2 className="font-[family-name:var(--font-cormorant)] text-[2rem] font-semibold text-[var(--text)] tracking-[-0.01em]">
          {t('Titles.resetPassword')}
        </h2>
      </header>

      <div className="flex flex-col gap-4 w-full">
        <div className="rounded-[var(--rounded-sm)] border border-[var(--success-500)]/20 bg-[var(--success-500)]/10 px-4 py-3 text-sm text-[var(--success-400)]">
          <p>{t('ResetPassword.successMessage')}</p>
        </div>
        <div className="flex justify-center w-full">
          <Link href="/login">
            <Button
              variant="primary"
              fullWidth
            >
              {tBtn('buttonLogin')}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
