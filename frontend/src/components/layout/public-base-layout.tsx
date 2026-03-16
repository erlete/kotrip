/**
 * @file public-base-layout.tsx
 * @description
 * Layout base para las paginas publicas (no autenticadas).
 * Incluye barra de navegacion, contenido principal y pie de pagina.
 */

import Footer from '@/components/modules/footer/footer';
import Navbar from '@/components/modules/navbar/navbar';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  className?: string; // optional additional class names
};

/**
 * Layout base para paginas publicas.
 *
 * Renderiza la barra de navegacion publica, el contenido centrado
 * con ancho maximo y el pie de pagina.
 */
export default function PublicBaseLayout({ children, className }: Props) {
  return (
    <>
      <Navbar />
      <main
        className={clsx('max-w-[75rem] mx-auto px-4 w-full flex-1', className)}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
