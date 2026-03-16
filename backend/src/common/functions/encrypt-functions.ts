import * as crypto from 'node:crypto';

/**
 * Funciones utilitarias de encriptacion y desencriptacion con AES-256-CBC.
 *
 * Se utilizan para proteger archivos almacenados en MinIO cuando la encriptacion
 * esta habilitada en la configuracion de la plataforma.
 */
export class EncryptFunctions {
  static readonly CYPHER_TO_USE = 'aes-256-cbc';

  /**
   * Encripta una string o buffer con 'aes-256-cbc'
   * @param str
   * @returns {Buffer<ArrayBuffer>} Buffer encriptado
   */
  static encryptBuffer(
    str: Buffer | string,
    encryptionKey: string,
  ): Buffer<ArrayBuffer> {
    const keyBuffer = Buffer.from(encryptionKey, 'hex');
    const iv = crypto.randomBytes(16); // Crear un IV aleatorio
    const cipher = crypto.createCipheriv(
      EncryptFunctions.CYPHER_TO_USE,
      keyBuffer,
      iv,
    );

    // Encriptar string, añade IV al principio y el final de cifrado
    const encBuffer = Buffer.concat([iv, cipher.update(str), cipher.final()]);

    return encBuffer;
  }

  /**
   * Decripta un buffer usando 'aes-256-cbc'
   * @param buffer
   * @returns {Buffer<ArrayBuffer>} Buffer desencriptado
   * @throws {Error} Puede lanzar un error si el buffer no es valido, clave incorrecta...
   */
  static decryptBuffer(
    buffer: Buffer<ArrayBuffer>,
    encryptionKey: string,
  ): Buffer<ArrayBuffer> {
    const keyBuffer = Buffer.from(encryptionKey, 'hex');
    // Extraer el IV de los primeros 16 bytes del buffer
    const iv = buffer.subarray(0, 16);
    const encryptedData = buffer.subarray(16);
    const decipher = crypto.createDecipheriv(
      EncryptFunctions.CYPHER_TO_USE,
      keyBuffer,
      iv,
    );

    // Desencripta buffer
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);
    return decrypted;
  }
}
