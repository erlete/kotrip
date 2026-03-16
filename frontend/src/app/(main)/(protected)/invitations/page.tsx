import { composePage } from '@/features/routing';
import { fetchMyInvitations } from '@/features/trips/services/trips-api';
import InvitationsView from '@/features/trips/views/invitations-view';
import { Role } from '@kotrip/data';
import { Mail } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('Routes');

  return {
    title: t('/invitations'),
  };
}

export default composePage({
  access: { roles: [Role.USER, Role.ADMIN] },
  sidebar: {
    labelKey: '/invitations',
    icon: Mail,
    order: 15,
  },
  component: Page,
});

async function Page() {
  const result = await fetchMyInvitations();

  const invitations = 'invitations' in result ? result.invitations : [];

  return <InvitationsView invitations={invitations} />;
}
