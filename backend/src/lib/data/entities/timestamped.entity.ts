import {
  CreateDateColumn,
  DeleteDateColumn,
  BaseEntity as TypeORMBaseEntity,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entidad base con timestamp de creacion con zona horaria.
 *
 * @remarks
 * La fecha de creacion es de solo lectura y se gestiona automaticamente por TypeORM.
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
 * Entidad base con timestamps de creacion y actualizacion con zona horaria.
 *
 * @remarks
 * Extiende CTzEntity, por lo que incluye tambien el timestamp de creacion.
 * Ambas fechas son de solo lectura y se gestionan automaticamente por TypeORM.
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
 * Entidad base con timestamps de creacion, actualizacion y borrado logico con zona horaria.
 *
 * @remarks
 * Extiende CUTzEntity, por lo que incluye los timestamps de creacion y actualizacion.
 * Las fechas son de solo lectura y se gestionan automaticamente por TypeORM.
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
