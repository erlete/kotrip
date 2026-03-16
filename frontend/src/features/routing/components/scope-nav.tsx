'use client';

import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

/**
 * Elemento de navegación para la barra de pestañas de scope.
 */
export interface ScopeNavItem {
  /** Etiqueta visible de la pestaña. */
  label: string;
  /** Identificador de prueba para testing. */
  dataTestId: string;
  /** Ruta de destino de la pestaña. */
  href: string;
  /** Icono de la pestaña (componente Lucide). */
  icon: LucideIcon;
  /** Indica si la pestaña está activa actualmente. */
  isActive: boolean;
}

/**
 * Props del componente ScopeNav.
 */
interface ScopeNavProps {
  /** Lista de elementos de navegación a renderizar como pestañas. */
  items: ScopeNavItem[];
  /** Clase CSS adicional opcional. */
  className?: string;
}

/**
 * Componente genérico de navegación por pestañas dentro de un scope.
 * Componente único de navegación por pestañas para todos los scopes
 * (curso, unidad, etc.) proporcionando una interfaz unificada.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX de la barra de navegación de scope.
 */
export default function ScopeNav({ items, className }: ScopeNavProps) {
  return (
    <nav
      className={clsx(
        'sticky top-[calc(4rem+2.75rem)] z-[var(--z-scopebar)] bg-[var(--bg-dark)] shadow-[0_0_0_100vmax_var(--bg-dark)] [clip-path:inset(0_-100vmax)] mb-8',
        'after:content-[""] after:absolute after:bottom-0 after:h-px after:bg-[var(--border)] after:left-1/2 after:-translate-x-1/2 after:max-w-[calc(100svw-19rem)]',
        className,
      )}
    >
      <div className="max-w-[var(--container-xl)] mx-auto">
        <div className="flex gap-2 items-center overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-2 py-4 px-5 text-[var(--text-muted)] no-underline font-medium text-sm border-b-2 border-transparent transition-[color,border-color,background-color] duration-200 whitespace-nowrap relative',
                  '[&_svg]:shrink-0 [&_svg]:transition-colors [&_svg]:duration-200',
                  'hover:text-[var(--text)] hover:bg-[var(--bg-light)]',
                  'max-sm:py-3.5 max-sm:px-4 max-sm:text-[0.8125rem] max-sm:[&_span]:hidden max-sm:[&_svg]:w-5 max-sm:[&_svg]:h-5',
                  item.isActive &&
                    'text-[var(--primary-500)] border-b-[var(--primary-500)] [&_svg]:text-[var(--primary-500)]',
                )}
                data-testid={item.dataTestId}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
