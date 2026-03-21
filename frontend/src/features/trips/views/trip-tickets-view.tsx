'use client';

import { Link, useRouter } from '@/features/i18n';
import type {
  Expense,
  ItineraryStop,
  Ticket,
  TripDetail,
} from '@/features/trips/services/trips-api';
import { deleteTicket } from '@/features/trips/services/trips-api';
import { Button } from '@heroui/react';
import { ArrowLeft, FileText, PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { TicketCard } from '../components/ticket-card';
import { TicketModal } from '../components/ticket-modal';

/**
 * Props de la vista de tickets.
 */
interface TripTicketsViewProps {
  /** Detalle del viaje (puede ser null si no se encontró). */
  trip: TripDetail | null;
  /** Lista de tickets del viaje. */
  tickets: Ticket[];
  /** Lista de paradas del itinerario (para resolver nombres). */
  stops: ItineraryStop[];
  /** Lista de gastos del viaje (para vincular). */
  expenses: Expense[];
  /** Si el usuario puede gestionar tickets. */
  canManageTickets: boolean;
}

/**
 * Vista de la página de tickets de un viaje.
 */
export default function TripTicketsView({
  trip,
  tickets,
  stops,
  expenses,
  canManageTickets,
}: TripTicketsViewProps) {
  const t = useTranslations('Trips.tickets');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  /** Mapa de ID de parada a nombre para resolver referencias en tickets. */
  const stopNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const stop of stops) {
      map.set(stop.id, stop.name);
    }
    return map;
  }, [stops]);

  function handleAddTicket() {
    setEditingTicket(null);
    setIsModalOpen(true);
  }

  function handleEditTicket(ticket: Ticket) {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  }

  function handleDeleteTicket(ticketId: string) {
    if (!trip || !confirm(t('confirmDelete'))) return;

    startTransition(async () => {
      const result = await deleteTicket(trip.id, ticketId);
      if ('error' in result) {
        toast.error(result.error);
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
          <FileText
            size={24}
            className="text-[var(--primary-400)]"
          />
          <h1 className="text-xl font-bold text-[var(--text)] m-0 tracking-tight">
            {t('title')} - {trip.name}
          </h1>
        </div>
        {canManageTickets && stops.length > 0 && (
          <Button
            variant="primary"
            size="sm"
            onPress={handleAddTicket}
          >
            <PlusCircle size={15} />
            {t('addTicket')}
          </Button>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)]">
          <FileText
            size={32}
            className="text-[var(--text-muted)] mb-3"
          />
          <p className="text-sm text-[var(--text-muted)]">{t('noTickets')}</p>
          {canManageTickets && stops.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onPress={handleAddTicket}
            >
              <PlusCircle size={15} />
              {t('addTicket')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              stopNameMap={stopNameMap}
              canEdit={canManageTickets}
              onEdit={handleEditTicket}
              onDelete={handleDeleteTicket}
            />
          ))}
        </div>
      )}

      {/* Modal de creación/edición */}
      {canManageTickets && (
        <TicketModal
          tripId={trip.id}
          stops={stops}
          expenses={expenses}
          ticket={editingTicket}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );
}
