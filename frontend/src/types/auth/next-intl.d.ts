import es from '@/features/i18n/messages/es.json';
import type {
  createTranslator,
  Locale,
  Messages,
  NamespaceKeys,
  NestedKeyOf,
} from 'use-intl/core';

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof es;
  }
}

declare module 'use-intl' {
  declare function useTranslations<
    NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never,
  >(namespace?: NestedKey): TranslationFunction<NestedKey>;
}

declare module 'next-intl/server' {
  declare function getTranslations<
    NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never,
  >(namespace?: NestedKey): Promise<TranslationFunction<NestedKey>>;
  declare function getTranslations<
    NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never,
  >(opts?: {
    locale: Locale;
    namespace?: NestedKey;
  }): Promise<TranslationFunction<NestedKey>>;
}

declare const __translationBrand: unique symbol;

export type TranslationFunction<
  NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>>,
> = ReturnType<typeof createTranslator<Messages, NestedKey>> & {
  /**
   * Para hacer que cada tipo sea único según su `NestedKey`, si no TypeScript se traga cualquier función de traducción
   */
  readonly [__translationBrand]: NestedKey;
};
