import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { OrderDTO } from '../dtos/order.dto';
import { Order } from '../enums/order.enum';
import { ErrorManager } from '../error-handling/error.manager';

/**
 * Pipe que transforma cadenas de ordenacion con formato "campo:direccion"
 * a un array de objetos OrderDTO.
 *
 * El parametro fieldEnum debe ser un enum donde la clave corresponde al nombre
 * del campo en el DTO de salida y el valor al nombre de la columna en la base de datos.
 */
export class OrderPipe implements PipeTransform {
  constructor(private readonly fieldEnum: Record<string, string>) {
    this.fieldEnum = Object.fromEntries(
      Object.entries(this.fieldEnum).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ]),
    );
  }

  transform(
    value: string | string[],
    metadata: ArgumentMetadata,
  ): OrderDTO<string>[] {
    if (value === undefined) {
      return [];
    }

    if (typeof value === 'string') {
      return this.transform([value], metadata);
    }

    return value.map((orderString: string) => {
      const [field, order] = orderString.split(':');

      if (!field || !order) {
        throw new ErrorManager(
          'BAD_REQUEST',
          I18nContext.current()?.t('error.COMMON.INVALID_ORDER', {
            args: { order: orderString },
          }) ?? 'Invalid order format',
        );
      }

      const dbField = this.fieldEnum[field.toLowerCase()];

      if (!dbField) {
        throw new ErrorManager(
          'BAD_REQUEST',
          I18nContext.current()?.t('error.COMMON.INVALID_FIELD', {
            args: { field: field },
          }) ?? 'Invalid field',
        );
      }

      if (!Object.values(Order).includes(order.toUpperCase() as Order)) {
        throw new ErrorManager(
          'BAD_REQUEST',
          I18nContext.current()?.t('error.COMMON.INVALID_ORDER_DIRECTION', {
            args: { direction: order },
          }) ?? 'Invalid order direction',
        );
      }

      const orderDto = new OrderDTO<string>();
      orderDto.field = dbField;
      orderDto.direction = order as Order;

      return orderDto;
    });
  }
}
