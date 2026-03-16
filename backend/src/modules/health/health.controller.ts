import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Controlador de verificación de estado del servicio.
 *
 * Expone un endpoint público y de bajo coste para comprobar si la aplicación
 * está operativa y lista para recibir tráfico. Es utilizado principalmente
 * por Docker Compose para gestionar el estado de salud del contenedor y
 * coordinar el orden de arranque de los servicios dependientes.
 *
 * El logging de Fastify está silenciado para esta ruta a fin de evitar
 * contaminación en los registros de la aplicación durante las comprobaciones
 * periódicas del orquestador.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  /**
   * Verifica que el servicio está en línea y operativo.
   *
   * @returns Un objeto con el campo `status` igual a `"ok"`.
   */
  @Get()
  @ApiOperation({ summary: 'Verificar el estado del servicio' })
  check(): { status: string } {
    return { status: 'ok' };
  }
}
