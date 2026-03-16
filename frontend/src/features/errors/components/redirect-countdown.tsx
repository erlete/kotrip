'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RedirectCountdownProps {
  redirectPath: string;
  delay: number;
  destination: string;
}

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
