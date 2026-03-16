import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para los datos de salida al registrar un nuevo usuario.
 *
 * Indica que el registro fue exitoso y que se ha enviado un código
 * de verificación al correo electrónico proporcionado.
 *
 * @see User Entidad del usuario creado.
 * @see UserEmailVerification Entidad de verificación de email.
 */
export class NewRegisterOutput {
  @ApiProperty({
    description:
      'Correo electrónico al que se envió el código de verificación.',
    example: 'correo@hosting.com',
  })
  @IsString()
  @IsNotEmpty()
  mail: string;

  @ApiProperty({
    description: 'Resultado de la politica de admision aplicada al registro.',
    example: 'ADMITTED',
  })
  @IsString()
  @IsNotEmpty()
  admissionResult: 'ADMITTED' | 'PENDING_VERIFICATION';
}
