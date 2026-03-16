import { HomeView } from '@/features/home/home-view';
import { composePage } from '@/features/routing';
import {
  fetchMyInvitations,
  fetchTrips,
} from '@/features/trips/services/trips-api';
import { House } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('Routes');

  return {
    title: t('/home'),
  };
}

export default composePage({
  sidebar: {
    labelKey: '/home',
    icon: House,
    order: 1,
  },
  component: Page,
});

async function Page() {
  const [tripsResult, invitationsResult] = await Promise.all([
    fetchTrips(),
    fetchMyInvitations(),
  ]);

  const trips = 'trips' in tripsResult ? tripsResult.trips : [];
  const invitations =
    'invitations' in invitationsResult ? invitationsResult.invitations : [];

  return (
    <HomeView
      trips={trips}
      pendingInvitationCount={
        invitations.filter((i) => i.status === 'PENDING').length
      }
    />
  );
}
