'use client';

/**
 * @file footer.tsx
 * @description
 * Pie de pagina de la aplicacion. Muestra los logos de patrocinadores
 * o certificaciones y el copyright de Kotrip.
 */
import { appConfig } from '@/config';
import { useTheme } from '@/features/theme';
import Image from 'next/image';

/**
 * Componente de pie de pagina.
 *
 * Muestra los logos configurados en `appConfig.brand.footerImages` con
 * soporte de tema claro/oscuro, y el copyright con el ano actual.
 */
const Footer = () => {
  const year = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer className="row-start-3 border-t border-[var(--border)] text-[var(--text-muted)] mt-12 px-2 pt-4 pb-1 flex flex-col items-center justify-center gap-2">
      <section className="px-4 flex flex-row items-center justify-center gap-4 overflow-hidden h-11 w-full [&_img]:w-fit [&_img]:h-full [&_img]:object-cover">
        {appConfig.brand.footerImages.map((logo) => (
          <Image
            key={logo.alt}
            src={logo.src[theme]}
            alt={logo.alt}
            width={logo.dimmensions.width || 100}
            height={logo.dimmensions.height || 100}
          />
        ))}
      </section>
      <p className="inline-flex items-center text-xs [&_img]:mr-2">
        <Image
          src="/assets/svg/logo.svg"
          alt={'footerIsotip'}
          width={32}
          height={32}
        />{' '}
        {year}
        {' - Kotrip'}
      </p>
    </footer>
  );
};

export default Footer;
