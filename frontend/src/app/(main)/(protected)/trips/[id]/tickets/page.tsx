import { getSession } from '@/features/auth/cookies';
import { composePage } from '@/features/routing';
import {
  fetchExpenses,
  fetchItinerary,
  fetchTickets,
  fetchTrip,
  fetchTripMembers,
} from '@/features/trips/services/trips-api';
import TripTicketsView from '@/features/trips/views/trip-tickets-view';
import { Role } from '@kotrip/data';

export default composePage({
  access: { roles: [Role.USER, Role.ADMIN] },
  component: Page,
});

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [tripResult, ticketsResult, itineraryResult, expensesResult, membersResult, session] =
    await Promise.all([
      fetchTrip(id),
      fetchTickets(id),
      fetchItinerary(id),
      fetchExpenses(id),
      fetchTripMembers(id),
      getSession(),
    ]);

  const trip = 'trip' in tripResult ? tripResult.trip : null;
  const tickets = 'tickets' in ticketsResult ? ticketsResult.tickets : [];
  const stops = 'stops' in itineraryResult ? itineraryResult.stops : [];
  const expenses = 'expenses' in expensesResult ? expensesResult.expenses : [];
  const members = 'members' in membersResult ? membersResult.members : [];

  const currentMember = members.find((m) => m.user.id === session?.id) ?? null;

  return (
    <TripTicketsView
      trip={trip}
      tickets={tickets}
      stops={stops}
      expenses={expenses}
      canManageTickets={currentMember?.canManageTickets ?? false}
    />
  );
}
