'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

/**
 * Componente cliente que sincroniza el atributo `lang` del elemento
 * `<html>` con el locale activo proporcionado por `NextIntlClientProvider`.
 *
 * Se utiliza en lugar de establecer `lang` directamente en el layout
 * del servidor, ya que acceder a `cookies()` fuera de un boundary
 * `<Suspense>` bloquea el streaming de la página en Next.js.
 *
 * Lo más importante, evita que Anta se queje de que establecer el lenguaje con
 * cookies genere errores de runtime de Next.js. :D
 *
 * @returns `null` - no renderiza nada en el DOM.
 */
export function DocumentLang() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
