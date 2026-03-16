import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

/**
 * ### UploadFileOutputDto
 *
 * DTO para controlar los datos de salida al front-end que arrojará el back-end al subir un fichero.
 * Estos datos están relacionados con la interfaz de subida de ficheros.
 * Si se modifica algo en la interfaz, se debe modificar aquí también para asegurar la devolución
 * de datos.
 *
 * @version     1.0.0a




 * @see         [UploadFileInterface](../interfaces/upload-file.interface.ts)
 */
export class UploadFileOutputDto {
  @ApiProperty({ example: 'archivo_ejemplo.txt' })
  @IsString()
  @IsNotEmpty()
  file_name: string;

  @ApiProperty({
    description: 'File ID (MinIO etag)',
    example: '5f9b3b3b4b3b4b3b4b3b4b3b',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
