'use client';

import { useSession } from '@/features/auth';
import {
  Button,
  FieldError,
  InputGroup,
  Label,
  TextArea,
  TextField,
} from '@heroui/react';
import {
  Headset,
  Mail,
  MessageSquareText,
  Phone,
  RotateCcw,
  Send,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/** Estilos base reutilizables para los campos de texto del formulario. */
const INPUT_CLASSES =
  'w-full rounded-[var(--rounded-sm)] border border-[var(--border)] bg-[var(--overlay)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--primary-500)]';
const INPUT_ICON_CLASSES = INPUT_CLASSES.replace('px-4', 'pl-8 pr-4');
const INPUT_ERROR_CLASSES =
  'border-[var(--error-500)]! bg-[rgba(232,84,84,0.06)]!';
const LABEL_CLASSES = 'text-sm font-semibold text-[var(--text-subtitle)]';
const LABEL_ERROR_CLASSES = 'text-[var(--error-500)]!';

/**
 * Vista de soporte técnico.
 *
 * Muestra un formulario de contacto que permite al usuario enviar una consulta
 * al equipo de soporte. El envío se simula con un retardo de 1.5 segundos y
 * muestra una notificación de éxito mediante sonner.
 *
 * Los campos de nombre y correo electrónico se rellenan automáticamente
 * a partir de los datos de sesión del usuario autenticado.
 *
 * Utiliza los componentes nativos de HeroUI v3 ({@link TextField},
 * {@link InputGroup}, {@link Label}, {@link TextArea}, {@link FieldError})
 * para la composición de campos del formulario.
 */
export function SupportView() {
  const t = useTranslations('Support');
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: session?.firstName ?? '',
    lastName: session?.lastName ?? '',
    email: session?.email ?? '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);

  /** Actualiza un campo del formulario y limpia su error. */
  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  /** Valida los campos del formulario antes de enviar. */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (form.name.trim().length < 2) {
      newErrors.name = t('checkFields');
    }
    if (form.lastName.trim().length < 2) {
      newErrors.lastName = t('checkFields');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t('checkFields');
    }
    if (
      form.phone.trim() &&
      !/^(\+\d{1,3}[- ]?)?\d{9,}$/.test(form.phone.replace(/\s/g, ''))
    ) {
      newErrors.phone = t('invalidPhone');
    }
    if (form.subject.trim().length < 3) {
      newErrors.subject = t('checkFields');
    }
    if (form.message.trim().length < 10) {
      newErrors.message = t('checkFields');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Restablece el formulario a sus valores iniciales. */
  const handleReset = () => {
    setForm({
      name: session?.firstName ?? '',
      lastName: session?.lastName ?? '',
      email: session?.email ?? '',
      phone: '',
      subject: '',
      message: '',
    });
    setErrors({});
  };

  /**
   * Simula el envío del formulario de soporte.
   * Muestra un retardo de 1.5 segundos y un toast de éxito.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSending(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success(t('successTitle'), {
      description: t('successDescription'),
      duration: 6000,
    });

    setIsSending(false);
    handleReset();
  };

  return (
    <div className="flex flex-col gap-[var(--spacing-lg)] py-10 px-8 w-full mx-auto max-w-[72rem]">
      {/* Encabezado de página */}
      <header className="relative flex items-center justify-between gap-[var(--spacing-md)] p-[var(--spacing-xl)] px-10 bg-gradient-to-br from-[var(--primary-800)] via-[var(--primary-700)] to-[var(--primary-600)] rounded-[var(--rounded-xl)] border border-[rgba(42,168,148,0.15)] overflow-hidden">
        <div className="absolute -top-[40%] -right-[10%] w-80 h-80 bg-[radial-gradient(circle,rgba(42,168,148,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-[50%] left-[20%] w-64 h-64 bg-[radial-gradient(circle,rgba(42,168,148,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-[1] flex flex-col gap-[var(--spacing-xs)]">
          <h1 className="text-[1.75rem] font-bold text-white m-0 tracking-tight leading-tight">
            {t('title')}
          </h1>
          <p className="text-base text-white/75 m-0">{t('description')}</p>
        </div>
        <div className="relative z-[1] w-[72px] h-[72px] flex items-center justify-center bg-white/[0.08] rounded-full shrink-0">
          <Headset
            className="text-white/90"
            size={36}
            strokeWidth={1.5}
          />
        </div>
      </header>

      {/* Formulario de contacto */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-5 max-md:grid-cols-1"
        noValidate
      >
        {/* Nombre */}
        <TextField
          name="name"
          isRequired
          isInvalid={!!errors.name}
          value={form.name}
          onChange={(v) => updateField('name', v)}
          className="flex w-full flex-col gap-2"
        >
          <Label
            className={`${LABEL_CLASSES} ${errors.name ? LABEL_ERROR_CLASSES : ''}`}
          >
            {t('name')}
          </Label>
          <InputGroup>
            <InputGroup.Prefix>
              <User className="size-4 text-[var(--text-muted)]" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder={t('namePlaceholder')}
              className={`${INPUT_ICON_CLASSES} ${errors.name ? INPUT_ERROR_CLASSES : ''}`}
            />
          </InputGroup>
          {errors.name && (
            <FieldError className="text-sm text-[var(--error-500)]">
              {errors.name}
            </FieldError>
          )}
        </TextField>

        {/* Apellidos */}
        <TextField
          name="lastName"
          isRequired
          isInvalid={!!errors.lastName}
          value={form.lastName}
          onChange={(v) => updateField('lastName', v)}
          className="flex w-full flex-col gap-2"
        >
          <Label
            className={`${LABEL_CLASSES} ${errors.lastName ? LABEL_ERROR_CLASSES : ''}`}
          >
            {t('lastName')}
          </Label>
          <InputGroup>
            <InputGroup.Prefix>
              <User className="size-4 text-[var(--text-muted)]" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder={t('lastNamePlaceholder')}
              className={`${INPUT_ICON_CLASSES} ${errors.lastName ? INPUT_ERROR_CLASSES : ''}`}
            />
          </InputGroup>
          {errors.lastName && (
            <FieldError className="text-sm text-[var(--error-500)]">
              {errors.lastName}
            </FieldError>
          )}
        </TextField>

        {/* Correo electrónico */}
        <TextField
          name="email"
          type="email"
          isRequired
          isInvalid={!!errors.email}
          value={form.email}
          onChange={(v) => updateField('email', v)}
          className="flex w-full flex-col gap-2"
        >
          <Label
            className={`${LABEL_CLASSES} ${errors.email ? LABEL_ERROR_CLASSES : ''}`}
          >
            {t('email')}
          </Label>
          <InputGroup>
            <InputGroup.Prefix>
              <Mail className="size-4 text-[var(--text-muted)]" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder={t('mailPlaceholder')}
              className={`${INPUT_ICON_CLASSES} ${errors.email ? INPUT_ERROR_CLASSES : ''}`}
            />
          </InputGroup>
          {errors.email && (
            <FieldError className="text-sm text-[var(--error-500)]">
              {errors.email}
            </FieldError>
          )}
        </TextField>

        {/* Teléfono */}
        <TextField
          name="phone"
          type="tel"
          isInvalid={!!errors.phone}
          value={form.phone}
          onChange={(v) => updateField('phone', v)}
          className="flex w-full flex-col gap-2"
        >
          <Label
            className={`${LABEL_CLASSES} ${errors.phone ? LABEL_ERROR_CLASSES : ''}`}
          >
            {t('phone')}
          </Label>
          <InputGroup>
            <InputGroup.Prefix>
              <Phone className="size-4 text-[var(--text-muted)]" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder={t('phonePlaceholder')}
              className={`${INPUT_ICON_CLASSES} ${errors.phone ? INPUT_ERROR_CLASSES : ''}`}
            />
          </InputGroup>
          {errors.phone && (
            <FieldError className="text-sm text-[var(--error-500)]">
              {errors.phone}
            </FieldError>
          )}
        </TextField>

        {/* Asunto - ancho completo */}
        <TextField
          name="subject"
          isRequired
          isInvalid={!!errors.subject}
          value={form.subject}
          onChange={(v) => updateField('subject', v)}
          className="flex w-full flex-col gap-2 col-span-2 max-md:col-span-1"
        >
          <Label
            className={`${LABEL_CLASSES} ${errors.subject ? LABEL_ERROR_CLASSES : ''}`}
          >
            {t('subject')}
          </Label>
          <InputGroup>
            <InputGroup.Prefix>
              <MessageSquareText className="size-4 text-[var(--text-muted)]" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder={t('subjectPlaceholder')}
              className={`${INPUT_ICON_CLASSES} ${errors.subject ? INPUT_ERROR_CLASSES : ''}`}
            />
          </InputGroup>
          {errors.subject && (
            <FieldError className="text-sm text-[var(--error-500)]">
              {errors.subject}
            </FieldError>
          )}
        </TextField>

        {/* Mensaje */}
        <TextField
          name="message"
          isRequired
          isInvalid={!!errors.message}
          value={form.message}
          onChange={(v) => updateField('message', v)}
          className="flex w-full flex-col gap-2 col-span-2 max-md:col-span-1"
        >
          <Label
            className={`${LABEL_CLASSES} ${errors.message ? LABEL_ERROR_CLASSES : ''}`}
          >
            {t('message')}
          </Label>
          <TextArea
            placeholder={t('messagePlaceholder')}
            rows={5}
            className={`${INPUT_CLASSES} resize-y min-h-[8rem] ${errors.message ? INPUT_ERROR_CLASSES : ''}`}
          />
          {errors.message && (
            <FieldError className="text-sm text-[var(--error-500)]">
              {errors.message}
            </FieldError>
          )}
        </TextField>

        {/* Acciones */}
        <div className="col-span-2 max-md:col-span-1 flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onPress={handleReset}
            isDisabled={isSending}
          >
            <RotateCcw size={15} />
            {t('resetForm')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isPending={isSending}
          >
            {!isSending && <Send size={15} />}
            {isSending ? t('sending') : t('buttonSend')}
          </Button>
        </div>
      </form>
    </div>
  );
}
