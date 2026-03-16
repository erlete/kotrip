import { SetMetadata } from '@nestjs/common';

/**
 * ### EnableLogging
 *
 * Este decorador se utiliza para habilitar el registro de auditoría en un endpoint específico.
 *
 * @version     1.0.0a




 */

export const ENABLE_LOGGING = 'enable_logging';
export const EnableLogging = () => SetMetadata(ENABLE_LOGGING, true);
