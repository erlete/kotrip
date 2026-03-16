'use client';

import clsx from 'clsx';
import { Book, LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

/**
 * Props del componente Poster.
 */
interface PosterProps {
  /** URL pública del poster. */
  posterUrl?: string;
  /** Título del curso para el atributo alt. */
  title: string;
  /** Variante de tamaño del componente. */
  variant?: 'card' | 'header' | 'full';
  /** Clase CSS adicional. */
  className?: string;
  viewType?: 'list' | 'grid';
  /**
   * Icono a mostrar en el placeholder cuando no hay imagen disponible.
   * Se espera un componente de lucide-react. Por defecto: Book.
   */
  icon?: LucideIcon;
}

/** Clases de dimensión según la variante del poster. */
const variantClasses: Record<string, string> = {
  card: 'aspect-video w-full',
  header: 'aspect-[21/9] w-full max-h-[300px]',
  full: 'w-full h-full',
};

/** Clases de tamaño de icono según la variante. */
const iconSizeClasses: Record<string, string> = {
  card: 'w-12 h-12',
  header: 'w-16 h-16',
  full: 'w-24 h-24',
};

/**
 * Componente que muestra el poster de un curso.
 * Si no hay poster disponible, muestra un placeholder con ícono.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del poster del curso.
 */
export function Poster({
  posterUrl,
  title,
  variant = 'card',
  className,
  viewType = 'grid',
  icon: Icon = Book,
}: PosterProps) {
  const t = useTranslations('Aria.Poster');

  const containerClasses = clsx(
    'relative bg-[var(--primary-50)] flex items-center justify-center overflow-hidden',
    variantClasses[variant],
    className,
  );

  // Si tenemos la URL directamente, usarla (más eficiente)
  const imageUrl = posterUrl;

  // Mostrar placeholder si no hay poster
  if (!imageUrl) {
    if (viewType === 'list') {
      return (
        <Icon
          className={clsx(
            'text-[var(--primary-400)] opacity-60',
            iconSizeClasses[variant],
          )}
        />
      );
    }
    return (
      <div className={containerClasses}>
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-[var(--primary-100)] to-[var(--primary-50)]">
          <Icon
            className={clsx(
              'text-[var(--primary-400)] opacity-60',
              iconSizeClasses[variant],
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={t('coursePoster', { title })}
      fill
      className="object-cover object-center"
      unoptimized
    />
  );
}
