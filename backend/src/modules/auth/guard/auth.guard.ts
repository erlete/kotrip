import { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { UserStatus } from '@kotrip/data';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Guard de autenticación que valida el token JWT de acceso.
 *
 * Verifica que las peticiones incluyan un token Bearer válido y que el usuario
 * esté validado (2FA completado si está habilitado).
 *
 * @see {@link https://docs.nestjs.com/guards | NestJS Guards}
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /** Clave secreta para verificar tokens JWT */
  private readonly jwtSecret: string;

  /**
   * @param configService Servicio de configuración para obtener secretos
   * @param jwtService Servicio JWT para verificar tokens
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
  }

  /**
   * Valida si la petición puede ejecutarse verificando el token JWT.
   *
   * @param context Contexto de ejecución de NestJS
   * @returns `true` si el token es válido y el usuario está validado
   * @throws {UnauthorizedException} Si el token es inválido o el usuario no está validado
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = AuthGuard.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload: UserActiveInterface = await this.jwtService.verifyAsync(
        token,
        { secret: this.jwtSecret },
      );
      (request as Request & { user: UserActiveInterface }).user = payload;

      // Verificar status del usuario - solo APPROVED e IMPORTED pueden acceder.
      if (
        payload.status !== UserStatus.APPROVED &&
        payload.status !== UserStatus.IMPORTED
      ) {
        throw new UnauthorizedException('User status does not permit access');
      }

      // Verificar que el usuario haya completado 2FA si está habilitado.
      // Permite acceso a /auth/verify-otp para completar la verificación.
      if (!payload.validated && request.url !== '/auth/verify-otp') {
        throw new UnauthorizedException('User is not validated');
      }

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  /**
   * Extrae el token Bearer del encabezado Authorization.
   *
   * @param request Objeto Request de Express
   * @returns Token si existe y es de tipo Bearer, undefined en caso contrario
   */
  static extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
