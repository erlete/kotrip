import { ApiProperty } from '@nestjs/swagger';

/**
 * Clase generica para estructurar respuestas paginadas.
 *
 * Encapsula la lista de resultados junto con la informacion de paginacion
 * (pagina actual, tamano de pagina, total de elementos y total de paginas).
 */
export class PaginatedResponse<T> {
  list: T[];
  @ApiProperty({ example: 1 })
  page: number;
  @ApiProperty({ example: 10 })
  pageSize: number;
  @ApiProperty({ example: 100 })
  total: number;
  @ApiProperty({ example: 5 })
  totalPages?: number;
}
