/**
 * @file layout.tsx
 * @description
 * Layout de autenticacion con diseno editorial oscuro.
 * Presenta un panel decorativo a la izquierda y el formulario
 * de autenticacion a la derecha, ambos sobre fondo oscuro.
 */

import LocaleSwitcher from '@/components/ui/locale/locale-switcher';
import { ServerAuthGuard } from '@/features/auth';
import { AuthEditorialPanel } from '@/features/auth/components/auth-editorial-panel';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { PropsWithChildren } from 'react';

/** Tipografía serif para títulos editoriales. */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

/** Tipografía geométrica sans-serif para cuerpo de texto. */
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

/**
 * Layout compartido para todas las páginas de autenticación (login, registro, etc.).
 *
 * Aplica un tema oscuro editorial con tipografía diferenciada,
 * un panel de marca a la izquierda y el contenido del formulario a la derecha.
 * El panel editorial permanece a altura completa; solo el panel de formulario
 * es scrollable cuando el contenido excede la altura de la ventana.
 * En pantallas pequeñas el panel editorial se oculta.
 */
export default async function AuthLayout({ children }: PropsWithChildren) {
  return (
    <ServerAuthGuard require="guest">
      <div
        className={`${cormorant.variable} ${manrope.variable} font-[family-name:var(--font-manrope)] grid h-dvh bg-[var(--bg-dark)] text-[var(--text-small)] lg:grid-cols-[1fr_480px]`}
      >
        {/* Panel editorial izquierdo - altura completa, sin scroll */}
        <AuthEditorialPanel />

        {/* Panel de formulario derecho - solo este lado es scrollable */}
        <div className="flex flex-col px-8 py-10 bg-[var(--bg)] lg:border-l lg:border-[var(--border)] lg:px-11 lg:py-12 overflow-y-auto">
          <div className="mb-10 self-end shrink-0">
            <LocaleSwitcher />
          </div>

          <div className="mx-auto flex w-full max-w-[400px] flex-col gap-6 my-auto">
            {children}
          </div>
        </div>
      </div>
    </ServerAuthGuard>
  );
}
