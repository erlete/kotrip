import type { OrderDTO } from './dtos/order.dto';

/**
 * Funciones de utilidad compartidas para la aplicacion.
 */

/**
 * Método para ordenar un array de objetos en base a un array de objetos de tipo OrderDTO
 *
 * @param array  Array de objetos a ordenar
 * @param order  Array de objetos de tipo OrderDTO con la información de orden
 * @returns      Array ordenado
 */
export function orderIntoFindOptions<T>(orderDto: OrderDTO<T>[]) {
  const order = orderDto.reduce<Record<string, string>>(
    (acc, order) => {
      acc[order.field as string] = order.direction.toUpperCase();
      return acc;
    },
    {} as Record<string, string>,
  );

  return order;
}
