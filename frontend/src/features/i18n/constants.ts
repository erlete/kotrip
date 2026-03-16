import { appConfig } from '@/config';

export { pathnames } from '@/features/routing/pathnames.generated';

/**
 * Identificadores de idioma soportados por la plataforma.
 *
 * @remarks Debe mantenerse sincronizado con la propiedad
 * `i18n.availableLanguages` de `app.config.ts` y con los archivos
 * JSON de mensajes en `src/features/i18n/messages/`.
 */
export const locales = appConfig.i18n.availableLanguages.map(
  (lang) => lang.value,
);

export const localeItems = appConfig.i18n.availableLanguages;

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export const defaultLocale = appConfig.i18n
  .defaultLanguage as (typeof locales)[number];
