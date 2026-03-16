import { Language, Role } from '@kotrip/data';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

/**
 * Clase privada para declarar datos de ejemplo. NO EXPORTAR.
 */
class UserDTO {
  @ApiPropertyOptional({
    description: 'URL del avatar del usuario',
    example:
      '/api/storage/user-550e8400-e29b-41d4-a716-446655440000/public/avatar.png',
    nullable: true,
    type: String,
  })
  @IsString()
  @IsOptional()
  avatarURL: string;

  @ApiProperty({ example: 'correo@hosting.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'UUID único del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ enum: Language, enumName: 'Language', example: Language.ES })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @ApiProperty({
    example: '2024-01-16T10:30:00.000Z',
    nullable: true,
    type: String,
  })
  @IsString()
  lastLogIn: string | null;

  @ApiProperty({ enum: Role, enumName: 'Role', example: Role.USER })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @ApiProperty({
    description: 'Indica si el usuario tiene habilitada la autenticación 2FA.',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  twoFactorEnabled: boolean;

  @ApiProperty({ example: 'Carlos' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'García López' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  validated: boolean;
}

/**
 * Clase privada para declarar datos de ejemplo. NO EXPORTAR.
 */
class BackendTokensDTO {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNvcnJlb0Bob3N0aW5nLmNvbSIsInJvbGUiOiJmcmVlIiwiaWF0IjoxNzI4MDc3NzEzLCJleHAiOjE3MjgwNzc4MzN9.Dh2Erof1boThJcO3fh_Prh4AJf4TftYWoYsw_Dm65Yo',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNvcnJlb0Bob3N0aW5nLmNvbSIsInJvbGUiOiJmcmVlIiwiaWF0IjoxNzI4MDc3NzEzLCJleHAiOjE4MTQ0Nzc3MTN9.Xn4SIDaxiuzustHoVoQu3qWaA3q1W4Gh8JJFiZhtEjk',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

/**
 * ### LoginOutputDto
 *
 * DTO para controlar los datos de salida al front-end que arrojará el back-end al resolver Correctamente
 * un inicio de sesión. Estos datos están relacionados con la entidad de usuario y con la interfaz de login.
 * Si se modifica algo en estas clases, se debe modificar aquí también para asegurar la correcta devolución
 * de datos.
 *
 * @version     1.0.0a




 * @see         [LoginInterface](../interfaces/login.interface.ts)
 * @see         [User](../../user/entities/user.entity.ts)
 */
export class LoginOutputDto {
  @ApiProperty({ type: BackendTokensDTO })
  backendTokens: BackendTokensDTO;

  @ApiProperty({ type: UserDTO })
  user: UserDTO;
}
