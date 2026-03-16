import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Interceptor de desarrollo que registra en consola los endpoints ejecutados.
 *
 * Muestra el metodo HTTP, la URL, el codigo de respuesta y el tiempo de ejecucion.
 * Solo se activa en el entorno de desarrollo.
 */
@Injectable()
export class EndpointLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EndpointLogInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const responseTime = Date.now() - startTime;
        this.logger.verbose(
          `"ENDPOINTS INTERCEPTOR: Method: "${method}" Endpoint: "${url}" Response: "${statusCode}" Time: ${responseTime}ms"`,
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        const statusCode = error.response?.statusCode || 500;
        this.logger.verbose(
          `"ENDPOINTS INTERCEPTOR: Method: "${method}" Endpoint: "${url}" Response: "${statusCode}" Time: ${responseTime}ms" Error: "${error.message}"`,
        );
        return throwError(error);
      }),
    );
  }
}
