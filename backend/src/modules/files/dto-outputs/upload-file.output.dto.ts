import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO de respuesta para la subida de un archivo.
 *
 * Contiene el nombre del archivo, su identificador (etag de MinIO) y el
 * estado de la operacion. Debe mantenerse sincronizado con UploadFileInterface.
 *
 * @see UploadFileInterface Interfaz interna correspondiente.
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
