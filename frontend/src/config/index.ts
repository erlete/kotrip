/**
 * @file index.ts
 * @description
 * Punto de entrada público del módulo de configuración de la aplicación.
 *
 * Re-exporta todos los elementos necesarios para consumir la configuración
 * resuelta de la aplicación y sus tipos asociados desde una única ruta
 * de importación (`@/config`).
 * */

export type { AppConfig, AppConfigOverride, DeepPartial } from './config.types';

export type {
  FooterLogoRaw,
  FooterLogoResolved,
  LanguageCode,
} from './config.utils';
export { Language } from './config.utils';

export { appConfig, deepMerge, resolveConfig } from './resolve-config';
