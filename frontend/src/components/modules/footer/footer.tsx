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
    <footer className="row-start-3 border-t border-[var(--border)] text-[var(--text-muted)] mt-12 px-2 py-5 flex flex-col items-center justify-center gap-3">
      {appConfig.brand.footerImages.length > 0 && (
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
      )}
      <div className="flex items-center gap-2.5 text-sm font-medium">
        <Image
          src="/assets/svg/logo.svg"
          alt="footerIsotip"
          width={24}
          height={24}
        />
        <span>Kotrip · {year}</span>
      </div>
    </footer>
  );
};

export default Footer;
