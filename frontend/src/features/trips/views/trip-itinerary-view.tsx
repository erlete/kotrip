'use client';

import { Link } from '@/features/i18n';
import type {
  ItineraryStop,
  TripDetail,
} from '@/features/trips/services/trips-api';
import { Button } from '@heroui/react';
import { ArrowLeft, Map as MapIcon, PlusCircle } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import { ItineraryDayTabs } from '../components/itinerary-day-tabs';
import { ItineraryStopDetail } from '../components/itinerary-stop-detail';

/**
 * Carga diferida del mapa. Leaflet requiere acceso al DOM (no compatible con SSR).
 */
const ItineraryMap = dynamic(
  () =>
    import('../components/itinerary-map').then((mod) => ({
      default: mod.ItineraryMap,
    })),
  { ssr: false },
);

/**
 * Props de la vista del itinerario.
 */
interface TripItineraryViewProps {
  /** Detalle del viaje (puede ser null si no se encontró). */
  trip: TripDetail | null;
  /** Lista de paradas del itinerario ordenadas por posición. */
  stops: ItineraryStop[];
}

/**
 * Agrupa las paradas por la fecha (día) de arriveAt.
 * Las paradas sin arriveAt van al grupo "unscheduled".
 *
 * @param stops Lista de paradas.
 * @param formatDate Función que formatea una fecha a texto de día.
 * @returns Mapa de clave de día a índices de paradas.
 */
function groupStopsByDay(
  stops: ItineraryStop[],
  formatDate: (date: Date) => string,
) {
  const groups: Map<string, number[]> = new Map();

  stops.forEach((stop, idx) => {
    const arriveAt = stop.arriveAt as unknown as string | null;
    const key = arriveAt ? formatDate(new Date(arriveAt)) : 'unscheduled';

    const existing = groups.get(key) ?? [];
    existing.push(idx);
    groups.set(key, existing);
  });

  return groups;
}

/**
 * Vista completa del itinerario de un viaje.
 *
 * Muestra un mapa interactivo con marcadores numerados, polilíneas entre paradas,
 * pestañas de filtro por día y un panel lateral con el detalle de la parada seleccionada.
 */
export default function TripItineraryView({
  trip,
  stops,
}: TripItineraryViewProps) {
  const t = useTranslations('Trips.itinerary');
  const format = useFormatter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const formatDayLabel = useCallback(
    (date: Date) => format.dateTime(date, { day: 'numeric', month: 'short' }),
    [format],
  );

  const dayGroups = useMemo(
    () => groupStopsByDay(stops, formatDayLabel),
    [stops, formatDayLabel],
  );
  const dayKeys = useMemo(() => Array.from(dayGroups.keys()), [dayGroups]);

  const filteredStops = useMemo(() => {
    if (selectedDay === null) return stops;
    const indices = dayGroups.get(selectedDay) ?? [];
    return indices.map((i) => stops[i]);
  }, [stops, selectedDay, dayGroups]);

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-[var(--text-muted)]">{t('tripNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-md)] py-10 px-8 w-full mx-auto max-w-[72rem]">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <Link
          href={{ pathname: '/trips/[id]', params: { id: trip.id } }}
          className="flex items-center gap-1.5 text-sm text-[var(--primary-500)] no-underline hover:underline"
        >
          <ArrowLeft size={16} />
          {t('backToTrip')}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <MapIcon
          size={24}
          className="text-[var(--primary-400)]"
        />
        <h1 className="text-xl font-bold text-[var(--text)] m-0 tracking-tight">
          {t('title')} - {trip.name}
        </h1>
      </div>

      {stops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)]">
          <MapIcon
            size={32}
            className="text-[var(--text-muted)] mb-3"
          />
          <p className="text-sm text-[var(--text-muted)]">{t('noStops')}</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            isDisabled
          >
            <PlusCircle size={15} />
            {t('addStop')}
          </Button>
        </div>
      ) : (
        <>
          {/* Pestañas de día */}
          {dayKeys.length > 1 && (
            <ItineraryDayTabs
              days={dayKeys}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          )}

          {/* Mapa + Detalle */}
          <div className="grid grid-cols-[1fr_320px] gap-4 max-lg:grid-cols-1">
            <div className="h-[500px] rounded-[var(--rounded-lg)] overflow-hidden border border-[var(--border)]">
              <ItineraryMap
                stops={filteredStops}
                selectedIndex={selectedIndex}
                onSelectStop={setSelectedIndex}
              />
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px]">
              {filteredStops.map((stop, idx) => (
                <button
                  key={stop.id}
                  type="button"
                  className={`text-left cursor-pointer border-0 p-0 bg-transparent rounded-[var(--rounded-lg)] transition-all ${
                    idx === selectedIndex
                      ? 'ring-2 ring-[var(--primary-500)]'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => setSelectedIndex(idx)}
                >
                  <ItineraryStopDetail
                    stop={stop}
                    number={stop.order + 1}
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
