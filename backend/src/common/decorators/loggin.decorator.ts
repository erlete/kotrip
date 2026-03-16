import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para habilitar el registro de auditoria en un endpoint especifico.
 *
 * Cuando se aplica a un controlador o metodo, activa el interceptor de logging
 * para registrar la informacion de la peticion HTTP y la respuesta.
 */

export const ENABLE_LOGGING = 'enable_logging';
export const EnableLogging = () => SetMetadata(ENABLE_LOGGING, true);
