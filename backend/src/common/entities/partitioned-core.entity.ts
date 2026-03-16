import {
  BeforeInsert,
  DeleteDateColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  BaseEntity as TypeORMBaseEntity,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entidad base para tablas particionadas por rango de `created_at`.
 *
 * PostgreSQL requiere que la clave de partición forme parte de cualquier
 * restricción PRIMARY KEY o UNIQUE. Por ello, esta clase define una clave
 * primaria compuesta `(id, created_at)` en lugar de la clave simple `(id)`
 * utilizada por {@link CoreEntity}.
 *
 * @remarks
 * - `id`: UUID generado automáticamente por TypeORM.
 * - `createdAt`: asignado mediante el hook `@BeforeInsert` cuando no se
 *   proporciona un valor explícito (a diferencia de `@CreateDateColumn`,
 *   `@PrimaryColumn` no genera valores automáticamente).
 * - `updatedAt` y `deletedAt` funcionan idénticamente a {@link CUDTzEntity}.
 *
 * Las entidades que utilicen particionamiento mensual deben extender esta
 * clase en lugar de `CoreEntity`.
 *
 * @see CoreEntity Para entidades sin particionamiento.
 */
export abstract class PartitionedCoreEntity extends TypeORMBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Identificador único (UUID)',
    name: 'id',
  })
  id: string;

  @PrimaryColumn({
    comment: 'Fecha de creación de la entidad con zona horaria',
    name: 'created_at',
    type: 'timestamptz',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    comment: 'Fecha de actualización de la entidad con zona horaria',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
    type: 'timestamptz',
  })
  readonly updatedAt: Date;

  @DeleteDateColumn({
    comment: 'Fecha de eliminación de la entidad con zona horaria',
    name: 'deleted_at',
    nullable: true,
    type: 'timestamptz',
  })
  deletedAt: Date | null;

  /**
   * Asigna `createdAt` con la fecha actual si no fue proporcionado
   * explícitamente, dado que `@PrimaryColumn` no genera valores de forma
   * automática como `@CreateDateColumn`.
   */
  @BeforeInsert()
  protected assignCreatedAt(): void {
    if (!this.createdAt) {
      (this as { createdAt: Date }).createdAt = new Date();
    }
  }
}
