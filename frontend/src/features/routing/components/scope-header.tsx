'use client';

import clsx from 'clsx';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Elemento de breadcrumb del ScopeHeader.
 */
interface ScopeBreadcrumb {
  /** Etiqueta visible del breadcrumb. */
  label: string;
  /** Ruta absoluta del destino cuando el breadcrumb es navegable. */
  href?: string;
}

/**
 * Props del componente ScopeHeader.
 */
interface ScopeHeaderProps {
  /** Secuencia completa de breadcrumbs del scope actual. */
  breadcrumbs: [ScopeBreadcrumb, ...ScopeBreadcrumb[]];
  /** Acciones opcionales a renderizar en el lado derecho de la cabecera. */
  children?: ReactNode;
}

/**
 * Cabecera reutilizable de scope con breadcrumbs deterministas.
 *
 * Renderiza la ruta jerárquica completa del recurso actual, permitiendo
 * navegación predecible entre scopes sin depender del historial del navegador.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX de la cabecera de scope.
 */
export default function ScopeHeader({
  breadcrumbs,
  children,
}: ScopeHeaderProps) {
  const lastIndex = breadcrumbs.length - 1;

  return (
    <header
      className={clsx(
        'sticky top-16 z-[var(--z-scopebar)] bg-[var(--bg-dark)] shadow-[0_0_0_100vmax_var(--bg-dark)] [clip-path:inset(0_-100vmax)] -mt-8',
        'after:content-[""] after:absolute after:bottom-0 after:h-px after:bg-[var(--border)] after:left-1/2 after:-translate-x-1/2 after:max-w-[calc(100svw-19rem)]',
        'max-sm:px-4',
      )}
    >
      <div className="max-w-[var(--container-xl)] mx-auto flex items-center gap-3 min-h-[2.75rem]">
        <nav
          aria-label="Breadcrumb"
          className="min-w-0"
        >
          <ol className="list-none m-0 p-0 flex items-center gap-2 max-sm:gap-1.5 min-w-0">
            {breadcrumbs.map((breadcrumb, index) => {
              const isCurrent = index === lastIndex;

              return (
                <li
                  key={`${breadcrumb.label}-${index}`}
                  className="flex items-center min-w-0 after:content-['/'] after:text-[var(--text-muted)] after:ml-2 max-sm:after:ml-1.5 last:after:content-none"
                >
                  {breadcrumb.href && !isCurrent ? (
                    <Link
                      href={breadcrumb.href}
                      className="text-sm max-sm:text-[0.8125rem] leading-tight whitespace-nowrap overflow-hidden text-ellipsis min-w-0 max-w-[300px] text-[var(--text-muted)] no-underline font-medium transition-colors duration-200 hover:text-[var(--primary-500)]"
                    >
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span
                      className="text-sm max-sm:text-[0.8125rem] leading-tight whitespace-nowrap overflow-hidden text-ellipsis min-w-0 max-w-[300px] text-[var(--text)] font-semibold"
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {breadcrumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {children && (
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
