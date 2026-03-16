import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * ### FileOutputDto
 *
 * DTO para controlar los datos de salida al front-end que arrojará el back-end al obtener la lista de archivos.
 * Estos datos están relacionados con la interfaz de archivo.
 * Si se modifica algo en la interfaz, se debe modificar aquí también para asegurar la correcta devolución
 * de datos.
 *
 * FIXED: Changed structure to match FileListInterface (flat array instead of nested)
 * FIXED: Changed id type from number to string to match MinIO etag
 * FIXED: Made upload_date nullable for directories
 *
 * @version     1.0.1a




 * @see         [FileListInterface](../interfaces/file-list.interface.ts)
 */
export class FileOutputDto {
  @ApiProperty({
    description: 'File name (null for directories)',
    example: 'archivo_ejemplo1.txt',
    nullable: true,
    type: String,
  })
  @IsString()
  @IsOptional()
  file_name: string | null;

  @ApiProperty({
    description: 'File ID (MinIO etag)',
    example: '5f9b3b3b4b3b4b3b4b3b4b3b',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Whether this is a directory',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isDirectory: boolean;

  @ApiProperty({
    description: 'Full path in bucket',
    example: 'user123/documents/',
  })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024 * 8,
  })
  @IsNumber()
  @IsNotEmpty()
  size: number;

  @ApiProperty({
    description: 'Upload date (null for directories)',
    example: '2024-07-04T00:00:00.000Z',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @IsOptional()
  upload_date: Date | null;
}
