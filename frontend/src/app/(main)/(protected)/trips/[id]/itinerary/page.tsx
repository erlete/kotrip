import { composePage } from '@/features/routing';
import { fetchItinerary, fetchTrip } from '@/features/trips/services/trips-api';
import TripItineraryView from '@/features/trips/views/trip-itinerary-view';
import { Role } from '@kotrip/data';

export default composePage({
  access: { roles: [Role.USER, Role.ADMIN] },
  component: Page,
});

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [tripResult, itineraryResult] = await Promise.all([
    fetchTrip(id),
    fetchItinerary(id),
  ]);

  const trip = 'trip' in tripResult ? tripResult.trip : null;
  const stops = 'stops' in itineraryResult ? itineraryResult.stops : [];

  return (
    <TripItineraryView
      trip={trip}
      stops={stops}
    />
  );
}
