import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { Role } from '@kotrip/data';
import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Locality } from './entities/locality.entity';
import { LocalityService } from './locality.service';

/**
 * Controlador de localidades.
 *
 * Expone un unico endpoint de solo lectura para buscar municipios de Espana
 * por prefijo de nombre. Disenado para alimentar un campo de autocompletado
 * en el frontend.
 *
 * @remarks
 * Los datos provienen de la tabla de referencia del INE y no se modifican
 * desde este controlador.
 */
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'No autorizado.' })
@ApiTags('locality - Localidades de España')
@Controller('locality')
export class LocalityController {
  /**
   * Constructor del controlador de localidades.
   *
   * @param localityService  Servicio de localidades inyectado.
   */
  constructor(private readonly localityService: LocalityService) {}

  /**
   * Busca localidades cuyo nombre comience por el texto proporcionado.
   *
   * Devuelve un maximo de `limit` resultados ordenados alfabeticamente.
   * Pensado para alimentar un componente de autocompletado.
   *
   * @param search  Texto de busqueda (prefijo del nombre del municipio).
   * @param limit   Numero maximo de resultados (por defecto 10, maximo 50).
   * @returns       Lista de localidades que coinciden con el prefijo.
   */
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Busca localidades por prefijo de nombre (autocompletado)',
  })
  @ApiResponse({
    description: 'Lista de localidades que coinciden con el prefijo',
    status: 200,
    type: [Locality],
  })
  @ApiResponse({ description: 'Parametros de consulta invalidos', status: 400 })
  @ApiQuery({
    description: 'Prefijo del nombre del municipio a buscar',
    example: 'Vig',
    name: 'search',
    required: true,
    type: String,
  })
  @ApiQuery({
    description: 'Numero maximo de resultados (por defecto 10, maximo 50)',
    example: 10,
    name: 'limit',
    required: false,
    type: Number,
  })
  @Get()
  async search(
    @Query('search') search: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<Locality[]> {
    return this.localityService.findByNamePrefix(search, limit);
  }
}
