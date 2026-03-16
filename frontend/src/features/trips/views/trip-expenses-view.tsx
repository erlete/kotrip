'use client';

import { Link, useRouter } from '@/features/i18n';
import type {
  Expense,
  TripDetail,
  TripMember,
} from '@/features/trips/services/trips-api';
import { deleteExpense } from '@/features/trips/services/trips-api';
import {
  computeBalances,
  simplifyDebts,
  type DebtTransaction,
} from '@/features/trips/utils/expense-balance';
import { Button } from '@heroui/react';
import { ArrowLeft, ArrowRight, PlusCircle, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { ExpenseBalanceSummary } from '../components/expense-balance-summary';
import { ExpenseCard } from '../components/expense-card';
import { ExpenseModal } from '../components/expense-modal';

/**
 * Props de la vista de gastos.
 */
interface TripExpensesViewProps {
  /** Detalle del viaje (puede ser null si no se encontró). */
  trip: TripDetail | null;
  /** Lista de gastos del viaje. */
  expenses: Expense[];
  /** Miembros del viaje. */
  members: TripMember[];
  /** ID del usuario actual para resaltar su balance. */
  currentUserId: string | null;
  /** Indica si el usuario puede editar gastos. */
  canEditBudget: boolean;
}

/**
 * Vista de la página de gastos de un viaje.
 *
 * Muestra el balance del usuario actual, la lista simplificada de deudas,
 * los balances individuales de cada miembro y el listado completo de gastos
 * con opciones de creación, edición y eliminación.
 */
export default function TripExpensesView({
  trip,
  expenses,
  members,
  currentUserId,
  canEditBudget,
}: TripExpensesViewProps) {
  const t = useTranslations('Trips.expenses');
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const balanceMap = useMemo(() => computeBalances(expenses), [expenses]);
  const debts = useMemo(() => simplifyDebts(balanceMap), [balanceMap]);
  const balanceList = useMemo(
    () => Array.from(balanceMap.values()),
    [balanceMap],
  );

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.quantity), 0);

  const currentBalance = currentUserId
    ? (balanceMap.get(currentUserId)?.balance ?? 0)
    : 0;
  const roundedBalance = Math.round(currentBalance * 100) / 100;

  /** Abre el modal de creación. */
  function handleAddExpense() {
    setEditingExpense(null);
    setIsModalOpen(true);
  }

  /** Abre el modal de edición. */
  function handleEditExpense(expense: Expense) {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }

  /** Elimina un gasto tras confirmación. */
  function handleDeleteExpense(expenseId: string) {
    if (!confirm(t('confirmDelete'))) return;

    startTransition(async () => {
      const result = await deleteExpense(trip!.id, expenseId);

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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={{ pathname: '/trips/[id]', params: { id: trip.id } }}
            className="flex items-center gap-1.5 text-sm text-[var(--primary-500)] no-underline hover:underline"
          >
            <ArrowLeft size={16} />
            {t('backToTrip')}
          </Link>
        </div>
        {canEditBudget && (
          <Button
            variant="primary"
            size="sm"
            onPress={handleAddExpense}
          >
            <PlusCircle size={15} />
            {t('addExpense')}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Wallet
          size={24}
          className="text-[var(--primary-400)]"
        />
        <h1 className="text-xl font-bold text-[var(--text)] m-0 tracking-tight">
          {t('title')} - {trip.name}
        </h1>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)]">
          <Wallet
            size={32}
            className="text-[var(--text-muted)] mb-3"
          />
          <p className="text-sm text-[var(--text-muted)]">{t('noExpenses')}</p>
          {canEditBudget && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onPress={handleAddExpense}
            >
              <PlusCircle size={15} />
              {t('addExpense')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_320px] gap-6 max-lg:grid-cols-1">
          {/* Columna principal: banner + gastos */}
          <div className="flex flex-col gap-[var(--spacing-md)]">
            {/* Banner de balance del usuario actual */}
            <div
              className={`p-5 rounded-[var(--rounded-lg)] border ${
                roundedBalance > 0.01
                  ? 'bg-[rgba(109,201,109,0.08)] border-[rgba(109,201,109,0.2)]'
                  : roundedBalance < -0.01
                    ? 'bg-[rgba(232,116,116,0.08)] border-[rgba(232,116,116,0.2)]'
                    : 'bg-[var(--bg)] border-[var(--border)]'
              }`}
            >
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
                {roundedBalance > 0.01
                  ? t('youAreOwed')
                  : roundedBalance < -0.01
                    ? t('youOwe')
                    : t('settled')}
              </div>
              <div
                className={`text-2xl font-bold ${
                  roundedBalance > 0.01
                    ? 'text-[#6dc96d]'
                    : roundedBalance < -0.01
                      ? 'text-[#e87474]'
                      : 'text-[var(--text)]'
                }`}
              >
                {Math.abs(roundedBalance).toFixed(2)} €
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-2">
                {t('totalSpent')}: {totalSpent.toFixed(2)} €
              </div>
            </div>

            {/* Deudas simplificadas */}
            {debts.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-[var(--text)] m-0">
                  {t('simplifiedDebts')}
                </h3>
                {debts.map((debt, idx) => (
                  <DebtRow
                    key={idx}
                    debt={debt}
                  />
                ))}
              </div>
            )}

            {/* Lista de gastos */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-[var(--text)] m-0">
                {t('allExpenses')}
              </h3>
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  canEdit={canEditBudget}
                  onEdit={handleEditExpense}
                  onDelete={handleDeleteExpense}
                />
              ))}
            </div>
          </div>

          {/* Columna lateral: balances */}
          <div>
            <ExpenseBalanceSummary
              balances={balanceList}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      )}

      {/* Modal de creación/edición */}
      <ExpenseModal
        tripId={trip.id}
        members={members}
        expense={editingExpense}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}

/**
 * Fila visual de una transacción de deuda simplificada.
 */
function DebtRow({ debt }: { debt: DebtTransaction }) {
  const t = useTranslations('Trips.expenses');
  const fromName = [debt.from.firstName, debt.from.lastName]
    .filter(Boolean)
    .join(' ');
  const toName = [debt.to.firstName, debt.to.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-sm)]">
      <span className="text-sm text-[var(--text)]">{fromName}</span>
      <ArrowRight
        size={14}
        className="text-[var(--primary-400)] shrink-0"
      />
      <span className="text-sm text-[var(--text)]">{toName}</span>
      <span className="text-sm font-semibold text-[var(--primary-500)] ml-auto">
        {debt.amount.toFixed(2)} €
      </span>
    </div>
  );
}
