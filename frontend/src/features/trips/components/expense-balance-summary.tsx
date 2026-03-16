'use client';

import type { UserBalance } from '@/features/trips/utils/expense-balance';
import { useTranslations } from 'next-intl';

/**
 * Props del componente de resumen de balances.
 */
interface BalanceSummaryProps {
  /** Lista de balances de cada usuario. */
  balances: UserBalance[];
  /** ID del usuario actual para resaltar su balance. */
  currentUserId: string | null;
}

/**
 * Resumen visual de balances por miembro del viaje.
 *
 * Muestra una barra horizontal coloreada por usuario indicando
 * si le deben dinero (verde), debe dinero (rojo) o está saldado (gris).
 */
export function ExpenseBalanceSummary({
  balances,
  currentUserId,
}: BalanceSummaryProps) {
  const t = useTranslations('Trips.expenses');

  const sorted = [...balances].sort((a, b) => b.balance - a.balance);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-[var(--text)] m-0">
        {t('balance')}
      </h3>
      {sorted.map((entry) => {
        const name = [entry.user.firstName, entry.user.lastName]
          .filter(Boolean)
          .join(' ');
        const rounded = Math.round(entry.balance * 100) / 100;
        const isCurrentUser = entry.user.id === currentUserId;

        let colorClass: string;
        let label: string;
        if (rounded > 0.01) {
          colorClass = 'text-[#6dc96d]';
          label = `+${rounded.toFixed(2)} €`;
        } else if (rounded < -0.01) {
          colorClass = 'text-[#e87474]';
          label = `${rounded.toFixed(2)} €`;
        } else {
          colorClass = 'text-[var(--text-muted)]';
          label = t('settled');
        }

        return (
          <div
            key={entry.user.id}
            className={`flex items-center justify-between p-3 rounded-[var(--rounded-sm)] border ${
              isCurrentUser
                ? 'border-[rgba(42,168,148,0.3)] bg-[rgba(42,168,148,0.05)]'
                : 'border-[var(--border)] bg-[var(--bg)]'
            }`}
          >
            <span className="text-sm text-[var(--text)]">
              {name}
              {isCurrentUser && (
                <span className="text-xs text-[var(--primary-400)] ml-1.5">
                  ({t('you')})
                </span>
              )}
            </span>
            <span className={`text-sm font-semibold ${colorClass}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
