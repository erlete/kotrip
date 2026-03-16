import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Módulo de verificación de estado del servicio.
 *
 * Registra el controlador de health check, cuyo endpoint es utilizado
 * por Docker y por sistemas de orquestación para comprobar la disponibilidad
 * del backend antes de enrutar tráfico hacia él o de arrancar servicios
 * dependientes.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
