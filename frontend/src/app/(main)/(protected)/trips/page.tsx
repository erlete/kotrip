import { composePage } from '@/features/routing';
import { TripsListView } from '@/features/trips';
import {
  fetchMyInvitations,
  fetchTrips,
} from '@/features/trips/services/trips-api';
import { Role } from '@kotrip/data';
import { Plane } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('Routes');

  return {
    title: t('/trips'),
  };
}

export default composePage({
  access: { roles: [Role.USER, Role.ADMIN] },
  sidebar: {
    labelKey: '/trips',
    icon: Plane,
    order: 10,
  },
  component: Page,
});

async function Page() {
  const [tripsResult, invitationsResult] = await Promise.all([
    fetchTrips(),
    fetchMyInvitations(),
  ]);

  const trips = 'trips' in tripsResult ? tripsResult.trips : [];
  return <TripsListView trips={trips} />;
}
