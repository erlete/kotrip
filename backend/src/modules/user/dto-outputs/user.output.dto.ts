import { Role } from '@kotrip/data';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

/**
 * ### UserOutputDto
 *
 * DTO para controlar los datos de salida al front-end que arrojará el back-end al obtener la información
 * de un usuario. Estos datos están relacionados con la interfaz de usuario.
 * Si se modifica algo en esta interfaz, se debe modificar aquí también para asegurar la correcta devolución
 * de datos.
 *
 * @version     1.0.0a




 * @see         [Role](../../common/enums/role.enum.ts)
 * @see         [UserOutput](../interfaces/user.output.interface.ts)
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
