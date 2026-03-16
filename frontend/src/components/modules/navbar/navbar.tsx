/**
 * @file Navbar.ts
 * @description
 * -----------------------------------------------------
 * Archivo que contiene el componente de Nav
 * -----------------------------------------------------
 * @version 0.0.1a
 * @created 2025-01-27
 * @modified 2025-05-07



 * */

'use client';

import LocaleSwitcher from '@/components/ui/locale/locale-switcher';
import ThemeToggle from '@/components/ui/toggle/theme-toggle';
import { appConfig } from '@/config';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const { path, alt, dimmensions } = appConfig.brand.logo;
  return (
    <nav className="grid grid-cols-2 px-4 py-3">
      <Link href={'/'}>
        <Image
          src={path.normal}
          alt={alt}
          width={dimmensions.width}
          height={dimmensions.height}
        />
      </Link>

      <div className="flex flex-row items-center justify-end gap-4 p-2">
        {appConfig.theme.allowToggle && <ThemeToggle />}
        {appConfig.i18n.availableLanguages.length > 1 && <LocaleSwitcher />}
      </div>
    </nav>
  );
};

export default Navbar;
