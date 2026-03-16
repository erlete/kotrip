import { Role } from '@kotrip/data';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

/**
 * DTO de respuesta con la informacion basica del perfil de un usuario.
 *
 * Contiene el correo electronico y el rol del usuario.
 *
 * @see UserOutput Interfaz interna correspondiente.
 */
export class UserOutputDto {
  @ApiProperty({ example: 'correo1@hosting.com' })
  @IsEmail()
  @IsNotEmpty()
  mail: string;

  @ApiProperty({ enum: Role, enumName: 'Role', example: Role.USER })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
