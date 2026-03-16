/**
 * Interfaz de respuesta para la subida o actualizacion del avatar de usuario.
 *
 * Contiene el nombre del archivo, el estado de la operacion y la URL publica del avatar.
 */
export interface AvatarOutput {
  file_name: string;
  status: boolean;
  avatar_url: string;
}
