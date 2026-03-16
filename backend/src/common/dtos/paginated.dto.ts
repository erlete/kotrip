import { ApiProperty } from '@nestjs/swagger';

/**
 * ### PaginatedResponse
 *
 * Clase generica para estructurar las respuestas de endpoint que devuelve datos paginados.
 * Permite utilizar la misma estructura para diferentes tipos de datos.
 *
 * @version     1.0.0a





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
