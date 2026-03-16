import {
  CreateDateColumn,
  DeleteDateColumn,
  BaseEntity as TypeORMBaseEntity,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entity with "created at" timestamp with time zone.
 *
 * @remarks
 * Creation date is read-only and automatically handled by TypeORM.
 */
export abstract class CTzEntity extends TypeORMBaseEntity {
  @CreateDateColumn({
    comment: 'Creation date of the entity with timezone',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
    type: 'timestamptz',
  })
  readonly createdAt: Date;
}

/**
 * Entity with "updated at" timestamp with time zone.
 *
 * @remarks
 * Extends CTzEntity, so it also includes "created at" timestamp with time
 * zone. Creation and update dates are read-only and automatically handled by
 * TypeORM.
 */
export abstract class CUTzEntity extends CTzEntity {
  @UpdateDateColumn({
    comment: 'Update date of the entity with timezone',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
    type: 'timestamptz',
  })
  readonly updatedAt: Date;
}

/**
 * Entity with "deleted at" timestamp with time zone.
 *
 * @remarks
 * Extends CUTzEntity, so it also includes "created at" and "updated at"
 * timestamps with time zone. Creation and update dates are read-only and
 * automatically handled by TypeORM.
 */
export abstract class CUDTzEntity extends CUTzEntity {
  @DeleteDateColumn({
    comment: 'Deletion date of the entity with timezone',
    name: 'deleted_at',
    nullable: true,
    type: 'timestamptz',
  })
  deletedAt: Date | null;
}
