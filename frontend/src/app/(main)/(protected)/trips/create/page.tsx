import { composePage } from '@/features/routing';
import { TripCreateView } from '@/features/trips';
import { Role } from '@kotrip/data';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('Trips');

  return {
    title: t('create'),
  };
}

export default composePage({
  access: { roles: [Role.USER, Role.ADMIN] },
  component: Page,
});

async function Page() {
  return <TripCreateView />;
}
