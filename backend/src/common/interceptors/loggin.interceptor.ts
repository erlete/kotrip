import { AuthGuard } from '@/modules/auth/guard/auth.guard';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ENABLE_LOGGING } from '../decorators/loggin.decorator';
import { ParseFunctions } from '../functions/parse-functions';
import { LogAudit } from '../interfaces/logger.interface';
import { AuditLogService } from '../services/logging.service';

/**
 * Interceptor que registra información de auditoría para las peticiones HTTP.
 *
 * Registra método HTTP, URL, código de estado, tiempo de respuesta e información
 * del token JWT si está presente. Se activa con el decorador @EnableLogging()
 * o globalmente si AUDIT_LOG_EVERY_ENDPOINT=true.
 */
@Injectable()
export class LogginInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logginService: AuditLogService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Construye y envía el registro de auditoría al servicio de logging.
   *
   * @param req Objeto Request de Express
   * @param res Objeto Response de Express
   * @param reqTime Timestamp de inicio de la petición
   */
  private async auditLog(
    req: Request,
    res: Response,
    reqTime: number,
  ): Promise<void> {
    const { method, originalUrl } = req;
    const resTime = new Date().getTime() - reqTime;
    const statusCode = res.statusCode;

    const log: LogAudit = {
      body: req.body,
      endpoint: originalUrl,
      hasJWT: false,
      headers: req.headers,
      ip: req.ip,
      isValidJWT: false,
      JWTInfo: undefined,
      JWTValdError: '',
      method: method,
      msProcTime: resTime,
      status: statusCode,
      timestamp: new Date().toISOString(),
    };

    // Parsear token de usuario si existe
    const token = AuthGuard.extractTokenFromHeader(req);
    if (token) {
      log.hasJWT = true;
      try {
        const payload = this.jwtService.verify(token, {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        });
        log.JWTInfo = payload;
        log.isValidJWT = true;
      } catch (error: unknown) {
        log.JWTValdError =
          error instanceof Error
            ? error.message
            : 'Unknown JWT validation error';
        // Intentar decodificar el JWT sin verificar para obtener información
        try {
          log.JWTInfo = ParseFunctions.decodeJWT(token);
        } catch {
          // Error silencioso al decodificar JWT inválido
        }
      }
    }

    await this.logginService.log(log);
  }

  /**
   * Intercepta las peticiones HTTP para registrar información de auditoría.
   *
   * @param context Contexto de ejecución de NestJS
   * @param next Manejador de la cadena de ejecución
   * @returns Observable con la respuesta
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const shouldLog = this.reflector.getAllAndOverride<boolean>(
      ENABLE_LOGGING,
      [context.getHandler(), context.getClass()],
    );

    // Si no está marcado con @EnableLogging() y no está habilitado globalmente, no loguear
    if (
      !shouldLog &&
      this.configService.get<string>('AUDIT_LOG_EVERY_ENDPOINT') !== 'true'
    ) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const reqTime = new Date().getTime();

    return next.handle().pipe(
      tap({
        error: () => {
          this.auditLog(req, res, reqTime).catch(() => {});
        },
        next: () => {
          this.auditLog(req, res, reqTime).catch(() => {});
        },
      }),
    );
  }
}
