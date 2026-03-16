import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO with "created at" timestamp with time zone.
 *
 * @remarks
 * Creation date is read-only and automatically handled by TypeORM.
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
 * DTO with "updated at" timestamp with time zone.
 *
 * @remarks
 * Extends CTzDTO, so it also includes "created at" timestamp with time zone.
 * Creation and update dates are read-only and automatically handled by
 * TypeORM.
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
 * DTO with "deleted at" timestamp with time zone.
 *
 * @remarks
 * Extends CUTzDTO, so it also includes "created at" and "updated at"
 * timestamps with time zone. Creation and update dates are read-only and
 * automatically handled by TypeORM.
 */
export abstract class CUDTzDTO extends CUTzDTO {
  @ApiProperty({
    description: 'Entity deletion date with time zone',
    type: () => Date,
  })
  @Type(() => Date)
  deletedAt: Date | null;
}
