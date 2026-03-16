/**
 * @file TitleComponent.tsx
 * @description
 * -----------------------------------------------------
 * Archivo que contiene el componente de título
 * -----------------------------------------------------
 * @version 0.0.2a
 * @created 2025-01-15
 * @modified 2025-05-02



 * */

'use client';

import { Button } from '@heroui/react';
import clsx from 'clsx';
import { Undo2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TitleComponentProps {
  title: string;
  description?: string;
  backButton?: boolean;
  href?: string;
  className?: string;
}

/**
 * Componente de título de página con soporte para botón de regreso y descripción.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del encabezado de título.
 */
const TitleComponent = ({
  title,
  description,
  backButton,
  href,
  className,
}: TitleComponentProps) => {
  const router = useRouter();
  const tBtn = useTranslations('Buttons');

  /** Navega hacia atrás en el historial o redirige al inicio si no hay historial. */
  const handleBack = () => {
    if (window.history.length > 2) router.back();
    else router.push('/');
  };

  return (
    <header
      className={clsx(
        'flex flex-col items-start justify-start gap-4 w-full [&_h1]:whitespace-pre-line [&_h1]:text-[var(--text-title)] [&_h1]:text-4xl [&_h1]:text-ellipsis [&_h1]:overflow-hidden [&_h1]:w-full [&_h2]:text-[var(--text-subtitle)] [&_h2]:text-2xl [&_h2]:font-normal',
        className,
      )}
    >
      {backButton &&
        (href ? (
          <Link href={href}>
            <Button variant="outline">
              <Undo2 size={16} />
              {tBtn('buttonBack')}
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            onPress={handleBack}
          >
            <Undo2 size={16} />
            {tBtn('buttonBack')}
          </Button>
        ))}
      <h1>{title}</h1>
      {description && <h2>{description}</h2>}
    </header>
  );
};

export default TitleComponent;
