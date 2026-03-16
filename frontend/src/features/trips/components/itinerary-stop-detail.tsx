'use client';

import type { ItineraryStop } from '@/features/trips/services/trips-api';
import { Car, Clock, Footprints, MapPin } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

/**
 * Props del componente de detalle de parada.
 */
interface StopDetailProps {
  /** Datos de la parada seleccionada. */
  stop: ItineraryStop;
  /** Número de orden (base 1) de la parada en el itinerario. */
  number: number;
}

/**
 * Formatea una duración en segundos a un texto legible.
 *
 * @param seconds Duración en segundos.
 * @returns Texto formateado (ej. "2h 30min").
 */
function formatTravelTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}min`;
}

/**
 * Panel de detalle de una parada del itinerario.
 *
 * Muestra el nombre, coordenadas, tiempo de viaje, método de desplazamiento
 * y hora de llegada prevista.
 */
export function ItineraryStopDetail({ stop, number }: StopDetailProps) {
  const t = useTranslations('Trips.itinerary');
  const format = useFormatter();

  const travelTime = stop.travelTime as unknown as number | null;
  const travelMethod = stop.travelMethod as unknown as string | null;
  const arriveAt = stop.arriveAt as unknown as string | null;

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] p-5 flex flex-col gap-3">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--primary-500)] text-white flex items-center justify-center text-sm font-bold shrink-0">
          {number}
        </div>
        <h3 className="text-base font-semibold text-[var(--text)] m-0">
          {stop.name}
        </h3>
      </div>

      {/* Metadatos */}
      <div className="flex flex-col gap-2">
        {/* Coordenadas */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <MapPin
            size={14}
            className="text-[var(--primary-400)]"
          />
          <span>
            {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
          </span>
        </div>

        {/* Tiempo de viaje */}
        {travelTime !== null && travelTime !== undefined && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Clock
              size={14}
              className="text-[var(--primary-400)]"
            />
            <span>
              {t('travelTime')}: {formatTravelTime(travelTime)}
            </span>
          </div>
        )}

        {/* Método de transporte */}
        {travelMethod && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            {travelMethod === 'CAR' ? (
              <Car
                size={14}
                className="text-[var(--primary-400)]"
              />
            ) : (
              <Footprints
                size={14}
                className="text-[var(--primary-400)]"
              />
            )}
            <span>
              {travelMethod === 'CAR'
                ? t('travelMethodCar')
                : t('travelMethodWalking')}
            </span>
          </div>
        )}

        {/* Hora de llegada */}
        {arriveAt && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Clock
              size={14}
              className="text-[var(--primary-400)]"
            />
            <span>
              {t('arriveAt')}:{' '}
              {format.dateTime(new Date(arriveAt), {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
