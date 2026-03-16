import type { SeederPresetEntry } from '../seeder.types';
import { tripsBase } from './trips-base.preset';
import { usersBase } from './users-base.preset';

/**
 * Presets activos para ejecucion durante el semillado.
 *
 * El orden de los presets determina su secuencia de ejecucion.
 * Los usuarios deben crearse antes que los viajes para que las
 * referencias cruzadas por email se resuelvan correctamente.
 *
 * @remarks
 * Para desactivar un preset, basta con comentar o eliminar su entrada
 * en este arreglo.
 */
export const ACTIVE_PRESETS: SeederPresetEntry[] = [
  { name: 'users-base', fn: usersBase },
  { name: 'trips-base', fn: tripsBase },
];
