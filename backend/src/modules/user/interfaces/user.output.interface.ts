import type { Role } from '@kotrip/data';

/**
 * ### UserOutput
 *
 * DTO para controlar los datos de salida al front-end que arrojará el back-end al recuperar la
 * información de un usuario registrado. Esta interfaz está relacionada con la entidad de user.
 * Si se quiere mostrar más datos, se deben poner aquí
 *
 * @version     1.0.0a




 * @see         [User](../entities/user.entity.ts)
 */
export interface UserOutput {
  mail: string;
  role: Role;
  avatarUrl: string;
  lastLogIn: null | string;
}
