import { z } from 'zod';

/**
 * Esquema de validación para el formulario de contacto de soporte.
 *
 * Valida los campos de nombre, apellidos, correo electrónico,
 * teléfono y mensaje del formulario de soporte técnico.
 *
 * @param t - Función de traducción para los mensajes de error
 * @returns Esquema Zod con validación completa del formulario
 */
export const SupportContactSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(3, { message: t('nameMinLength3') }),
    surname: z.string().min(3, { message: t('surnameMinLength3') }),
    mail: z.string().email({ message: t('validEmail') }),
    phone: z.string().regex(/^(\+\d{1,3}[- ]?)?\d{9,}$/, {
      message: t('phoneFormat'),
    }),
    message: z
      .string()
      .min(10, {
        message: t('messageMinLength'),
      })
      .max(2000, {
        message: t('messageMaxLength'),
      }),
  });

export type SupportContact = z.infer<ReturnType<typeof SupportContactSchema>>;
