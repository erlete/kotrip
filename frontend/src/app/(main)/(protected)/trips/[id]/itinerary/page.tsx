import { getSession } from '@/features/auth/cookies';
import { composePage } from '@/features/routing';
import {
  fetchItinerary,
  fetchTickets,
  fetchTrip,
  fetchTripMembers,
} from '@/features/trips/services/trips-api';
import TripItineraryView from '@/features/trips/views/trip-itinerary-view';
import { Role } from '@kotrip/data';

export default composePage({
  access: { roles: [Role.USER, Role.ADMIN] },
  component: Page,
});

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [tripResult, itineraryResult, ticketsResult, membersResult, session] =
    await Promise.all([
      fetchTrip(id),
      fetchItinerary(id),
      fetchTickets(id),
      fetchTripMembers(id),
      getSession(),
    ]);

  const trip = 'trip' in tripResult ? tripResult.trip : null;
  const stops = 'stops' in itineraryResult ? itineraryResult.stops : [];
  const tickets = 'tickets' in ticketsResult ? ticketsResult.tickets : [];
  const members = 'members' in membersResult ? membersResult.members : [];

  const currentMember = members.find((m) => m.user.id === session?.id) ?? null;

  return (
    <TripItineraryView
      trip={trip}
      stops={stops}
      tickets={tickets}
      canEditDetails={currentMember?.canEditDetails ?? false}
    />
  );
}
