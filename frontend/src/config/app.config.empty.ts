import type { AppConfigOverride } from './config.types';

/**
 * Módulo de reserva utilizado automáticamente cuando no existe `app.config.ts`.
 *
 * Exporta un objeto de sobrecargas vacío para que la aplicación funcione
 * exclusivamente con los valores por defecto definidos en
 * `app.config.default.ts`.
 *
 * @see {@link import('./app.config.default').defaultConfig} para los valores base.
 */
const config: AppConfigOverride = {};

export default config;
