import { getSession } from '@/features/auth/cookies';
import { composePage } from '@/features/routing';
import {
  fetchExpenses,
  fetchTrip,
  fetchTripMembers,
} from '@/features/trips/services/trips-api';
import TripExpensesView from '@/features/trips/views/trip-expenses-view';
import { Role } from '@kotrip/data';

export default composePage({
  access: { roles: [Role.USER, Role.ADMIN] },
  component: Page,
});

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [tripResult, expensesResult, membersResult, session] =
    await Promise.all([
      fetchTrip(id),
      fetchExpenses(id),
      fetchTripMembers(id),
      getSession(),
    ]);

  const trip = 'trip' in tripResult ? tripResult.trip : null;
  const expenses = 'expenses' in expensesResult ? expensesResult.expenses : [];
  const members = 'members' in membersResult ? membersResult.members : [];

  const currentMember = members.find((m) => m.user.id === session?.id) ?? null;

  return (
    <TripExpensesView
      trip={trip}
      expenses={expenses}
      members={members}
      currentUserId={session?.id ?? null}
      canEditBudget={currentMember?.canEditBudget ?? false}
    />
  );
}
