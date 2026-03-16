'use client';

import { Link, useRouter } from '@/features/i18n';
import { MemberPermissions } from '@/features/trips/components/member-permissions';
import { TripEditModal } from '@/features/trips/components/trip-edit-modal';
import type {
  TripDetail,
  TripMember,
} from '@/features/trips/services/trips-api';
import {
  removeTripMember,
  updateTripMember,
} from '@/features/trips/services/trips-api';
import { useFormatLongDate } from '@/hooks/use-format-date';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Map,
  MapPin,
  Pencil,
  Users,
  Wallet,
} from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

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
 * Vista de detalle de un viaje.
 *
 * Muestra la información completa del viaje, incluyendo estado,
 * fechas, presupuesto, localidad, descripción y lista de miembros
 * con sus permisos configurables.
 */
export default function TripDetailView({
  trip,
  members,
  currentMember,
}: {
  trip: TripDetail | null;
  members: TripMember[];
  currentMember: TripMember | null;
}) {
  const t = useTranslations('Trips');
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <h1 className="text-xl font-bold text-[var(--text)] mb-2">
          {t('detailView.notFound')}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          {t('detailView.notFoundDescription')}
        </p>
        <Link
          href="/trips"
          className="text-sm text-[var(--primary-400)] hover:underline"
        >
          {t('backToTrips')}
        </Link>
      </div>
    );
  }

  const s = STATUS_STYLES[trip.status];
  const description = trip.description as unknown as string | null;
  const budget = trip.budget as unknown as number | null;
  const localityFull = trip.locality
    ? `${trip.locality.name}, ${trip.locality.province}`
    : null;

  const formatLongDate = useFormatLongDate();
  const format = useFormatter();

  /** Calcula la duración en días entre dos fechas ISO. */
  const durationDays = Math.max(
    1,
    Math.ceil(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  /** Actualiza un permiso de un miembro. */
  function handleTogglePermission(
    memberId: string,
    permissionKey: string,
    newValue: boolean,
  ) {
    startTransition(async () => {
      const result = await updateTripMember(trip!.id, memberId, {
        [permissionKey]: newValue,
      });

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      router.refresh();
    });
  }

  /** Elimina un miembro del viaje. */
  function handleRemoveMember(memberId: string) {
    startTransition(async () => {
      const result = await removeTripMember(trip!.id, memberId);

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-lg)] py-10 px-8 w-full mx-auto max-w-[64rem]">
      {/* Enlace de retorno */}
      <Link
        href="/trips"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors w-fit no-underline"
      >
        <ArrowLeft size={14} />
        {t('backToTrips')}
      </Link>

      {/* Encabezado */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
                {trip.name}
              </h1>
              {currentMember?.canEditTrip && (
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="p-1.5 rounded-[var(--rounded-sm)] text-[var(--text-muted)] hover:text-[var(--primary-400)] hover:bg-[rgba(42,168,148,0.1)] transition-colors"
                  title={t('editForm.title')}
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
            {localityFull && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-[var(--text-muted)]">
                <MapPin size={14} />
                {localityFull}
              </div>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${s.bg} ${s.text} border ${s.border}`}
          >
            {t(`status.${trip.status}`)}
          </span>
        </div>
      </div>

      {/* Tarjetas de información (2x2) */}
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        {/* Fechas */}
        <InfoCard
          icon={Calendar}
          label={t('detailView.dates')}
        >
          <span className="text-sm text-[var(--text)]">
            {formatLongDate(trip.startDate)} – {formatLongDate(trip.endDate)}
          </span>
        </InfoCard>

        {/* Duración */}
        <InfoCard
          icon={Clock}
          label={t('detailView.duration')}
        >
          <span className="text-sm text-[var(--text)] font-medium">
            {format.number(durationDays, { style: 'unit', unit: 'day' })}
          </span>
        </InfoCard>

        {/* Presupuesto */}
        <InfoCard
          icon={Wallet}
          label={t('detailView.budget')}
        >
          <span className="text-sm text-[var(--text)] font-medium">
            {budget != null ? `${budget.toLocaleString()} €` : '—'}
          </span>
        </InfoCard>

        {/* Localidad */}
        <InfoCard
          icon={MapPin}
          label={t('detailView.locality')}
        >
          <span className="text-sm text-[var(--text)]">
            {localityFull ?? '—'}
          </span>
        </InfoCard>
      </div>

      {/* Descripción */}
      <section className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-2">
          {t('detailView.description')}
        </h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
          {description || t('detailView.noDescription')}
        </p>
      </section>

      {/* Acciones del viaje */}
      <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        <Link
          href={{ pathname: '/trips/[id]/itinerary', params: { id: trip.id } }}
          className="flex items-center gap-3 p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] no-underline transition-all hover:border-[rgba(42,168,148,0.2)]"
        >
          <div className="w-9 h-9 rounded-[var(--rounded-sm)] bg-[rgba(42,168,148,0.12)] flex items-center justify-center shrink-0">
            <Map
              size={18}
              className="text-[var(--primary-400)]"
            />
          </div>
          <span className="text-sm font-semibold text-[var(--text)]">
            {t('detailView.viewItinerary')}
          </span>
        </Link>
        <Link
          href={{ pathname: '/trips/[id]/expenses', params: { id: trip.id } }}
          className="flex items-center gap-3 p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] no-underline transition-all hover:border-[rgba(42,168,148,0.2)]"
        >
          <div className="w-9 h-9 rounded-[var(--rounded-sm)] bg-[rgba(42,168,148,0.12)] flex items-center justify-center shrink-0">
            <Wallet
              size={18}
              className="text-[var(--primary-400)]"
            />
          </div>
          <span className="text-sm font-semibold text-[var(--text)]">
            {t('detailView.viewExpenses')}
          </span>
        </Link>
        <Link
          href={{ pathname: '/trips/[id]/tickets', params: { id: trip.id } }}
          className="flex items-center gap-3 p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] no-underline transition-all hover:border-[rgba(42,168,148,0.2)]"
        >
          <div className="w-9 h-9 rounded-[var(--rounded-sm)] bg-[rgba(42,168,148,0.12)] flex items-center justify-center shrink-0">
            <FileText
              size={18}
              className="text-[var(--primary-400)]"
            />
          </div>
          <span className="text-sm font-semibold text-[var(--text)]">
            {t('detailView.viewTickets')}
          </span>
        </Link>
      </div>

      {/* Miembros */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Users
            size={16}
            className="text-[var(--text-muted)]"
          />
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('detailView.members')}
          </h2>
          <span className="bg-[rgba(42,168,148,0.15)] text-[var(--primary-400)] text-[0.625rem] font-bold px-[0.4375rem] py-0.5 rounded-full">
            {members.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
          {members.map((member, index) => (
            <MemberPermissions
              key={member.id}
              member={member}
              colorIndex={index}
              canModifyMembers={currentMember?.canModifyMembers ?? false}
              onToggle={(key, value) =>
                handleTogglePermission(member.id, key, value)
              }
              onRemove={handleRemoveMember}
            />
          ))}
        </div>
      </section>

      {/* Modal de edición */}
      {currentMember?.canEditTrip && (
        <TripEditModal
          trip={trip}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </div>
  );
}

/* -- Componentes auxiliares -- */

/**
 * Tarjeta de información genérica con icono y etiqueta.
 */
function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] p-4">
      <div className="w-8 h-8 rounded-[var(--rounded-sm)] bg-[rgba(42,168,148,0.1)] flex items-center justify-center shrink-0">
        <Icon
          size={16}
          className="text-[var(--primary-400)]"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
        {children}
      </div>
    </div>
  );
}
