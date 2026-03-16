import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO con timestamp de creacion con zona horaria.
 *
 * @remarks
 * La fecha de creacion es de solo lectura y se gestiona automaticamente por TypeORM.
 */
export abstract class CTzDto {
  @ApiProperty({
    description: 'DTO creation date with time zone',
    type: () => Date,
  })
  @Type(() => Date)
  readonly createdAt: Date;
}

/**
 * DTO con timestamps de creacion y actualizacion con zona horaria.
 *
 * @remarks
 * Extiende CTzDto, por lo que incluye tambien el timestamp de creacion.
 * Ambas fechas son de solo lectura y se gestionan automaticamente por TypeORM.
 */
export abstract class CUTzDTO extends CTzDto {
  @ApiProperty({
    description: 'Entity update date with time zone',
    type: () => Date,
  })
  @Type(() => Date)
  readonly updatedAt: Date;
}

/**
 * DTO con timestamps de creacion, actualizacion y borrado logico con zona horaria.
 *
 * @remarks
 * Extiende CUTzDTO, por lo que incluye los timestamps de creacion y actualizacion.
 * Las fechas son de solo lectura y se gestionan automaticamente por TypeORM.
 */
export abstract class CUDTzDTO extends CUTzDTO {
  @ApiProperty({
    description: 'Entity deletion date with time zone',
    type: () => Date,
  })
  @Type(() => Date)
  deletedAt: Date | null;
}
