import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * ### FileUrlOut
 *
 * DTO para controlar los datos de salida al front-end que arrojará el back-end al generar una url para descargar un archivo.
 * Estos datos están relacionados con la interfaz url de un archivo.
 * Si se modifica algo en la interfaz, se debe modificar aquí también para asegurar la devolución
 * de datos.
 *
 * @version     1.0.0a




 * @see         [FileUrl](../interfaces/file-url.interface.ts)
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
