import { CUDTzEntity } from '@/lib/data/entities/timestamped.entity';
import { PrimaryGeneratedColumn } from 'typeorm';

/**
 * Clase base para todas las entidades de dominio de Kotrip.
 *
 * Proporciona una clave primaria UUID (`id`) y timestamps con zona horaria
 * de creacion, actualizacion y borrado logico (heredados de CUDTzEntity).
 *
 * Todas las entidades de dominio deben extender esta clase.
 */
export abstract class CoreEntity extends CUDTzEntity {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Unique identifier (UUID)',
    name: 'id',
  })
  id: string;
}
