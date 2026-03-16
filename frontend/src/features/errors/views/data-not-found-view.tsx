'use client';

import { Button } from '@heroui/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function DataNotFoundView({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  const router = useRouter();
  const tBtn = useTranslations('Buttons');

  /** Navega hacia atrás en el historial o redirige al inicio si no hay historial. */
  const handleBack = () => {
    if (window.history.length > 2) router.back();
    else router.push('/');
  };

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-4 p-4',
        className,
      )}
      data-testid="error-view"
    >
      <h2 className="text-3xl font-bold text-center text-[var(--text)]">
        {title}
      </h2>
      <p className="text-lg text-center text-[var(--text-muted)]">
        {description}
      </p>
      <Button
        variant="outline"
        onPress={handleBack}
      >
        {tBtn('buttonBack')}
      </Button>
    </div>
  );
}
