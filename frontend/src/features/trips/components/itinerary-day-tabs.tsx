'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';

/**
 * Props del componente de pestañas por día.
 */
interface DayTabsProps {
  /** Lista de claves de día disponibles (fechas formateadas o "unscheduled"). */
  days: string[];
  /** Día actualmente seleccionado (null para mostrar todos). */
  selectedDay: string | null;
  /** Callback al seleccionar un día. */
  onSelectDay: (day: string | null) => void;
}

/**
 * Barra horizontal de pestañas para filtrar paradas del itinerario por día.
 *
 * Incluye un botón "Todos" para mostrar todas las paradas sin filtro,
 * seguido de botones por cada día disponible.
 */
export function ItineraryDayTabs({
  days,
  selectedDay,
  onSelectDay,
}: DayTabsProps) {
  const t = useTranslations('Trips.itinerary');

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <Button
        size="sm"
        variant={selectedDay === null ? 'primary' : 'ghost'}
        onPress={() => onSelectDay(null)}
        className={
          selectedDay === null
            ? 'bg-[var(--primary-500)] text-white'
            : 'text-[var(--text-muted)]'
        }
      >
        {t('allStops')}
      </Button>
      {days.map((day) => (
        <Button
          key={day}
          size="sm"
          variant={selectedDay === day ? 'primary' : 'ghost'}
          onPress={() => onSelectDay(day)}
          className={
            selectedDay === day
              ? 'bg-[var(--primary-500)] text-white'
              : 'text-[var(--text-muted)]'
          }
        >
          {day === 'unscheduled' ? t('unscheduled') : `${t('day')} ${day}`}
        </Button>
      ))}
    </div>
  );
}
