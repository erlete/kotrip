'use client';

import type { Expense } from '@/features/trips/services/trips-api';
import { Calendar, Users, Wallet } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

/**
 * Props del componente de tarjeta de gasto.
 */
interface ExpenseCardProps {
  /** Datos del gasto a mostrar. */
  expense: Expense;
}

/**
 * Tarjeta visual para un gasto individual.
 *
 * Muestra el importe, el pagador, la fecha de pago y el número de beneficiarios.
 */
export function ExpenseCard({ expense }: ExpenseCardProps) {
  const t = useTranslations('Trips.expenses');
  const format = useFormatter();

  const payerName = [expense.payer.firstName, expense.payer.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] p-5 flex items-center gap-4 transition-colors hover:border-[rgba(42,168,148,0.2)]">
      {/* Icono */}
      <div className="w-10 h-10 rounded-[var(--rounded-sm)] bg-[rgba(42,168,148,0.12)] flex items-center justify-center shrink-0">
        <Wallet
          size={20}
          className="text-[var(--primary-400)]"
        />
      </div>

      {/* Datos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold text-[var(--text)]">
            {Number(expense.quantity).toFixed(2)} €
          </span>
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <Calendar size={12} />
            {format.dateTime(new Date(expense.paidAt), {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-xs text-[var(--text-muted)]">
            {t('paidBy')} {payerName}
          </span>
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <Users size={12} />
            {t('sharedBy')} {expense.payees.length}
          </span>
        </div>
      </div>
    </div>
  );
}
