import { AuthGuard } from '@/modules/auth/guard/auth.guard';
import { ExecutionContext, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { I18nResolver } from 'nestjs-i18n';

/**
 * Resuelve el idioma del usuario a partir del token JWT.
 *
 * Extrae el campo `language` del payload JWT para determinar el idioma
 * preferido del usuario en las peticiones autenticadas.
 *
 * @see {@link https://nestjs-i18n.com/quick-start | nestjs-i18n}
 */
@Injectable()
export class JwtLanguageResolver implements I18nResolver, OnModuleInit {
  /** Clave secreta para verificar tokens JWT */
  private jwtSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /** Inicializa la clave secreta desde ConfigService */
  onModuleInit(): void {
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
  }

  /**
   * Resuelve el idioma del usuario desde el token JWT.
   *
   * @param context Contexto de ejecución de NestJS
   * @returns Código de idioma del usuario o undefined si no hay token
   */
  public resolve(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const token = AuthGuard.extractTokenFromHeader(request);

    if (!token) {
      return undefined;
    }

    try {
      const payload = this.jwtService.verify(token, { secret: this.jwtSecret });
      return payload?.language;
    } catch {
      return undefined;
    }
  }
}
