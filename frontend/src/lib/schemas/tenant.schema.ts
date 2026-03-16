import { z } from 'zod';

/**
 * Schema Zod para la creación de un tenant.
 *
 * Valida los campos requeridos para registrar un nuevo tenant
 * en la plataforma multi-tenant.
 */
export const createTenantSchema = z.object({
  tenantName: z
    .string()
    .min(1, 'El nombre del tenant es obligatorio')
    .max(255, 'El nombre del tenant no puede superar 255 caracteres'),
  productName: z
    .string()
    .min(1, 'El nombre del producto es obligatorio')
    .max(255, 'El nombre del producto no puede superar 255 caracteres'),
});

/**
 * Schema Zod para la actualización de un tenant.
 *
 * Todos los campos son opcionales, permitiendo actualizaciones parciales.
 */
export const updateTenantSchema = z.object({
  tenantName: z
    .string()
    .min(1, 'El nombre del tenant es obligatorio')
    .max(255, 'El nombre del tenant no puede superar 255 caracteres'),
  productName: z
    .string()
    .min(1, 'El nombre del producto es obligatorio')
    .max(255, 'El nombre del producto no puede superar 255 caracteres'),
  status: z.enum(['active', 'suspended', 'provisioning']),
});

/** Datos del formulario de creación de tenant. */
export type CreateTenantFormData = z.infer<typeof createTenantSchema>;

/** Datos del formulario de edición de tenant. */
export type UpdateTenantFormData = z.infer<typeof updateTenantSchema>;
