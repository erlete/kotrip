import { ErrorManager } from '@/common/error-handling/error.manager';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

/**
 * Guard que valida el token de refresco JWT.
 *
 * Permite renovar tokens de acceso expirados verificando que el token
 * de refresco sea válido. La duración del token se configura en las
 * variables de entorno.
 *
 * @see {@link https://docs.nestjs.com/guards | NestJS Guards}
 */
@Injectable()
export class RefreshGuard implements CanActivate {
  /** Clave secreta para verificar tokens de refresco */
  private readonly jwtRefreshSecret: string;

  /**
   * @param configService Servicio de configuración para obtener secretos
   * @param i18n Servicio de internacionalización para mensajes de error
   * @param jwtService Servicio JWT para verificar tokens
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly jwtService: JwtService,
  ) {
    this.jwtRefreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  /**
   * Valida si la petición puede ejecutarse verificando el token de refresco.
   *
   * @param context Contexto de ejecución de NestJS
   * @returns `true` si el token de refresco es válido
   * @throws {ErrorManager} Si el token es inválido o no existe
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    try {
      if (!token) {
        throw new ErrorManager(
          'UNAUTHORIZED',
          this.i18n.t('error.AUTH.UNAUTHORIZED_USER'),
        );
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtRefreshSecret,
      });

      (request as Request & { user: unknown }).user = payload;
    } catch (error: unknown) {
      if (error instanceof ErrorManager) {
        error.throwSignatureError();
      }
      const message =
        error instanceof Error ? error.message : 'Token de refresco inválido';
      throw new ErrorManager('UNAUTHORIZED', message);
    }

    return true;
  }

  /**
   * Extrae el token de tipo Refresh del encabezado Authorization.
   *
   * @param request Objeto Request de Express
   * @returns Token si existe y es de tipo Refresh, undefined en caso contrario
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Refresh' ? token : undefined;
  }
}
