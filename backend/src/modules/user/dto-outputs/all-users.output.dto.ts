import { Language, Role, UserStatus } from '@kotrip/data';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

/**
 * Clase para declarar datos de usuario de salida.
 */
export class UserInfoDTO {
  @ApiPropertyOptional({
    example: 'https://example.com/kotrip/users/550e8400/avatars/avatar.webp',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: '15/1/2025, 12:20:12' })
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty({ example: 'correo1@hosting.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ enum: Language, enumName: 'Language', example: Language.ES })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @ApiProperty({ example: 'Carlos' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'García López' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ enum: Role, enumName: 'Role', example: Role.ADMIN })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @ApiProperty({
    description:
      'Indica si el usuario tiene habilitada la autenticación de dos factores.',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  twoFactorEnabled: boolean;

  @ApiProperty({
    description: 'Estado del usuario en la plataforma.',
    enum: UserStatus,
    enumName: 'UserStatus',
    example: UserStatus.APPROVED,
  })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;

  @ApiPropertyOptional({
    description: 'Fecha del último cambio de estado.',
    example: '2025-01-15T12:20:12.000Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastStatusChange?: string | null;
}

/**
 * ### AllUsersOutputDto
 *
 * DTO para controlar los datos de salida al front-end que arrojará el back-end al obtener la lista
 * de usuarios. Estos datos están relacionados con la interfaz de usuarios.
 * Si se modifica algo en esta interfaz, se debe modificar aquí también para asegurar la correcta devolución
 * de datos.
 *
 * @version     1.0.0a




 * @see         [AllUsersOutput](../interfaces/all-users.output.interface.ts)
 */
export class AllUsersOutputDto {
  @ApiProperty({
    description: 'Lista de usuarios',
    isArray: true,
    type: () => UserInfoDTO,
  })
  @ValidateNested({ each: true })
  @Type(() => UserInfoDTO)
  user: UserInfoDTO[];
}
