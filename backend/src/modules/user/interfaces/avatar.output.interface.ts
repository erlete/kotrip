/**
 * ### AvatarOutput
 *
 * DTO para controlar los datos de salida al front-end que arrojará el back-end al subir o
 * actualizar la foto de perfil
 *
 * @version     1.0.0a




 */
export interface AvatarOutput {
  file_name: string;
  status: boolean;
  avatar_url: string;
}
