import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorManager } from './error.manager';

/**
 *  ### GlobalErrorInterceptor
 *
 * Interceptor global de la aplicación para capturar y
 * manejar los errores lanzados en cualquier parte de la aplicación,
 * permitiendo una gestión centralizada de errores.
 *
 *
 *
 * @version 1.0.0a




 * @see [Interceptor](https://docs.nestjs.com/interceptors)
 */

@Injectable()
export class GlobalErrorInterceptor implements NestInterceptor {
  /**
   * Interceptor que se ejecuta tras la llamada al endpoint y gestiona los errores que puedan surgir.
   *
   * @param context - Contexto de la ejecución de la petición, contiene información de la solicitud y del cliente.
   * @param next - Controlador de la llamada, permite pasar la ejecución al siguiente manejador.
   * @returns - Devuelve un flujo de datos observable, que puede ser la respuesta exitosa de la solicitud o un error procesado y manejado.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      //Ejecuta el interceptor tras la llamada al endpoint
      catchError((error) => {
        //Captura cualquier error que surja
        if (error instanceof ErrorManager) {
          // Si el error es una instancia de ErrorManager (error gestionado)
          return throwError(
            () => error.throwSignatureError(), // Se maneja el error si corresponde a una instancia de ErrorManager
          );
        }

        if (error instanceof HttpException) {
          // Si el error ya es una HttpException nativa de NestJS, se propaga sin modificar
          return throwError(() => error);
        }

        return throwError(
          () =>
            new HttpException( // Si el error es inesperado (no gestionado por ErrorManager), lanza un error genérico
              {
                error: 'Internal Server Error',
                message: error.message,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              },
              HttpStatus.INTERNAL_SERVER_ERROR, // Código de estado HTTP 500
            ),
        );
      }),
    );
  }
}
