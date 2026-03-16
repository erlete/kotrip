import { HttpException, HttpStatus, Logger } from '@nestjs/common';

/**
 *  ### ErrorManager
 *
 *
 * Clase que centraliza el manejo de errores proporcionando un error personalizado
 * que facilita el lanzamiento de excepciones HTTP con códigos de estado y mensajes específicos.
 *
 * @version 1.0.0a





 */
export class ErrorManager extends Error {
  /**
   * Constructor que inicializa una instancia de ErrorManager con un tipo específico de error HTTP y un mensaje.
   *
   * @param type - Clave del estado HTTP desde HttpStatus.
   * @param message - Mensaje de error personalizado asociado al error HTTP.
   */
  constructor(
    public readonly type: HttpStatus | keyof typeof HttpStatus, // Limita el valor de `type` a solo las claves (nombres de estado) dentro del objeto `HttpStatus`, asegurando que solo se usen estados HTTP válidos (por ejemplo, `NOT_FOUND`, `BAD_REQUEST`).
    public override readonly message: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(`${type} :: ${message}`); // Llama al constructor padre (Error) con un mensaje formateado.
  }

  /**
   * Crea y lanza un error HTTP personalizado basado en el mensaje proporcionado.
   *
   * @throws  Lanza una nueva HttpException con el estado HTTP especificado o uno predeterminado.
   */
  public throwSignatureError() {
    // Construye el cuerpo de la respuesta: si hay metadata, incluirla como campos adicionales.
    const responseBody = this.metadata
      ? { message: this.message, ...this.metadata }
      : this.message;

    // Verifica si el tipo extraído existe en HttpStatus; lo usa si es válido, de lo contrario usa el estado 500.
    if (typeof this.type === 'string') {
      throw new HttpException(responseBody, HttpStatus[this.type]);
    } else {
      throw new HttpException(responseBody, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retorna un error del tipo ErrorManager.
   * Si es del mismo tipo lo rentorna sino lo intenta convertir y añade un mensaje si no tiene
   * @param error           Error a convertir\lanzar
   * @param message         Mensaje opcional de error si el objeto de error no tiene ninguno
   * @return {ErrorManager} Error del tipo ErrorManager
   */
  public static normalize(error: unknown, messageOpt?: string): never {
    // Se lanza el error si es de tipo ErrorManager
    if (error instanceof ErrorManager) throw error;

    // Print error si no es de tipo controlado
    const logger = new Logger('ErrorManagerNormalize');
    logger.error(error);

    let message: string = 'Unexpected error';
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      message =
        'message' in error && typeof errorObj['message'] === 'string'
          ? errorObj['message']
          : (messageOpt ?? 'Unexpected error');
    }

    // Si es un objeto con status o statusCode intentamos usarlo para mandar el mensaje de error
    if (
      error &&
      typeof error === 'object' &&
      ('status' in error || 'statusCode' in error)
    ) {
      // Parsea status
      const errorObj = error as Record<string, unknown>;
      const statusUnk: unknown =
        'status' in error ? errorObj['status'] : errorObj['statusCode'];
      let statusCode: number = 500;
      if (typeof statusUnk === 'number') {
        statusCode = statusUnk;
      } else if (typeof statusUnk === 'string') {
        const parsed = parseInt(statusUnk, 10);
        statusCode = isNaN(parsed) ? 500 : parsed;
      }

      throw new ErrorManager(statusCode, message);
    } else {
      // Sino mandar 500
      throw new ErrorManager(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messageOpt ?? 'Error inesperado',
      );
    }
  }

  /**
   * Retorna un error del tipo ErrorManager.
   * Si es del mismo tipo lo rentorna sino lo intenta convertir y añade el mensaje opcional, sino se añade error inesperado
   * Usado para cuando los mensajes de error puedan contener información sensible
   * @param error           Error a convertir\lanzar
   * @param message         Mensaje opcional de error si el objeto de error no tiene ninguno
   * @return {ErrorManager} Error del tipo ErrorManager
   */
  public static normalizeRestrictive(
    error: unknown,
    messageOpt?: string,
  ): never {
    // Se lanza el error si es de tipo ErrorManager
    if (error instanceof ErrorManager) throw error;

    const logger = new Logger('ErrorManagerNormalize');
    logger.error(error);

    const statusCode = ErrorManager.parseStatusCodeFromErr(error);
    throw new ErrorManager(statusCode, messageOpt ?? 'Error inesperado');
  }

  private static parseStatusCodeFromErr(error: unknown): number {
    let statusCode: number = 500;
    if (
      error &&
      typeof error === 'object' &&
      ('status' in error || 'statusCode' in error)
    ) {
      const errorObj = error as Record<string, unknown>;
      const statusUnk: unknown =
        'status' in error ? errorObj['status'] : errorObj['statusCode'];
      if (typeof statusUnk === 'number') {
        statusCode = statusUnk;
      } else if (typeof statusUnk === 'string') {
        const parsed = parseInt(statusUnk, 10);
        statusCode = isNaN(parsed) ? 500 : parsed;
      }
    }
    return statusCode;
  }
}
