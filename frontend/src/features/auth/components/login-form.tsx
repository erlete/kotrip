/**
 * @file login-form.tsx
 * @description
 * -----------------------------------------------------
 * Formulario de inicio de sesion
 * -----------------------------------------------------
 * @version 0.0.2
 * @created 2025-11-24
 * @modified 2026-02-03



 */

'use client';

import { Button, InputGroup, Label, TextField } from '@heroui/react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { login } from '../actions';

const initialState = {
  email: '',
  password: '',
  error: '',
  reason: undefined as string | undefined,
};
/** Claves de traduccion para errores de status de usuario. */
const STATUS_ERROR_KEYS = {
  BLOCKED: 'Auth.loginStatusError.BLOCKED',
  LOGIN_DISABLED: 'Auth.loginDisabled',
  PENDING_REVIEW: 'Auth.loginStatusError.PENDING_REVIEW',
  PENDING_VERIFICATION: 'Auth.loginStatusError.PENDING_VERIFICATION',
  REJECTED: 'Auth.loginStatusError.REJECTED',
} as const;

/**
 * Formulario de inicio de sesion.
 *
 * Permite a los usuarios autenticarse con correo electronico y contrasena.
 * Si el usuario tiene 2FA habilitado, sera redirigido a la pagina de verificacion.
 */
export function LoginForm() {
  const t = useTranslations();
  const tBtn = useTranslations('Buttons');
  const tAria = useTranslations('Aria.InputPassword');
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  // Resolver mensaje de error: si hay reason (status), usar traduccion especifica
  type StatusKey = keyof typeof STATUS_ERROR_KEYS;
  const statusKey =
    state?.reason && state.reason in STATUS_ERROR_KEYS
      ? STATUS_ERROR_KEYS[state.reason as StatusKey]
      : undefined;
  const errorMessage = statusKey
    ? t(statusKey)
    : state?.error
      ? t('Auth.invalidCredentials')
      : undefined;

  useEffect(() => {
    if (!errorMessage) return;
    if (state?.reason === 'PENDING_VERIFICATION' && state?.email) {
      const verifyUrl = `/register/otp?mail=${encodeURIComponent(state.email)}`;
      toast.info(
        <span>
          {errorMessage}{' '}
          <a
            href={verifyUrl}
            className="underline"
          >
            {t('Auth.loginStatusError.verifyEmailLink')}
          </a>
        </span>,
      );
    } else {
      toast.error(errorMessage);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="flex flex-col items-stretch gap-4 w-full max-w-[var(--container-xs)]"
      data-testid="login-form"
    >
      <TextField
        name="email"
        isRequired
        defaultValue={state?.email}
        className="flex w-full flex-col gap-2"
        data-testid="login-form__email-input"
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

      <TextField
        name="password"
        type={showPassword ? 'text' : 'password'}
        isRequired
        className="flex w-full flex-col gap-2"
        data-testid="login-form__password-input"
      >
        <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
          {t('Labels.labelPassword')}
        </Label>
        <InputGroup className="relative">
          <InputGroup.Input
            placeholder={t('Placeholders.placeholderPassword')}
            className="w-full rounded-[var(--rounded-sm)] border border-[var(--border)] bg-[var(--overlay)] px-4 py-3 pr-10 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--primary-500)]"
          />
          <InputGroup.Suffix className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2">
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="flex cursor-pointer border-none bg-transparent p-0"
              aria-label={
                showPassword ? tAria('hidePassword') : tAria('showPassword')
              }
            >
              {showPassword ? (
                <EyeOff className="size-4 text-[var(--text-muted)]" />
              ) : (
                <Eye className="size-4 text-[var(--text-muted)]" />
              )}
            </button>
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>

      <div className="flex justify-center w-full mt-2">
        <Button
          type="submit"
          variant="primary"
          isDisabled={isPending}
          isPending={isPending}
          fullWidth
          data-testid="login-form__submit-button"
        >
          {isPending
            ? tBtn('buttonStartingSession')
            : tBtn('buttonStartSession')}
        </Button>
      </div>
    </form>
  );
}
