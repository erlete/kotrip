import { getSession } from '@/features/auth/cookies';
import { composePage } from '@/features/routing';
import { TripDetailView } from '@/features/trips';
import {
  fetchTrip,
  fetchTripMembers,
} from '@/features/trips/services/trips-api';
import { Role } from '@kotrip/data';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('Trips');

  return {
    title: t('detail'),
  };
}

export default composePage({
  access: { roles: [Role.USER, Role.ADMIN] },
  component: Page,
});

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [tripResult, membersResult, session] = await Promise.all([
    fetchTrip(id),
    fetchTripMembers(id),
    getSession(),
  ]);

  const trip = 'trip' in tripResult ? tripResult.trip : null;
  const members = 'members' in membersResult ? membersResult.members : [];

  const currentMember =
    session && members.length > 0
      ? (members.find((m) => m.user.id === session.id) ?? null)
      : null;

  return (
    <TripDetailView
      trip={trip}
      members={members}
      currentMember={currentMember}
    />
  );
}
