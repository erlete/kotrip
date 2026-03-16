/**
 * @file Topbar.tsx
 * @description
 * Barra superior de navegacion de la aplicacion.
 * Contiene el logotipo, enlaces de navegacion por iconos,
 * selector de idioma y menu desplegable del perfil de usuario.
 */

'use client';

import LocaleSwitcher from '@/components/ui/locale/locale-switcher';
import { appConfig } from '@/config';
import { useSession } from '@/features/auth';
import { getSidebarRoutesForRole } from '@/features/routing';
import { useFormatDateTime } from '@/hooks/use-format-date';
import { isActiveRoute } from '@/lib/navigationRoute';
import { Role } from '@kotrip/data';
import clsx from 'clsx';
import { useTranslations, type Messages } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TopbarAccountDropdown } from './topbar-account-dropdown';

/**
 * Componente de barra superior con navegación, selector de idioma y perfil de usuario.
 *
 * Reemplaza la barra lateral anterior. Muestra el logotipo a la izquierda,
 * enlaces de navegación basados en iconos junto al logo, y a la derecha
 * la fecha del último inicio de sesión, el selector de idioma y el avatar
 * del usuario con menú desplegable.
 */
const TopbarComponent = () => {
  const aria = useTranslations('Aria.Topbar');
  const routeLabels = useTranslations('Routes');
  const { data } = useSession();
  const formatDateTime = useFormatDateTime();
  const pathname = usePathname();

  const role = data?.role as Role;
  const routesAllowed = role ? getSidebarRoutesForRole(role) : [];

  const lastLogInDate = data?.lastLogIn
    ? formatDateTime(data.lastLogIn)
    : undefined;

  const { alt, dimmensions } = appConfig.brand.logo;

  return (
    <header
      className="row-start-1 flex flex-row items-center justify-between gap-4 bg-[var(--bg-dark)]/82 backdrop-blur-[16px] backdrop-saturate-[1.6] border-b border-[var(--border)] px-6 h-14 sticky top-0 z-[var(--z-bars)]"
      role="banner"
      aria-label={aria('topbar')}
      data-testid="topbar"
    >
      {/* Sección izquierda: logotipo + navegación */}
      <div className="flex items-center">
        <Link
          href="/home"
          className="flex items-center gap-2.5 pr-5 mr-1 border-r border-[var(--border)] no-underline"
        >
          <Image
            src="/assets/svg/logo.svg"
            alt={alt}
            width={28}
            height={Math.round(28 * (dimmensions.height / dimmensions.width))}
          />
          <span className="font-bold text-lg tracking-tight text-[var(--text)]">
            Kotrip
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 pl-1">
          {routesAllowed.map((route) => {
            const Icon = route.sidebar.icon;
            const labelKey = route.sidebar.labelKey;
            const active = isActiveRoute(pathname, route.path);

            return (
              <Link
                key={route.path}
                href={route.path}
                className={clsx(
                  'relative flex items-center gap-2 no-underline text-[0.8125rem] font-medium py-[0.4375rem] px-3 rounded-[var(--rounded-sm)] transition-all duration-150',
                  active
                    ? 'text-[var(--text)] bg-[rgba(42,168,148,0.12)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--overlay)]',
                )}
              >
                {Icon && (
                  <Icon
                    size={16}
                    className="flex-shrink-0"
                  />
                )}
                {routeLabels(labelKey as unknown as keyof Messages['Routes'])}
                {active && (
                  <span className="absolute bottom-[-0.6875rem] left-3 right-3 h-0.5 bg-[var(--primary-500)] rounded-t-sm" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sección derecha: fecha, idioma, perfil */}
      <div className="flex flex-row items-center gap-4 shrink-0">
        {lastLogInDate && (
          <p
            className="text-xs text-[var(--text-muted)] whitespace-nowrap max-md:hidden"
            title={aria('lastLoginTooltip')}
          >
            {lastLogInDate}
          </p>
        )}
        {appConfig.i18n.availableLanguages.length > 1 && <LocaleSwitcher />}
        <TopbarAccountDropdown />
      </div>
    </header>
  );
};

export default TopbarComponent;
