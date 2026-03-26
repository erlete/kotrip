'use client';

import { Link } from '@/features/i18n';
import type {
  Invitation,
  TripListItem,
} from '@/features/trips/services/trips-api';
import { respondInvitation } from '@/features/trips/services/trips-api';
import { Button } from '@heroui/react';
import { LayoutGrid, List, MapPin, PlusCircle, Users } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

/** Claves de filtro válidas. */
type TripStatus = TripListItem['status'];
type FilterKey = 'all' | Lowercase<TripStatus>;

/**
 * Vista de lista de viajes.
 *
 * Muestra los viajes del usuario en un grid de tarjetas con filtros por estado,
 * toggle de vista (grid/lista) y sección de invitaciones pendientes.
 */
export default function TripsListView({ trips }: { trips: TripListItem[] }) {
  const t = useTranslations('Trips');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const statusCounts = trips.reduce<Record<string, number>>((acc, trip) => {
    const key = trip.status.toLowerCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: t('filters.all'), count: trips.length },
    {
      key: 'active',
      label: t('filters.active'),
      count: statusCounts['active'] ?? 0,
    },
    {
      key: 'planned',
      label: t('filters.planned'),
      count: statusCounts['planned'] ?? 0,
    },
    {
      key: 'finished',
      label: t('filters.finished'),
      count: statusCounts['finished'] ?? 0,
    },
    {
      key: 'cancelled',
      label: t('filters.cancelled'),
      count: statusCounts['cancelled'] ?? 0,
    },
  ];

  const filteredTrips =
    activeFilter === 'all'
      ? trips
      : trips.filter((trip) => trip.status.toLowerCase() === activeFilter);

  return (
    <div className="flex flex-col gap-[var(--spacing-lg)] py-10 px-8 w-full mx-auto max-w-[72rem]">
      {/* Encabezado de página */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/trips/create">
          <Button
            variant="primary"
            size="sm"
          >
            <PlusCircle size={15} />
            {t('newTrip')}
          </Button>
        </Link>
      </div>

      {/* Barra de filtros */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeFilter === f.key
                  ? 'bg-[rgba(42,168,148,0.12)] border-[rgba(42,168,148,0.3)] text-[var(--primary-300)]'
                  : 'bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[rgba(42,168,148,0.3)] hover:text-[var(--text)]'
              }`}
            >
              {f.label}
              <span
                className={`px-1.5 py-px rounded-full text-[0.625rem] font-semibold ${
                  activeFilter === f.key
                    ? 'bg-[rgba(42,168,148,0.2)]'
                    : 'bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <ViewToggleBtn
            icon={LayoutGrid}
            active
          />
          <ViewToggleBtn icon={List} />
        </div>
      </div>

      {/* Grid de viajes */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {filteredTrips.map((trip, index) => (
            <TripCard
              key={trip.id}
              trip={trip}
              gradientIndex={index}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-[var(--text-muted)]">{t('noTrips')}</p>
          {trips.length === 0 && (
            <Link
              href="/trips/create"
              className="mt-3"
            >
              <Button
                variant="primary"
                size="sm"
              >
                <PlusCircle size={15} />
                {t('createFirst')}
              </Button>
            </Link>
          )}
        </div>
      )}
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

const GRADIENTS = [
  'from-[#1a6c5f] via-[#0a302a] to-[#124e44]',
  'from-[#124e44] via-[#1a6c5f] to-[#228a79]',
  'from-[#0a302a] via-[#1a6c5f] to-[#33bfa8]',
  'from-[#228a79] via-[#124e44] to-[#0a302a]',
  'from-[#1a6c5f] via-[#228a79] to-[#124e44]',
];

const AVATAR_COLORS = [
  'bg-[var(--primary-500)]',
  'bg-[#7c6bbf]',
  'bg-[#bf6b8a]',
  'bg-[#6b9fbf]',
  'bg-[var(--primary-700)]',
];

/**
 * Tarjeta de viaje conectada a datos reales del backend.
 */
function TripCard({
  trip,
  gradientIndex,
}: {
  trip: TripListItem;
  gradientIndex: number;
}) {
  const t = useTranslations('Trips');
  const format = useFormatter();
  const s = STATUS_STYLES[trip.status];
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];
  const localityName = trip.localityName as unknown as string | null;

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="no-underline"
    >
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] overflow-hidden transition-all duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[rgba(42,168,148,0.25)] hover:-translate-y-[3px] cursor-pointer h-full">
        {/* Encabezado visual */}
        <div
          className={`h-[8.5rem] relative overflow-hidden bg-gradient-to-br ${gradient}`}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_30%_40%,rgba(255,255,255,0.04)_0%,transparent_50%)] pointer-events-none" />
          <span
            className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[0.625rem] font-semibold uppercase tracking-wider ${s.bg} ${s.text} border ${s.border}`}
          >
            {t(`status.${trip.status}`)}
          </span>
          <div className="absolute bottom-4 left-5 right-10 h-0.5 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0px,rgba(255,255,255,0.12)_4px,transparent_4px,transparent_10px)]" />
          <div className="absolute bottom-[0.75rem] left-5 w-2 h-2 rounded-full bg-[var(--primary-300)]" />
          <div className="absolute bottom-[0.75rem] right-10 w-2 h-2 rounded-full bg-[var(--primary-400)] shadow-[0_0_8px_rgba(42,168,148,0.5)]" />
        </div>

        {/* Cuerpo */}
        <div className="p-4 px-5 pb-5">
          <h3 className="text-base font-semibold text-[var(--text)] mb-1 leading-snug">
            {trip.name}
          </h3>
          {localityName && (
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <MapPin
                size={12}
                className="shrink-0"
              />
              {localityName}
            </div>
          )}

          {/* Meta: fechas + miembros */}
          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-[var(--border)]">
            <span className="text-[0.6875rem] text-[var(--text-small)]">
              {format.dateTime(new Date(trip.startDate), {
                day: 'numeric',
                month: 'short',
              })}
              {' – '}
              {format.dateTime(new Date(trip.endDate), {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Users size={12} />
              <span>{trip.memberCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Botón de toggle para cambiar entre vista de grid y lista.
 */
function ViewToggleBtn({
  icon: Icon,
  active,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  active?: boolean;
}) {
  return (
    <button
      className={`flex items-center justify-center w-8 h-8 border rounded-[var(--rounded-sm)] cursor-pointer transition-all ${
        active
          ? 'bg-[var(--overlay)] text-[var(--text)] border-[rgba(255,255,255,0.1)]'
          : 'bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[rgba(255,255,255,0.12)]'
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

/**
 * Tarjeta de invitación pendiente con acciones de aceptar/rechazar.
 */
function InvitationCard({ invitation }: { invitation: Invitation }) {
  const t = useTranslations('Trips');
  const format = useFormatter();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const issuerName =
    [
      invitation.issuer.firstName as unknown as string | null,
      invitation.issuer.lastName as unknown as string | null,
    ]
      .filter(Boolean)
      .join(' ') || invitation.issuer.email;

  const initials = getInitials(issuerName);
  const colorIndex = invitation.id.charCodeAt(0) % AVATAR_COLORS.length;

  function handleRespond(accept: boolean) {
    startTransition(async () => {
      await respondInvitation(invitation.id, accept);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4 py-3.5 px-5 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] transition-colors hover:border-[rgba(42,168,148,0.15)]">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-[0.6875rem] font-semibold text-white shrink-0 ${AVATAR_COLORS[colorIndex]}`}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[0.8125rem] font-semibold text-[var(--text)]">
          {invitation.trip.name}
        </div>
        <div className="text-[0.6875rem] text-[var(--text-muted)] mt-px">
          {t('invitations.invitedBy', { name: issuerName })} ·{' '}
          {format.dateTime(new Date(invitation.createdAt), {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          disabled={isPending}
          onClick={() => handleRespond(false)}
          className="px-3 py-1.5 rounded-[var(--rounded-sm)] text-xs font-semibold bg-transparent border border-[var(--border)] text-[var(--text-muted)] cursor-pointer transition-all hover:border-[rgba(232,84,84,0.3)] hover:text-[#e85454] disabled:opacity-50"
        >
          {t('invitations.decline')}
        </button>
        <button
          disabled={isPending}
          onClick={() => handleRespond(true)}
          className="px-3 py-1.5 rounded-[var(--rounded-sm)] text-xs font-semibold bg-[var(--primary-500)] text-white border-none cursor-pointer transition-colors hover:bg-[var(--primary-600)] disabled:opacity-50"
        >
          {t('invitations.accept')}
        </button>
      </div>
    </div>
  );
}

/**
 * Extrae las iniciales de un nombre completo.
 *
 * @param name Nombre completo.
 * @returns Hasta 2 caracteres de iniciales en mayúsculas.
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
