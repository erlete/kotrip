'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Props del componente RedirectCountdown.
 */
interface RedirectCountdownProps {
  /** Ruta a la que se redirigira automaticamente. */
  redirectPath: string;
  /** Tiempo de espera en segundos antes de la redireccion. */
  delay: number;
  /** Nombre del destino para mostrar en el mensaje. */
  destination: string;
}

/**
 * Componente de cuenta regresiva con redireccion automatica.
 *
 * Muestra un mensaje con el tiempo restante y redirige al usuario
 * a la ruta indicada cuando el contador llega a cero.
 */
export function RedirectCountdown({
  redirectPath,
  delay,
  destination,
}: RedirectCountdownProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(delay);
  const t = useTranslations('Errors.redirect');

  useEffect(() => {
    if (countdown <= 0) {
      router.push(redirectPath);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router, redirectPath]);

  if (countdown <= 0) {
    return null;
  }

  return (
    <p className="text-sm text-[var(--text-muted)]">
      {t('redirecting', { destination, count: countdown.toString() })}
    </p>
  );
}
