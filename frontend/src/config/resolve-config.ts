import overrides from './app.config';
import { defaultConfig } from './app.config.default';
import type { AppConfig, AppConfigOverride, DeepPartial } from './config.types';

/**
 * Fusiona recursivamente un objeto base con un objeto de sobrecargas parciales.
 *
 * Las propiedades primitivas del objeto de sobrecargas reemplazan las del base.
 * Las propiedades de tipo objeto se fusionan recursivamente, de modo que solo
 * se sustituyen las hojas definidas en la sobrecarga.
 *
 * @param base    - Objeto base con todos los valores por defecto.
 * @param partial - Objeto parcial con las sobrecargas a aplicar.
 * @returns Objeto resultante con la fusión profunda de ambos.
 */
function deepMergeImpl(
  base: Record<string, unknown>,
  partial: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };

  for (const key of Object.keys(partial)) {
    const baseVal = base[key];
    const overrideVal = partial[key];

    if (overrideVal === undefined) continue;

    if (
      typeof baseVal === 'object' &&
      baseVal !== null &&
      !Array.isArray(baseVal) &&
      typeof overrideVal === 'object' &&
      overrideVal !== null &&
      !Array.isArray(overrideVal)
    ) {
      result[key] = deepMergeImpl(
        baseVal as Record<string, unknown>,
        overrideVal as Record<string, unknown>,
      );
    } else {
      result[key] = overrideVal;
    }
  }

  return result;
}

/**
 * Fusiona recursivamente un objeto base con un objeto parcial, preservando
 * la seguridad de tipos del resultado.
 *
 * @param base    - Objeto base con todos los valores por defecto.
 * @param partial - Objeto parcial con las sobrecargas a aplicar.
 * @returns Objeto resultante con la fusión profunda de ambos.
 */
export function deepMerge<T>(base: T, partial: DeepPartial<T>): T {
  return deepMergeImpl(
    base as Record<string, unknown>,
    partial as Record<string, unknown>,
  ) as T;
}

/**
 * Resuelve la configuración final de la aplicación fusionando la configuración
 * por defecto con las sobrecargas definidas por el usuario.
 *
 * @param base      - Configuración completa por defecto.
 * @param overrides - Sobrecargas parciales del usuario.
 * @returns Configuración completa resuelta.
 */
export function resolveConfig(
  base: AppConfig,
  overrides: AppConfigOverride,
): AppConfig {
  return deepMerge(base, overrides);
}

/**
 * Configuración resuelta y lista para consumo por la aplicación.
 *
 * Resultado de la fusión profunda de `app.config.default.ts` (valores por
 * defecto) con `app.config.ts` (sobrecargas del usuario).
 */
export const appConfig: AppConfig = resolveConfig(defaultConfig, overrides);
