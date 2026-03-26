'use client';

import { useSession } from '@/features/auth';
import { Link } from '@/features/i18n';
import type { TripListItem } from '@/features/trips/services/trips-api';
import { Button } from '@heroui/react';
import {
  Calendar,
  Compass,
  Headset,
  MapPin,
  Plane,
  PlusCircle,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

/**
 * Props de la vista principal de inicio.
 */
interface HomeViewProps {
  /** Lista de viajes del usuario autenticado. */
  trips: TripListItem[];
  /** Número de invitaciones pendientes de respuesta. */
  pendingInvitationCount: number;
}

/**
 * Vista principal de la página de inicio.
 *
 * Muestra un saludo personalizado, estadísticas resumidas del usuario,
 * una sección de próximos viajes y acciones rápidas.
 */
export function HomeView({ trips, pendingInvitationCount }: HomeViewProps) {
  const { data: session } = useSession();
  const t = useTranslations('Home');

  const displayName =
    [session?.firstName, session?.lastName].filter(Boolean).join(' ') ||
    t('defaultUser');

  const activeTrips = trips.filter(
    (tr) => tr.status === 'ACTIVE' || tr.status === 'PLANNED',
  );
  const upcomingTrips = [...activeTrips]
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-[var(--spacing-lg)] py-10 px-8 w-full mx-auto max-w-[72rem]">
      {/* Banner de bienvenida */}
      <header className="relative flex items-center justify-between gap-[var(--spacing-md)] p-[var(--spacing-xl)] px-10 bg-gradient-to-br from-[var(--primary-800)] via-[var(--primary-700)] to-[var(--primary-600)] rounded-[var(--rounded-xl)] border border-[rgba(42,168,148,0.15)] overflow-hidden">
        <div className="absolute -top-[40%] -right-[10%] w-80 h-80 bg-[radial-gradient(circle,rgba(42,168,148,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-[50%] left-[20%] w-64 h-64 bg-[radial-gradient(circle,rgba(42,168,148,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-[1] flex flex-col gap-[var(--spacing-xs)]">
          <h1 className="text-[1.75rem] font-bold text-white m-0 tracking-tight leading-tight">
            {t('welcomeTitle', { name: displayName })}
          </h1>
          <p className="text-base text-white/75 m-0">{t('welcomeSubtitle')}</p>
        </div>
        <div className="relative z-[1] w-[72px] h-[72px] flex items-center justify-center bg-white/[0.08] rounded-full shrink-0">
          <Compass
            className="text-white/90"
            size={36}
            strokeWidth={1.5}
          />
        </div>
      </header>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2">
        <StatCard
          label={t('stats.activeTrips')}
          value={String(activeTrips.length)}
          icon={Plane}
        />
        <Link href="/globe">
          <StatCard
            label={t('stats.destinationsVisited')}
            value={String(
              trips.filter((tr) => tr.status === 'FINISHED').length,
            )}
            icon={MapPin}
          />
        </Link>
        <Link href="/trips">
          <StatCard
            label={t('stats.totalTrips')}
            value={String(trips.length)}
            icon={Calendar}
          />
        </Link>
        <Link href="/invitations">
          <StatCard
            label={t('stats.pendingInvitations')}
            value={String(pendingInvitationCount)}
            icon={Users}
          />
        </Link>
      </div>

      {/* Próximos viajes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text)] tracking-tight">
            {t('sections.upcomingTrips')}
          </h2>
          <Link href="/trips">
            <Button
              variant="ghost"
              size="sm"
              className="text-[var(--primary-500)]"
            >
              {t('sections.viewAll')}
              {' →'}
            </Button>
          </Link>
        </div>
        {upcomingTrips.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {upcomingTrips.map((trip) => (
              <UpcomingTripCard
                key={trip.id}
                trip={trip}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)]">
            <Plane
              size={32}
              className="text-[var(--text-muted)] mb-3"
            />
            <p className="text-sm text-[var(--text-muted)]">
              {t('sections.noUpcomingTrips')}
            </p>
          </div>
        )}
      </section>

      {/* Acciones rápidas */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text)] tracking-tight mb-4">
          {t('sections.quickActions')}
        </h2>
        <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
          <QuickAction
            icon={PlusCircle}
            title={t('quickActions.newTrip')}
            description={t('quickActions.newTripDesc')}
            href="/trips/create"
            color="teal"
          />
          <QuickAction
            icon={Headset}
            title={t('quickActions.support' as any)}
            description={t('quickActions.supportDesc' as any)}
            href="/support"
            color="amber"
          />
          <QuickAction
            icon={Wallet}
            title={t('quickActions.manageExpenses')}
            description={t('quickActions.manageExpensesDesc')}
            href="/trips"
            color="purple"
          />
        </div>
      </section>
    </div>
  );
}

