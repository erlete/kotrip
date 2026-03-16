/**
 * @file config.utils.ts
 * @description
 * Tipos utilitarios compartidos por el sistema de configuración de la aplicación.
 * Define el tipo canónico de idioma, el listado completo de idiomas soportados,
 * y las interfaces para recursos visuales con soporte de tema claro/oscuro
 * utilizadas en las secciones de marca de `AppConfig`.
 * */

import type { ThemedAsset } from '@/lib/themed-asset';
import { Language } from '@kotrip/data';

export { Language };

/**
 * Código de idioma como literal de cadena de texto (conforme a BCP 47).
 *
 * @remarks
 * Tipo derivado del enum {@link Language} mediante un tipo literal de plantilla.
 * Permite usar tanto los miembros del enum (`Language.ES`) como las cadenas
 * de texto directas (`'es'`) en el archivo de configuración y en atributos
 * HTML (`lang`), manteniendo compatibilidad de tipos con `next-intl`.
 */
export type LanguageCode = `${Language}`;

/**
 * Logo del pie de página con recurso temático sin resolver.
 *
 * Utilizado en `AppConfig.brand.footerImages` para definir logos cuya ruta
 * de imagen varía según el tema activo (claro u oscuro). La resolución final
 * de la ruta se realiza en tiempo de renderizado.
 */
export interface FooterLogoRaw {
  /** Recurso temático de la imagen, con variantes para cada tema. */
  src: ThemedAsset;
  /** Texto alternativo para accesibilidad. */
  alt: string;
  /** Dimensiones originales de la imagen para evitar distorsión. */
  dimmensions: {
    width: number;
    height: number;
  };
}

/**
 * Logo del pie de página con recurso temático resuelto.
 *
 * Resultado de aplicar el tema activo sobre un `FooterLogoRaw`. La propiedad
 * `src` ya contiene la ruta final de la imagen para el tema actual.
 */
export interface FooterLogoResolved {
  /** Ruta resuelta de la imagen según el tema activo. */
  src: string;
  /** Texto alternativo para accesibilidad. */
  alt: string;
  /** Dimensiones originales de la imagen para evitar distorsión. */
  dimmensions: {
    width: number;
    height: number;
  };
}
