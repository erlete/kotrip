/**
 * @file verify-email-form.tsx
 * @description
 * Formulario de verificacion de email mediante codigo OTP de 6 digitos,
 * utilizado durante el proceso de registro de usuarios.
 */

'use client';

import { InputOTP, OTPGroup, OTPSlot } from '@/components/ui/input-otp';
import { Link } from '@/features/i18n';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { verifyEmail, VerifyEmailFormState } from '../actions';

/**
 * Props para el formulario de verificación de email.
 */
interface VerifyEmailFormProps {
  /** Email del usuario a verificar (recibido como query param). */
  email: string;
}

/**
 * Formulario de verificación de email.
 *
 * Permite al usuario introducir el código de 6 dígitos recibido
 * por correo electrónico durante el proceso de registro.
 */
export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const t = useTranslations();
  const tBtn = useTranslations('Buttons');

  const initialState: VerifyEmailFormState = {
    email,
    code: '',
  };

  const [state, formAction, isPending] = useActionState(
    verifyEmail,
    initialState,
  );

  const errorMessage = state.error ? t('Auth.invalidCredentials') : undefined;

  const [code, setCode] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      setCode('');
    }
  }, [state]);

  // Mostrar resultado de la verificación
  if (state.success) {
    return (
      <div className="flex flex-col items-stretch gap-4 w-full max-w-[var(--container-xs)]">
        <div className="py-3 px-4 rounded-[var(--rounded-sm)] bg-[var(--success-color-light)] text-[var(--success-color)] text-sm text-center">
          {state.admissionResult === 'ADMITTED' && (
            <>
              <p>{t('Auth.verifyEmail.admitted')}</p>
              <Link href="/login">
                <Button variant="primary">{tBtn('buttonLogin')}</Button>
              </Link>
            </>
          )}
          {state.admissionResult === 'PENDING' && (
            <p>{t('Auth.verifyEmail.pending')}</p>
          )}
          {state.admissionResult === 'REJECTED' && (
            <p>{t('Auth.verifyEmail.rejected')}</p>
          )}
        </div>
        {state.admissionResult !== 'ADMITTED' && (
          <div className="flex flex-col items-stretch gap-2 w-full mt-2 [&_a]:w-full [&_a]:flex [&_a]:justify-center">
            <Link href="/login">
              <Button variant="primary">{tBtn('buttonLogin')}</Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col items-stretch gap-4 w-full max-w-[var(--container-xs)]"
    >
      {/* Campo oculto con el email */}
      <input
        type="hidden"
        name="email"
        value={email}
      />

      <div className="w-full">
        <InputOTP
          maxLength={6}
          required
          value={code}
          onChange={setCode}
          onAutoSend={() => {
            formRef.current?.requestSubmit();
          }}
          variant="separated"
        >
          <OTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <OTPSlot
                key={index}
                index={index}
              />
            ))}
          </OTPGroup>
        </InputOTP>

        <input
          type="hidden"
          name="code"
          value={code}
        />
      </div>

      <div className="flex flex-col items-stretch gap-2 w-full mt-2 [&_a]:w-full [&_a]:flex [&_a]:justify-center">
        <Button
          type="submit"
          variant="primary"
          isDisabled={isPending}
          isPending={isPending}
        >
          {isPending ? tBtn('buttonVerifying') : tBtn('buttonVerify')}
        </Button>
      </div>
    </form>
  );
}
