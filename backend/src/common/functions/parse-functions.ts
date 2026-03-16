/**
 * Clase con funciones estaticas para formateo de texto y decodificacion de tokens JWT.
 */
import { ErrorManager } from '../error-handling/error.manager';

export class ParseFunctions {
  /**
   * Decodifica un token JWT sin verificar su firma.
   *
   * @param token Token JWT a decodificar.
   * @returns Payload decodificado o null si el formato es invalido.
   */
  static decodeJWT(token: string) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // Decode the payload (second part)
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (e) {
      throw new ErrorManager('INTERNAL_SERVER_ERROR', '');
      return null;
    }
  }

  static formatName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '') // Elimina espacios en blanco
      .replace(/[^a-z0-9]/g, ''); // Mantiene solo caracteres alfanuméricos;
  }
}
