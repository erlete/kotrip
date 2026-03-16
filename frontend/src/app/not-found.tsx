import { ProtectedLayout } from '@/components/layout/protected-layout';
import PublicBaseLayout from '@/components/layout/public-base-layout';
import { getSession } from '@/features/auth';
import NotFoundView from '@/features/errors/views/not-found-view';
import { getTranslations } from 'next-intl/server';

export default async function NotFoundPage() {
  const session = await getSession();
  const t = await getTranslations('Errors.notFound');

  if (session) {
    return (
      <ProtectedLayout>
        <NotFoundView
          redirectPath="/home"
          destination={t('home')}
        />
      </ProtectedLayout>
    );
  }

  return (
    <PublicBaseLayout className="flex flex-col items-center justify-center gap-6 [&_h1]:text-[var(--primary-500)] [&_p]:text-[var(--text)] [&_p]:text-xl [&_p]:max-w-[40ch]">
      <NotFoundView destination={t('home')} />
    </PublicBaseLayout>
  );
}
