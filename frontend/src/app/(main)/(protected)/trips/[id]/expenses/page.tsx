import { getSession } from '@/features/auth/cookies';
import { composePage } from '@/features/routing';
import { fetchExpenses, fetchTrip } from '@/features/trips/services/trips-api';
import TripExpensesView from '@/features/trips/views/trip-expenses-view';
import { Role } from '@kotrip/data';

export default composePage({
  access: { roles: [Role.USER, Role.ADMIN] },
  component: Page,
});

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [tripResult, expensesResult, session] = await Promise.all([
    fetchTrip(id),
    fetchExpenses(id),
    getSession(),
  ]);

  const trip = 'trip' in tripResult ? tripResult.trip : null;
  const expenses = 'expenses' in expensesResult ? expensesResult.expenses : [];

  return (
    <TripExpensesView
      trip={trip}
      expenses={expenses}
      currentUserId={session?.id ?? null}
    />
  );
}
