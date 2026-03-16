'use client';

import { useRouter } from '@/features/i18n';
import type {
  Expense,
  ItineraryStop,
  Ticket,
} from '@/features/trips/services/trips-api';
import {
  createTicket,
  updateTicket,
} from '@/features/trips/services/trips-api';
import { Button, InputGroup, Label, Modal, TextField } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState, useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';

/**
 * Props del modal de creación/edición de tickets.
 */
interface TicketModalProps {
  /** ID del viaje. */
  tripId: string;
  /** Paradas del itinerario para el selector. */
  stops: ItineraryStop[];
  /** Gastos del viaje para el selector de gasto vinculado. */
  expenses: Expense[];
  /** Ticket existente si se está editando. Null para creación. */
  ticket: Ticket | null;
  /** Indica si el modal está abierto. */
  isOpen: boolean;
  /** Callback para cambiar el estado de apertura. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal para crear o editar un ticket de viaje.
 */
export function TicketModal({
  tripId,
  stops,
  expenses,
  ticket,
  isOpen,
  onOpenChange,
}: TicketModalProps) {
  const t = useTranslations('Trips.tickets');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = ticket !== null;

  const [selectedStopId, setSelectedStopId] = useState<string>(
    () => (ticket?.tripItineraryId as unknown as string) ?? stops[0]?.id ?? '',
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const description = (form.get('description') as string) || undefined;
    const objectUrl = (form.get('objectUrl') as string) || undefined;
    const tripItineraryId = selectedStopId;
    const expenseId = (form.get('expenseId') as string) || undefined;

    if (!name || !tripItineraryId) return;

    startTransition(async () => {
      const body = {
        name,
        description,
        objectUrl,
        tripItineraryId,
        expenseId: expenseId || undefined,
      };

      const result = isEditing
        ? await updateTicket(tripId, ticket.id, body)
        : await createTicket(tripId, body);

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!isPending) onOpenChange(open);
        }}
      >
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {isEditing ? t('editTicket') : t('addTicket')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <form
                id="ticket-form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                {/* Nombre */}
                <TextField
                  name="name"
                  isRequired
                  defaultValue={ticket?.name ?? ''}
                >
                  <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                    {t('fieldName')}
                  </Label>
                  <InputGroup>
                    <InputGroup.Input
                      type="text"
                      maxLength={200}
                      placeholder={t('fieldNamePlaceholder')}
                    />
                  </InputGroup>
                </TextField>

                {/* Descripción */}
                <TextField
                  name="description"
                  defaultValue={
                    (ticket?.description as unknown as string) ?? ''
                  }
                >
                  <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                    {t('fieldDescription')}
                  </Label>
                  <InputGroup>
                    <InputGroup.Input
                      type="text"
                      maxLength={1000}
                      placeholder={t('fieldDescriptionPlaceholder')}
                    />
                  </InputGroup>
                </TextField>

                {/* URL del archivo */}
                <TextField
                  name="objectUrl"
                  defaultValue={(ticket?.objectUrl as unknown as string) ?? ''}
                >
                  <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                    {t('fieldUrl')}
                  </Label>
                  <InputGroup>
                    <InputGroup.Input
                      type="url"
                      placeholder="https://..."
                    />
                  </InputGroup>
                </TextField>

                {/* Parada vinculada */}
                <div>
                  <label className="text-sm font-semibold text-[var(--text-subtitle)] mb-1 block">
                    {t('linkedStop')}
                  </label>
                  <select
                    value={selectedStopId}
                    onChange={(e) => setSelectedStopId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--rounded-sm)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary-500)] transition-colors"
                  >
                    {stops.map((s) => (
                      <option
                        key={s.id}
                        value={s.id}
                      >
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gasto vinculado (opcional) */}
                {expenses.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-[var(--text-subtitle)] mb-1 block">
                      {t('linkedExpense')}
                    </label>
                    <select
                      name="expenseId"
                      defaultValue={
                        (ticket?.expenseId as unknown as string) ?? ''
                      }
                      className="w-full px-3 py-2 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--rounded-sm)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary-500)] transition-colors"
                    >
                      <option value="">-</option>
                      {expenses.map((exp) => (
                        <option
                          key={exp.id}
                          value={exp.id}
                        >
                          {Number(exp.quantity).toFixed(2)} € -{' '}
                          {new Date(exp.paidAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                slot="close"
                variant="ghost"
                isDisabled={isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                form="ticket-form"
                variant="primary"
                isDisabled={isPending}
              >
                {isPending
                  ? isEditing
                    ? t('saving')
                    : t('creating')
                  : isEditing
                    ? t('save')
                    : t('addTicket')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
