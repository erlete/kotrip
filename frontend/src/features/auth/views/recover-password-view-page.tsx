/**
 * @file recover-password-view-page.tsx
 * @description
 * -----------------------------------------------------
 * Pagina de vista de recuperacion de contrasena.
 * Permite al usuario introducir su correo electronico
 * para recibir instrucciones de restablecimiento.
 * -----------------------------------------------------
 * @version 2.0.0
 * @created 2026-03-10
 * @modified 2026-03-13



 */

'use client';

import { Link } from '@/features/i18n';
import { Button, InputGroup, Label, TextField } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/**
 * Pagina de vista de recuperacion de contrasena.
 *
 * Muestra un formulario con campo de correo electronico que, al enviarse,
 * muestra un toast de confirmacion y redirige al usuario al login.
 * Adaptado al tema editorial oscuro del layout de autenticacion.
 */
export function RecoverPasswordViewPage() {
  const t = useTranslations();
  const tBtn = useTranslations('Buttons');
  const tRecover = useTranslations('Auth.recoverPassword');
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  /**
   * Maneja el envio del formulario de recuperacion.
   * Muestra un toast confirmando el envio y redirige al login.
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);

    toast.success(tRecover('successToast'), { duration: 6000 });
    router.push('/login');
  };

  return (
    <>
      <header className="flex flex-col gap-2">
        <h2 className="font-[family-name:var(--font-cormorant)] text-[2rem] font-semibold text-[var(--text)] tracking-[-0.01em]">
          {t('Titles.forgotPassword')}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {tRecover('description')}
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-stretch gap-4 w-full"
      >
        <TextField
          name="email"
          isRequired
          className="flex w-full flex-col gap-2"
        >
          <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
            {t('Labels.labelMail')}
          </Label>
          <InputGroup>
            <InputGroup.Input
              placeholder={t('Placeholders.placeholderMail')}
              className="w-full rounded-[var(--rounded-sm)] border border-[var(--border)] bg-[var(--overlay)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--primary-500)]"
            />
          </InputGroup>
        </TextField>

        <div className="flex justify-center w-full mt-2">
          <Button
            type="submit"
            variant="primary"
            isDisabled={isSending}
            isPending={isSending}
            fullWidth
          >
            {isSending ? tBtn('buttonSending') : tBtn('buttonSend')}
          </Button>
        </div>
      </form>

      <footer className="flex flex-col items-center gap-2 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)]">
            {t('Auth.register.alreadyAccount?')}
          </span>
          <Link
            href="/login"
            className="font-medium text-[var(--primary-400)] transition-colors hover:text-[var(--primary-300)] hover:underline"
          >
            {t('Auth.register.loginHere')}
          </Link>
        </div>
      </footer>
    </>
  );
}
