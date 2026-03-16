import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO de respuesta con la URL de descarga de un archivo.
 *
 * Contiene la URL prefirmada generada por MinIO para la descarga del archivo.
 * Debe mantenerse sincronizado con FileUrl.
 *
 * @see FileUrl Interfaz interna correspondiente.
 */
export class FileUrlOut {
  @ApiProperty({
    example:
      'http://localhost:9000/examplebucket1/1-plantilladebacktestingcompany/cap-ejemplo.png',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}
