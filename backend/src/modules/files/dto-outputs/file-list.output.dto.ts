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
 * DTO de respuesta para la lista de archivos y directorios.
 *
 * Representa un elemento del listado de archivos almacenados en MinIO,
 * ya sea un archivo o un directorio. Debe mantenerse sincronizado con FileListInterface.
 *
 * @see FileListInterface Interfaz interna correspondiente.
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