/* ── Componentes auxiliares internos ── */

const STATUS_STYLES = {
  PLANNED: {
    bg: 'bg-[rgba(42,168,148,0.2)]',
    text: 'text-[var(--primary-300)]',
    border: 'border-[rgba(42,168,148,0.3)]',
  },
  ACTIVE: {
    bg: 'bg-[rgba(168,192,48,0.15)]',
    text: 'text-[#c4d94d]',
    border: 'border-[rgba(168,192,48,0.25)]',
  },
  FINISHED: {
    bg: 'bg-[rgba(255,255,255,0.06)]',
    text: 'text-[var(--text-muted)]',
    border: 'border-[rgba(255,255,255,0.08)]',
  },
  CANCELLED: {
    bg: 'bg-[rgba(232,84,84,0.1)]',
    text: 'text-[#e87474]',
    border: 'border-[rgba(232,84,84,0.2)]',
  },
} as const;

/**
 * Tarjeta de estadística individual para el dashboard.
 */
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] p-5 flex flex-col gap-2.5 transition-colors hover:border-[rgba(42,168,148,0.2)]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-widest">
          {label}
        </span>
        <Icon
          size={16}
          className="text-[var(--primary-400)]"
        />
      </div>
      <span className="text-[1.75rem] font-bold text-[var(--text)] leading-none">
        {value}
      </span>
    </div>
  );
}

/**
 * Tarjeta de viaje próximo con datos reales.
 */
function UpcomingTripCard({ trip }: { trip: TripListItem }) {
  const format = useFormatter();
  const t = useTranslations('Trips');
  const s = STATUS_STYLES[trip.status];
  const localityName = trip.localityName as unknown as string | null;

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="no-underline"
    >
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] overflow-hidden transition-all duration-200 hover:border-[rgba(42,168,148,0.25)] hover:-translate-y-0.5 cursor-pointer">
        {/* Encabezado visual */}
        <div className="h-28 relative bg-gradient-to-br from-[var(--primary-800)] via-[var(--primary-700)] to-[var(--primary-600)]">
          <span
            className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[0.625rem] font-semibold uppercase tracking-wider ${s.bg} ${s.text} border ${s.border}`}
          >
            {t(`status.${trip.status}`)}
          </span>
          <div className="absolute bottom-3 left-5 right-10 h-0.5 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.15)_0px,rgba(255,255,255,0.15)_3px,transparent_3px,transparent_8px)]" />
          <div className="absolute bottom-[0.5rem] right-10 w-2 h-2 rounded-full bg-[var(--primary-400)] shadow-[0_0_6px_rgba(42,168,148,0.5)]" />
        </div>

        {/* Cuerpo */}
        <div className="p-4 px-5">
          <h3 className="text-base font-semibold text-[var(--text)] mb-1">
            {trip.name}
          </h3>
          {localityName && (
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <MapPin size={12} />
              {localityName}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
            <span className="text-[0.6875rem] text-[var(--text-small)]">
              {format.dateTime(new Date(trip.startDate), {
                day: 'numeric',
                month: 'short',
              })}
              {' – '}
              {format.dateTime(new Date(trip.endDate), {
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Users size={12} />
              {trip.memberCount}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

const QUICK_ACTION_COLORS = {
  teal: 'bg-[rgba(42,168,148,0.12)] text-[var(--primary-400)]',
  amber: 'bg-[rgba(200,170,50,0.1)] text-[#d4b84d]',
  purple: 'bg-[rgba(130,100,200,0.1)] text-[#a48de0]',
} as const;

/**
 * Tarjeta de acción rápida para el dashboard.
 */
function QuickAction({
  icon: Icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  href: string;
  color: keyof typeof QUICK_ACTION_COLORS;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3.5 p-4 px-5 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] no-underline transition-all duration-200 hover:border-[rgba(42,168,148,0.2)] hover:bg-[var(--bg-light)]"
    >
      <div
        className={`w-9 h-9 rounded-[var(--rounded-sm)] flex items-center justify-center shrink-0 ${QUICK_ACTION_COLORS[color]}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <div className="text-[0.8125rem] font-semibold text-[var(--text)]">
          {title}
        </div>
        <div className="text-[0.6875rem] text-[var(--text-muted)] mt-0.5">
          {description}
        </div>
      </div>
    </a>
  );
}
