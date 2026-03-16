import type { Order } from '../enums/order.enum';

/**
 * ### OrderDTO
 *
 * DTO que representa el orden de un campo en una consulta.
 * Se usa en las consultas de usuarios para ordenar los resultados.
 * OrderPipe obtendrá un array de estos objetos para poder usarlos
 * posteriormente en el método de consulta.
 *
 * @version     1.0.0a




 * @see         (OrderPipe)[../pipes/order.pipe.ts]
 */
export class OrderDTO<T> {
  direction: Order;
  field: T;
}
