/**
 * Interfaz que define la estructura de un registro de auditoria.
 *
 * Contiene informacion sobre la peticion HTTP, la respuesta, el token JWT
 * y el tiempo de procesamiento para su almacenamiento en MinIO.
 */
export interface LogAudit {
  method: string;
  endpoint: string;
  timestamp: string;
  msProcTime: number;
  status: number;
  hasJWT: boolean;
  isValidJWT: boolean;
  JWTValdError: string;
  JWTInfo: any;
  ip: any;
  headers: any;
  body: any;
}
