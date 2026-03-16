import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Obtiene y valida la clave secreta de cifrado desde variables de entorno.
 *
 * @returns Buffer con 32 bytes (AES-256).
 * @throws Error si el secreto no existe o tiene longitud inválida.
 */
function getSecret(): Buffer {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error('La variable de entorno AUTH_SECRET es requerida');
  }

  // Asegurar que el secreto sea exactamente 32 bytes para AES-256
  const secretBuffer = Buffer.from(secret, 'hex');

  if (secretBuffer.length !== 32) {
    throw new Error(
      'AUTH_SECRET debe tener 64 caracteres hexadecimales (32 bytes)',
    );
  }

  return secretBuffer;
}

/**
 * Encripta y autentica datos de sesión usando AES-256-GCM
 * Retorna formato: iv.authTag.ciphertext
 *
 * @param data Datos a cifrar.
 * @returns Cadena cifrada con IV y tag de autenticación.
 */
export function encrypt(data: object | string): string {
  const iv = randomBytes(16); // Vector de inicialización (nonce)
  const key = getSecret();

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const plaintext = JSON.stringify(data);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag(); // Tag de autenticación para integridad

  // Combinar: iv.authTag.ciphertext
  return `${iv.toString('hex')}.${authTag.toString('hex')}.${encrypted}`;
}

/**
 * Desencripta y verifica datos de sesión usando AES-256-GCM
 * Retorna null si falla la desencriptación o el tag de autenticación no coincide (datos manipulados)
 *
 * @param encrypted Cadena cifrada en formato iv.authTag.ciphertext.
 * @returns Datos desencriptados o null si falla.
 */
export function decrypt<T = object>(encrypted: string): T | null {
  try {
    const parts = encrypted.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [ivHex, authTagHex, ciphertext] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getSecret();

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag); // Verificar tag de autenticación

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted) as T;
  } catch {
    return null;
  }
}
