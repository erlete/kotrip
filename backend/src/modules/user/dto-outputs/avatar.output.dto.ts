import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

/**
 * ### AvatarOutputDTO
 *
 * DTO para controlar los datos de salida al front-end que arrojará el back-end al subir
 * un avatar para el usuario
 *
 * @version     1.0.0a




 * @see         [AvatarOutput](../interfaces/avatar.output.interface.ts)
 */
export class AvatarOutputDTO {
  @ApiProperty({ example: 'avatar.png' })
  @IsNotEmpty()
  file_name: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
