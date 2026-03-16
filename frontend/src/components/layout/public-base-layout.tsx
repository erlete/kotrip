/**
 * @file PublicBaseLayout.txs
 * @description
 * -----------------------------------------------------
 * Layout común para las páginas públicas
 * -----------------------------------------------------
 * @version 0.0.1a
 * @created 2026-01-09
 * @modified 2026-01-09




 * */

import Footer from '@/components/modules/footer/footer';
import Navbar from '@/components/modules/navbar/navbar';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  className?: string; // optional additional class names
};

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
