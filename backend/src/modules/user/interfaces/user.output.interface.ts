import type { Role } from '@kotrip/data';

/**
 * Interfaz de salida con la informacion del perfil de un usuario.
 *
 * Contiene los datos publicos del usuario: correo, rol, avatar y
 * fecha del ultimo inicio de sesion.
 *
 * @see User Entidad del usuario.
 */
export interface UserOutput {
  mail: string;
  role: Role;
  avatarUrl: string;
  lastLogIn: null | string;
}
