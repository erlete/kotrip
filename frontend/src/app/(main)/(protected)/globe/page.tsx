import { GlobeView } from '@/features/globe';
import { composePage } from '@/features/routing';
import {
  fetchItinerary,
  fetchTrips,
} from '@/features/trips/services/trips-api';
import { Globe2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('Globe');

  return {
    title: t('title'),
  };
}

export default composePage({
  sidebar: {
    labelKey: '/globe',
    icon: Globe2,
    order: 20,
  },
  component: Page,
});

/**
 * Página del globo terráqueo.
 *
 * Obtiene las paradas de itinerario del usuario para mostrar
 * marcadores en los lugares visitados.
 */
async function Page() {
  const tripsResult = await fetchTrips();
  const trips = 'trips' in tripsResult ? tripsResult.trips : [];

  const itineraryResults = await Promise.all(
    trips.map((trip) => fetchItinerary(trip.id)),
  );

  const visitedPlaces: { lat: number; lng: number; name: string }[] = [];
  const seen = new Set<string>();

  for (const result of itineraryResults) {
    if (!('stops' in result)) continue;
    for (const stop of result.stops) {
      const key = `${stop.latitude},${stop.longitude}`;
      if (seen.has(key)) continue;
      seen.add(key);
      visitedPlaces.push({
        lat: stop.latitude,
        lng: stop.longitude,
        name: stop.name,
      });
    }
  }

  return <GlobeView visitedPlaces={visitedPlaces} />;
}
