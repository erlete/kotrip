import { composePage } from '@/features/routing';
import { SupportView } from '@/features/support';
import { Headset } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('Routes');

  return {
    title: t('/support'),
  };
}

export default composePage({
  component: Page,
});

async function Page() {
  return <SupportView />;
}
