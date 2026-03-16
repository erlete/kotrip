import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

/**
 * DTO de respuesta para la subida del avatar de usuario.
 *
 * Contiene el nombre del archivo subido y el estado de la operacion.
 *
 * @see AvatarOutput Interfaz interna correspondiente.
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
