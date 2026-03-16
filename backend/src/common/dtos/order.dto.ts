import type { Order } from '../enums/order.enum';

/**
 * DTO que representa el criterio de ordenacion de un campo en una consulta.
 *
 * Utilizado por OrderPipe para transformar parametros de query string
 * en un array de objetos con campo y direccion de ordenacion.
 *
 * @see OrderPipe Pipe que genera instancias de este DTO.
 */
export class OrderDTO<T> {
  direction: Order;
  field: T;
}
