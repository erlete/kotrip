/**
 * Utilidades para el cálculo de balances y simplificación de deudas.
 *
 * Implementa la lógica de reparto equitativo de gastos entre miembros
 * de un viaje, similar al modelo de Tricount/Splitwise.
 */

import type { Expense, ExpenseUser } from '@/features/trips/services/trips-api';

/**
 * Entrada de balance individual de un usuario.
 */
export interface UserBalance {
  /** Datos del usuario. */
  user: ExpenseUser;
  /** Balance neto en EUR (positivo = le deben, negativo = debe). */
  balance: number;
}

/**
 * Transacción simplificada de deuda entre dos usuarios.
 */
export interface DebtTransaction {
  /** Usuario que debe pagar. */
  from: ExpenseUser;
  /** Usuario que recibe el pago. */
  to: ExpenseUser;
  /** Importe de la transacción en EUR. */
  amount: number;
}

/**
 * Calcula el balance neto de cada usuario a partir de una lista de gastos.
 *
 * Para cada gasto:
 * - El pagador se acredita el importe total.
 * - Cada beneficiario (payee) se debita su parte proporcional (reparto equitativo).
 * - Si el pagador también es beneficiario, se le debita su parte.
 *
 * @param expenses Lista de gastos con pagador y beneficiarios.
 * @returns Mapa de ID de usuario a su balance neto y datos.
 */
export function computeBalances(expenses: Expense[]): Map<string, UserBalance> {
  const balances = new Map<string, UserBalance>();

  const ensureUser = (user: ExpenseUser) => {
    if (!balances.has(user.id)) {
      balances.set(user.id, { user, balance: 0 });
    }
  };

  for (const expense of expenses) {
    const quantity = Number(expense.quantity);
    const payeeCount = expense.payees.length;
    if (payeeCount === 0) continue;

    const perPerson = quantity / payeeCount;

    // Acreditar al pagador
    ensureUser(expense.payer);
    const payerEntry = balances.get(expense.payer.id)!;
    payerEntry.balance += quantity;

    // Debitar a cada beneficiario
    for (const payee of expense.payees) {
      ensureUser(payee);
      const payeeEntry = balances.get(payee.id)!;
      payeeEntry.balance -= perPerson;
    }
  }

  return balances;
}

/**
 * Simplifica las deudas entre usuarios minimizando el número de transacciones.
 *
 * Utiliza un algoritmo greedy que empareja iterativamente al mayor deudor
 * con el mayor acreedor hasta resolver todos los balances.
 *
 * @param balances Mapa de balances calculado por {@link computeBalances}.
 * @returns Lista de transacciones simplificadas.
 */
export function simplifyDebts(
  balances: Map<string, UserBalance>,
): DebtTransaction[] {
  const transactions: DebtTransaction[] = [];

  // Separar en acreedores (balance positivo) y deudores (balance negativo)
  const creditors: { user: ExpenseUser; amount: number }[] = [];
  const debtors: { user: ExpenseUser; amount: number }[] = [];

  for (const entry of balances.values()) {
    const rounded = Math.round(entry.balance * 100) / 100;
    if (rounded > 0.01) {
      creditors.push({ user: entry.user, amount: rounded });
    } else if (rounded < -0.01) {
      debtors.push({ user: entry.user, amount: Math.abs(rounded) });
    }
  }

  // Ordenar descendente por importe
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debt = debtors[di];
    const amount = Math.min(credit.amount, debt.amount);

    if (amount > 0.01) {
      transactions.push({
        from: debt.user,
        to: credit.user,
        amount: Math.round(amount * 100) / 100,
      });
    }

    credit.amount -= amount;
    debt.amount -= amount;

    if (credit.amount < 0.01) ci++;
    if (debt.amount < 0.01) di++;
  }

  return transactions;
}
