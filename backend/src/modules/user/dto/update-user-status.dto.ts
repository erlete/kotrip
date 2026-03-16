import { UserStatus } from '@kotrip/data';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

/**
 * DTO para actualizar el estado de un usuario.
 *
 * @remarks
 * Utilizado por administradores (ADMIN) para cambiar
 * el estado de un usuario en la plataforma.
 */
export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del usuario.',
    enum: UserStatus,
    enumName: 'UserStatus',
    example: UserStatus.BLOCKED,
  })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
}
