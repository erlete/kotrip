import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { getLocale } from 'next-intl/server';
import { defaultLocale, locales } from './constants';

// No se pasan pathnames a defineRouting porque el proxy de next-intl no
// resuelve correctamente segmentos dinamicos anidados (ej. /trips/[id]/expenses),
// produciendo 404 en sub-rutas. Como todas las pathnames mapean a si mismas
// (sin traduccion de URLs por locale), la opcion no aporta funcionalidad.
// Los tipos de Pathname se mantienen via pathnames.generated.ts en types.ts.
export const routing = defineRouting({
  defaultLocale,
  locales,
  localePrefix: 'never',
  localeCookie: true,
});

const { redirect: redirectInternal, ...rest } = createNavigation(routing);

export const { Link, getPathname, usePathname, useRouter, permanentRedirect } =
  rest;

export const redirect = async (
  to: string,
  redirectType?: Parameters<typeof redirectInternal>[1],
) => {
  const locale = await getLocale();

  return redirectInternal(
    {
      href: to,
      locale,
    },
    redirectType,
  );
};
