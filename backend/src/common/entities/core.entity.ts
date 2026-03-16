import { CUDTzEntity } from '@/lib/data/entities/timestamped.entity';
import { PrimaryGeneratedColumn } from 'typeorm';

/**
 * Core entity base class for all domain entities.
 *
 * @remarks
 * Provides:
 * - UUID primary key (`id`)
 * - Created/updated/deleted timestamps with timezone (from CUDTzEntity)
 *
 * All domain entities in the Kotrip should extend this class.
 */
export abstract class CoreEntity extends CUDTzEntity {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Unique identifier (UUID)',
    name: 'id',
  })
  id: string;
}
