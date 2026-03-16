/**
 * @file register-form.tsx
 * @description
 * -----------------------------------------------------
 * Formulario de registro de nuevos usuarios
 * -----------------------------------------------------
 * @version 0.0.1a
 * @created 2026-02-03



 */

'use client';

import { Button, InputGroup, Label, TextField } from '@heroui/react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { register } from '../actions';
import { RegisterFormState } from '../types';

const initialState: RegisterFormState = {
  mail: '',
  firstName: '',
  lastName: '',
  password: '',
  repeatPassword: '',
};

/**
 * Formulario de registro de nuevos usuarios.
 *
 * Permite a los usuarios crear una cuenta proporcionando email, nombre
 * y contrasena. Al enviar, el backend crea una solicitud de verificacion
 * pendiente.
 */
export function RegisterForm() {
  const t = useTranslations();
  const tBtn = useTranslations('Buttons');
  const tAria = useTranslations('Aria.InputPassword');
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(register, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Cuando el registro es exitoso, mostrar toast y redirigir a login
  useEffect(() => {
    if (state.success && state.mail) {
      toast.success(
        (t as (key: string) => string)('Auth.register.verificationEmailSent'),
        { duration: 8000 },
      );
      router.push('/login');
    }
  }, [state.success, state.mail, router, t]);

  return (
    <form
      action={formAction}
      className="flex flex-col items-stretch gap-4 w-full max-w-[var(--container-xs)]"
    >
      {state.error && (
        <div className="py-3 px-4 rounded-[var(--rounded-sm)] bg-[var(--error-color-light)] text-[var(--error-color)] text-sm text-center">
          {state.error}
        </div>
      )}

      <TextField
        name="mail"
        isRequired
        defaultValue={state.mail}
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

      <TextField
        name="firstName"
        isRequired
        defaultValue={state.firstName}
        className="flex w-full flex-col gap-2"
      >
        <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
          {t('Labels.labelFirstName')}
        </Label>
        <InputGroup>
          <InputGroup.Input
            placeholder={t('Placeholders.placeholderFirstName')}
            className="w-full rounded-[var(--rounded-sm)] border border-[var(--border)] bg-[var(--overlay)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--primary-500)]"
          />
        </InputGroup>
      </TextField>

      <TextField
        name="lastName"
        isRequired
        defaultValue={state.lastName}
        className="flex w-full flex-col gap-2"
      >
        <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
          {t('Labels.labelLastName')}
        </Label>
        <InputGroup>
          <InputGroup.Input
            placeholder={t('Placeholders.placeholderLastName')}
            className="w-full rounded-[var(--rounded-sm)] border border-[var(--border)] bg-[var(--overlay)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--primary-500)]"
          />
        </InputGroup>
      </TextField>

      <TextField
        name="password"
        type={showPassword ? 'text' : 'password'}
        isRequired
        className="flex w-full flex-col gap-2"
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

      <TextField
        name="repeatPassword"
        type={showRepeatPassword ? 'text' : 'password'}
        isRequired
        className="flex w-full flex-col gap-2"
      >
        <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
          {t('Labels.labelRepeatPassword')}
        </Label>
        <InputGroup className="relative">
          <InputGroup.Input
            placeholder={t('Placeholders.placeholderRepeatPassword')}
            className="w-full rounded-[var(--rounded-sm)] border border-[var(--border)] bg-[var(--overlay)] px-4 py-3 pr-10 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--primary-500)]"
          />
          <InputGroup.Suffix className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2">
            <button
              type="button"
              onClick={() => setShowRepeatPassword((p) => !p)}
              className="flex cursor-pointer border-none bg-transparent p-0"
              aria-label={
                showRepeatPassword
                  ? tAria('hidePassword')
                  : tAria('showPassword')
              }
            >
              {showRepeatPassword ? (
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
        >
          {isPending ? tBtn('buttonCreating') : tBtn('buttonRegister')}
        </Button>
      </div>
    </form>
  );
}
