import { ActiveUser } from '@/common/decorators/active-user.decorator';
import { ThrotterGuardErrorDto } from '@/common/dtos/throttler-guard.dto';
import { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { Language, Role } from '@kotrip/data';
import {
  Body,
  Controller,
  Headers,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request as ExpressRequest } from 'express';
import { Auth } from './decorators/auth.decorator';
import { LoginOutputDto } from './dto-outputs/login.output.dto';
import { NewRegisterOutput } from './dto-outputs/new-register.output.dto';
import { LoginDto } from './dto/login.dto';
import { NewRegisterDto } from './dto/new-register.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { VerifyEmailDto } from './dto/verify.dto';
import { RefreshGuard } from './guard/refresh.guard';
import { AuthService } from './services/auth.service';

/**
 * Controlador de autenticacion de usuarios.
 *
 * Permite registrar usuarios, verificar el email, iniciar sesion
 * y gestionar tokens JWT de acceso y refresco.
 *
 * @see AuthService Servicio que implementa la logica de autenticacion.
 */
@ApiTags('auth - Autenticación de usuarios')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  /**
   * El constructor del controlador solo tiene dentro el servicio del modulo, no tiene dependencias externas.
   *
   * @param authService   Servicio del mismo módulo que el controlador
   */
  constructor(private authService: AuthService) {}

  /**
   * Inicia sesión en la plataforma. Si las credenciales son correctas, devuelve tokens JWT.
   *
   * @param loginDto      Objeto estructurado con la información del usuario para el login
   * @returns             Tokens JWT de acceso y refresco
   */
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary:
      'Iniciar sesión en la plataforma. Devuelve "accessToken" si el inicio es correcto',
  })
  @ApiResponse({
    description: 'Inicio de sesión exitoso',
    status: 200,
    type: LoginOutputDto,
  })
  @ApiResponse({
    description: 'Credenciales incorrectas o falta email/contraseña',
    status: 400,
  })
  @ApiResponse({
    description: 'Demasiadas solicitudes',
    status: 429,
    type: ThrotterGuardErrorDto,
  })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * Registra un nuevo usuario en la plataforma. El usuario se crea directamente con estado APPROVED.
   *
   * @param registerDto   Objeto estructurado con la información del usuario para el registro
   * @param acceptLanguage Cabecera con el idioma preferido del usuario
   * @returns             Información del registro
   */
  @Post('register')
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'Registro de usuario nuevo en la plataforma',
  })
  @ApiResponse({
    description: 'Registro exitoso',
    status: 201,
    type: NewRegisterOutput,
  })
  @ApiResponse({ description: 'Credenciales incorrectas', status: 400 })
  @ApiResponse({ description: 'El correo ya está en uso', status: 409 })
  @ApiResponse({
    description: 'Demasiadas solicitudes',
    status: 429,
    type: ThrotterGuardErrorDto,
  })
  @ApiHeader({
    description: 'Preferencia de idioma del usuario',
    enum: [
      ...Object.values(Language),
      'en-US',
      'en-GB',
      'en-CA',
      'en-AU',
      'en-NZ',
      'en-IE',
      'en-ZA',
      'en-IN',
      'es-ES',
      'es-MX',
      'es-AR',
      'es-CO',
      'es-CL',
      'es-PE',
      'es-VE',
      'es-EC',
      'es-GT',
      'es-CR',
      'es-PA',
      'es-DO',
      'es-SV',
      'es-HN',
      'es-NI',
      'es-PR',
      'es-UY',
      'es-PY',
      'es-BO',
      'es-CU',
      'gl-ES',
    ],
    name: 'accept-language',
  })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  async register(
    @Body() registerDto: NewRegisterDto,
    @Headers('accept-language') acceptLanguage: string,
  ) {
    return await this.authService.register(
      registerDto,
      this.parseLanguageFromHeader(acceptLanguage),
    );
  }

  /**
   * Endpoint público para verificar el email de un usuario registrado.
   *
   * @param dto Objeto con email y código de verificación de 6 dígitos.
   * @returns Resultado de la verificación.
   */
  @Post('verify-email')
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary:
      'Verifica el email de un usuario mediante código de 6 dígitos enviado por correo',
  })
  @ApiResponse({
    description: 'Verificación exitosa.',
    status: 201,
  })
  @ApiResponse({ description: 'Código inválido o expirado', status: 401 })
  @ApiResponse({
    description: 'Usuario o verificación no encontrada',
    status: 404,
  })
  @ApiResponse({
    description: 'Demasiadas solicitudes',
    status: 429,
    type: ThrotterGuardErrorDto,
  })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return await this.authService.verifyEmail(dto.email, dto.code);
  }

  /**
   * Renueva el token de sesión usando el token de refresco.
   *
   * @param req           Objeto con la información encapusalda del usuario
   * @returns             Objeto con nuevos tokens
   */
  @UseGuards(RefreshGuard)
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresca el token de sesión para el usuario activo',
  })
  @ApiForbiddenResponse({ description: 'Token renovado' })
  @ApiResponse({
    description: 'Tokens de sesión renovados exitosamente',
    status: 200,
    type: LoginOutputDto,
  })
  async refreshToken(
    @Request() req: ExpressRequest & { user: UserActiveInterface },
  ) {
    return await this.authService.refreshToken(req.user);
  }

  /**
   * Actualiza parcialmente la sesión/perfil del usuario y devuelve un nuevo token.
   *
   * @param updateSessionDto  DTO con los campos a actualizar
   * @param user              Usuario activo obtenido del token
   * @returns                 LoginOutputDto con tokens actualizados
   */
  @Auth(Role.USER, Role.ADMIN)
  @Patch('session')
  @ApiOperation({
    summary:
      'Actualiza parcialmente la sesión/perfil del usuario (idioma, nombre, email, contraseña, etc.) y devuelve un nuevo token',
  })
  @ApiResponse({
    description: 'Sesión actualizada exitosamente',
    status: 200,
    type: LoginOutputDto,
  })
  @ApiResponse({
    description: 'Usuario no encontrado o datos inválidos',
    status: 400,
  })
  @ApiResponse({
    description: 'No autorizado',
    status: 401,
  })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  async updateSession(
    @Body() updateSessionDto: UpdateSessionDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return await this.authService.updateSession(user, updateSessionDto);
  }

  /**
   * Extrae el idioma preferido del usuario a partir de la cabecera `Accept-Language`.
   *
   * @param acceptLanguage  Valor de la cabecera HTTP `Accept-Language`.
   * @returns               Código de idioma normalizado de la plataforma.
   */
  private parseLanguageFromHeader(acceptLanguage: string): Language {
    const supported = Object.values(Language);
    const codes =
      acceptLanguage?.split(',').map((l) => l.split(';')[0].trim()) ?? [];
    for (const code of codes) {
      const match = supported.find((lang) => code.startsWith(lang));
      if (match) return match;
    }
    return Language.ES;
  }
}
