'use client';

import { Link, useRouter } from '@/features/i18n';
import type {
  ItineraryStop,
  Ticket,
  TripDetail,
} from '@/features/trips/services/trips-api';
import {
  deleteItineraryStop,
  reorderItinerary,
} from '@/features/trips/services/trips-api';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { Button } from '@heroui/react';
import {
  ArrowLeft,
  FileText,
  GripVertical,
  Map as MapIcon,
  Pencil,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { ItineraryDayTabs } from '../components/itinerary-day-tabs';
import { ItineraryStopDetail } from '../components/itinerary-stop-detail';
import { ItineraryStopModal } from '../components/itinerary-stop-modal';

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
  /** Lista de tickets del viaje. */
  tickets: Ticket[];
  /** Si el usuario puede editar el itinerario. */
  canEditDetails: boolean;
}

/**
 * Agrupa las paradas por la fecha (día) de arriveAt.
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
 */
export default function TripItineraryView({
  trip,
  stops: initialStops,
  tickets,
  canEditDetails,
}: TripItineraryViewProps) {
  const t = useTranslations('Trips.itinerary');
  const format = useFormatter();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [stops, setStops] = useState(initialStops);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<ItineraryStop | null>(null);

  /** Map of stopId → tickets for that stop. */
  const ticketsByStop = useMemo(() => {
    const map = new Map<string, Ticket[]>();
    for (const ticket of tickets) {
      const stopId = ticket.tripItineraryId as unknown as string | null;
      if (!stopId) continue;
      const existing = map.get(stopId) ?? [];
      existing.push(ticket);
      map.set(stopId, existing);
    }
    return map;
  }, [tickets]);

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

  function handleAddStop() {
    setEditingStop(null);
    setIsModalOpen(true);
  }

  function handleEditStop(stop: ItineraryStop) {
    setEditingStop(stop);
    setIsModalOpen(true);
  }

  function handleDeleteStop(stopId: string) {
    if (!trip || !confirm(t('confirmDelete'))) return;

    startTransition(async () => {
      const result = await deleteItineraryStop(trip.id, stopId);
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination || !trip) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;

    const reordered = Array.from(stops);
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setStops(reordered);

    startTransition(async () => {
      const res = await reorderItinerary(
        trip.id,
        reordered.map((s) => s.id),
      );
      if ('error' in res) {
        toast.error(res.error);
        setStops(initialStops);
        return;
      }
      router.refresh();
    });
  }

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
          href={`/trips/${trip.id}`}
          className="flex items-center gap-1.5 text-sm text-[var(--primary-500)] no-underline hover:underline"
        >
          <ArrowLeft size={16} />
          {t('backToTrip')}
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapIcon
            size={24}
            className="text-[var(--primary-400)]"
          />
          <h1 className="text-xl font-bold text-[var(--text)] m-0 tracking-tight">
            {t('title')} - {trip.name}
          </h1>
        </div>
        {canEditDetails && (
          <Button
            variant="primary"
            size="sm"
            onPress={handleAddStop}
          >
            <PlusCircle size={15} />
            {t('addStop')}
          </Button>
        )}
      </div>

      {stops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)]">
          <MapIcon
            size={32}
            className="text-[var(--text-muted)] mb-3"
          />
          <p className="text-sm text-[var(--text-muted)]">{t('noStops')}</p>
          {canEditDetails && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onPress={handleAddStop}
            >
              <PlusCircle size={15} />
              {t('addStop')}
            </Button>
          )}
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
          <div className="grid grid-cols-[1fr_380px] gap-4 max-lg:grid-cols-1">
            <div className="h-[500px] rounded-[var(--rounded-lg)] overflow-hidden border border-[var(--border)]">
              <ItineraryMap
                stops={filteredStops}
                selectedIndex={selectedIndex}
                onSelectStop={setSelectedIndex}
              />
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="stops">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-3 overflow-y-auto max-h-[500px]"
                  >
                    {filteredStops.map((stop, idx) => (
                      <Draggable
                        key={stop.id}
                        draggableId={stop.id}
                        index={idx}
                        isDragDisabled={!canEditDetails || selectedDay !== null}
                      >
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={`relative group rounded-[var(--rounded-lg)] transition-all ${
                              idx === selectedIndex
                                ? 'ring-2 ring-[var(--primary-500)]'
                                : 'opacity-70 hover:opacity-100'
                            } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          >
                            <button
                              type="button"
                              className="w-full text-left cursor-pointer border-0 p-0 bg-transparent"
                              onClick={() => setSelectedIndex(idx)}
                            >
                              <ItineraryStopDetail
                                stop={stop}
                                number={stop.order + 1}
                              />
                            </button>

                            {/* Ticket badge */}
                            {(ticketsByStop.get(stop.id)?.length ?? 0) > 0 && (
                              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(42,168,148,0.15)] text-[var(--primary-400)] text-xs font-medium">
                                <FileText size={10} />
                                {ticketsByStop.get(stop.id)!.length}
                              </div>
                            )}

                            {/* Action buttons */}
                            {canEditDetails && (
                              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div
                                  {...dragProvided.dragHandleProps}
                                  className="p-1.5 rounded-[var(--rounded-sm)] text-[var(--text-muted)] hover:text-[var(--primary-400)] hover:bg-[rgba(42,168,148,0.1)] transition-colors cursor-grab"
                                >
                                  <GripVertical size={14} />
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditStop(stop);
                                  }}
                                  className="p-1.5 rounded-[var(--rounded-sm)] text-[var(--text-muted)] hover:text-[var(--primary-400)] hover:bg-[rgba(42,168,148,0.1)] transition-colors border-0 bg-transparent cursor-pointer"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteStop(stop.id);
                                  }}
                                  className="p-1.5 rounded-[var(--rounded-sm)] text-[var(--text-muted)] hover:text-red-400 hover:bg-[rgba(239,68,68,0.1)] transition-colors border-0 bg-transparent cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </>
      )}

      {/* Modal de creación/edición */}
      {canEditDetails && (
        <ItineraryStopModal
          tripId={trip.id}
          stop={editingStop}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );
}
