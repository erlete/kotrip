import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { getLocale } from 'next-intl/server';
import { defaultLocale, locales, pathnames } from './constants';
import { Pathname } from './types';

export const routing = defineRouting({
  defaultLocale,
  locales,
  pathnames,
  localePrefix: 'never',
  localeCookie: true,
});

const { redirect: redirectInternal, ...rest } = createNavigation(routing);

export const { Link, getPathname, usePathname, useRouter, permanentRedirect } =
  rest;

type BaseRedirectTo = Parameters<typeof redirectInternal>[0];
type RedirectTo = Omit<BaseRedirectTo, 'locale'>;

export const redirect = async (
  to: RedirectTo | (Pathname & {}),
  redirectType?: Parameters<typeof redirectInternal>[1],
) => {
  const locale = await getLocale();

  const target = (typeof to === 'string' ? { href: to } : to) as BaseRedirectTo;

  return redirectInternal(
    {
      ...target,
      locale,
    },
    redirectType,
  );
};
