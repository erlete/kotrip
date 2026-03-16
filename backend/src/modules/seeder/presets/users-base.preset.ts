import { Language, Role } from '@kotrip/data';
import type { SeederContext } from '../seeder.context';
import type { SeederPresetFn } from '../seeder.types';

/**
 * Preset de usuarios base del sistema.
 *
 * Define el conjunto de usuarios iniciales necesarios para operar
 * la plataforma Kotrip en desarrollo. Incluye un administrador y
 * cinco usuarios estándar con nombres realistas.
 *
 * @remarks
 * Usuarios creados (6):
 * - 1 Administrador (ADMIN) - no participa en viajes
 * - 5 Usuarios estándar (USER) con mezcla de idiomas ES/EN/GL
 *
 * Convención: Todos los usuarios comparten la contraseña `Password1!`
 * para facilitar las pruebas en desarrollo.
 */
export const usersBase: SeederPresetFn = (ctx: SeederContext): void => {
  // ─── Administrador ──────────────────────────────────────────────────
  ctx.user('superadmin@kotrip.local', {
    firstName: 'Carlos',
    lastName: 'Superadmin',
    password: 'Password1!',
    role: Role.ADMIN,
    language: Language.ES,
  });

  // ─── Usuarios estándar ──────────────────────────────────────────────
  ctx.user('sonia@kotrip.local', {
    firstName: 'Sonia',
    lastName: 'Domínguez López',
    password: 'Password1!',
    role: Role.USER,
    language: Language.ES,
  });

  ctx.user('ainhoa@kotrip.local', {
    firstName: 'Ainhoa',
    lastName: 'Macías Durán',
    password: 'Password1!',
    role: Role.USER,
    language: Language.ES,
  });

  ctx.user('diego@kotrip.local', {
    firstName: 'Diego',
    lastName: 'Majarón López',
    password: 'Password1!',
    role: Role.USER,
    language: Language.EN,
  });

  ctx.user('ismael@kotrip.local', {
    firstName: 'Ismael',
    lastName: 'Rubio Torres',
    password: 'Password1!',
    role: Role.USER,
    language: Language.ES,
  });

  ctx.user('paulo@kotrip.local', {
    firstName: 'Paulo',
    lastName: 'Sanchez Blázquez',
    password: 'Password1!',
    role: Role.USER,
    language: Language.GL,
  });
};
