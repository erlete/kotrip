import { composePage } from '@/features/routing';
import {
  fetchItinerary,
  fetchTickets,
  fetchTrip,
} from '@/features/trips/services/trips-api';
import TripTicketsView from '@/features/trips/views/trip-tickets-view';
import { Role } from '@kotrip/data';

export default composePage({
  access: { roles: [Role.USER, Role.ADMIN] },
  component: Page,
});

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [tripResult, ticketsResult, itineraryResult] = await Promise.all([
    fetchTrip(id),
    fetchTickets(id),
    fetchItinerary(id),
  ]);

  const trip = 'trip' in tripResult ? tripResult.trip : null;
  const tickets = 'tickets' in ticketsResult ? ticketsResult.tickets : [];
  const stops = 'stops' in itineraryResult ? itineraryResult.stops : [];

  return (
    <TripTicketsView
      trip={trip}
      tickets={tickets}
      stops={stops}
    />
  );
}
