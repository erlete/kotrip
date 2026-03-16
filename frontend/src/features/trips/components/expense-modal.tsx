'use client';

import { useRouter } from '@/features/i18n';
import type { Expense, TripMember } from '@/features/trips/services/trips-api';
import {
  createExpense,
  updateExpense,
} from '@/features/trips/services/trips-api';
import { Button, InputGroup, Label, Modal, TextField } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState, useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';

/**
 * Props del modal de creación/edición de gastos.
 */
interface ExpenseModalProps {
  /** ID del viaje. */
  tripId: string;
  /** Miembros del viaje para el selector de pagador y beneficiarios. */
  members: TripMember[];
  /** Gasto existente si se está editando. Null para creación. */
  expense: Expense | null;
  /** Indica si el modal está abierto. */
  isOpen: boolean;
  /** Callback para cambiar el estado de apertura. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal para crear o editar un gasto de viaje.
 *
 * En modo creación, todos los campos están vacíos.
 * En modo edición, los campos se prellenan con los datos existentes.
 */
export function ExpenseModal({
  tripId,
  members,
  expense,
  isOpen,
  onOpenChange,
}: ExpenseModalProps) {
  const t = useTranslations('Trips.expenses');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = expense !== null;

  /** IDs de beneficiarios seleccionados. */
  const [selectedPayeeIds, setSelectedPayeeIds] = useState<Set<string>>(
    () =>
      new Set(
        expense
          ? expense.payees.map((p) => p.id)
          : members.map((m) => m.user.id),
      ),
  );

  /** Alterna la selección de un beneficiario. */
  function togglePayee(userId: string) {
    setSelectedPayeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        if (next.size > 1) next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  /** Envía el formulario de gasto. */
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const payerId = form.get('payerId') as string;
    const quantity = Number(form.get('quantity'));
    const paidAt = form.get('paidAt') as string;

    if (!payerId || !quantity || !paidAt) return;

    startTransition(async () => {
      const body = {
        payerId,
        quantity,
        paidAt: new Date(paidAt).toISOString(),
        payeeIds: Array.from(selectedPayeeIds),
      };

      const result = isEditing
        ? await updateExpense(tripId, expense.id, body)
        : await createExpense(tripId, body);

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  /** Obtiene el nombre visual de un miembro. */
  function memberName(member: TripMember): string {
    const first = member.user.firstName as unknown as string | null;
    const last = member.user.lastName as unknown as string | null;
    return [first, last].filter(Boolean).join(' ') || member.user.email;
  }

  /** Formato de fecha ISO para el input date. */
  function toInputDate(isoDate: string): string {
    return isoDate.split('T')[0];
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
                {isEditing ? t('editExpense') : t('addExpense')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <form
                id="expense-form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                {/* Importe */}
                <TextField
                  name="quantity"
                  isRequired
                  defaultValue={expense ? String(Number(expense.quantity)) : ''}
                >
                  <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                    {t('amount')}
                  </Label>
                  <InputGroup>
                    <InputGroup.Input
                      type="number"
                      min={0.01}
                      step={0.01}
                      placeholder="0.00"
                    />
                  </InputGroup>
                </TextField>

                {/* Fecha de pago */}
                <TextField
                  name="paidAt"
                  isRequired
                  defaultValue={
                    expense
                      ? toInputDate(expense.paidAt)
                      : toInputDate(new Date().toISOString())
                  }
                >
                  <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                    {t('date')}
                  </Label>
                  <InputGroup>
                    <InputGroup.Input type="date" />
                  </InputGroup>
                </TextField>

                {/* Pagador */}
                <div>
                  <label className="text-sm font-semibold text-[var(--text-subtitle)] mb-1 block">
                    {t('payer')}
                  </label>
                  <select
                    name="payerId"
                    required
                    defaultValue={expense?.payer.id ?? ''}
                    className="w-full px-3 py-2 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--rounded-sm)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary-500)] transition-colors"
                  >
                    <option
                      value=""
                      disabled
                    >
                      -
                    </option>
                    {members.map((m) => (
                      <option
                        key={m.user.id}
                        value={m.user.id}
                      >
                        {memberName(m)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Beneficiarios */}
                <div>
                  <label className="text-sm font-semibold text-[var(--text-subtitle)] mb-2 block">
                    {t('payees')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {members.map((m) => {
                      const selected = selectedPayeeIds.has(m.user.id);
                      return (
                        <button
                          key={m.user.id}
                          type="button"
                          onClick={() => togglePayee(m.user.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            selected
                              ? 'bg-[rgba(42,168,148,0.15)] border-[rgba(42,168,148,0.3)] text-[var(--primary-400)]'
                              : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)]'
                          }`}
                        >
                          {memberName(m)}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                form="expense-form"
                variant="primary"
                isDisabled={isPending}
              >
                {isPending
                  ? isEditing
                    ? t('saving')
                    : t('creating')
                  : isEditing
                    ? t('save')
                    : t('addExpense')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
