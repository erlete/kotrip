'use client';

import type { Invitation } from '@/features/trips/services/trips-api';
import { respondInvitation } from '@/features/trips/services/trips-api';
import { Mail } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

/**
 * Colores de avatar para las iniciales de los emisores de invitación.
 */
const AVATAR_COLORS = [
  'bg-[var(--primary-500)]',
  'bg-[#7c6bbf]',
  'bg-[#bf6b8a]',
  'bg-[#6b9fbf]',
  'bg-[var(--primary-700)]',
];

/**
 * Props de la vista de invitaciones.
 */
interface InvitationsViewProps {
  /** Lista de invitaciones pendientes del usuario. */
  invitations: Invitation[];
}

/**
 * Vista de la página de invitaciones pendientes.
 *
 * Muestra todas las invitaciones pendientes del usuario con opciones
 * para aceptar o rechazar cada una de ellas.
 */
export default function InvitationsView({ invitations }: InvitationsViewProps) {
  const t = useTranslations('Trips.invitations');

  const pendingInvitations = invitations.filter((i) => i.status === 'PENDING');

  return (
    <div className="flex flex-col gap-[var(--spacing-lg)] py-10 px-8 w-full mx-auto max-w-[72rem]">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Mail
          size={24}
          className="text-[var(--primary-400)]"
        />
        <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
          {t('title')}
        </h1>
        {pendingInvitations.length > 0 && (
          <span className="bg-[rgba(42,168,148,0.15)] text-[var(--primary-400)] text-xs font-bold px-2 py-0.5 rounded-full">
            {pendingInvitations.length}
          </span>
        )}
      </div>

      {/* Lista de invitaciones */}
      {pendingInvitations.length > 0 ? (
        <div className="flex flex-col gap-2">
          {pendingInvitations.map((inv) => (
            <InvitationCard
              key={inv.id}
              invitation={inv}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)]">
          <Mail
            size={32}
            className="text-[var(--text-muted)] mb-3"
          />
          <p className="text-sm text-[var(--text-muted)]">
            {t('noInvitations')}
          </p>
        </div>
      )}
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

/**
 * Tarjeta de invitación pendiente con acciones de aceptar/rechazar.
 */
function InvitationCard({ invitation }: { invitation: Invitation }) {
  const t = useTranslations('Trips.invitations');
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

  /** Gestiona la respuesta a una invitación (aceptar o rechazar). */
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
          {t('invitedBy', { name: issuerName })} ·{' '}
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
          {t('decline')}
        </button>
        <button
          disabled={isPending}
          onClick={() => handleRespond(true)}
          className="px-3 py-1.5 rounded-[var(--rounded-sm)] text-xs font-semibold bg-[var(--primary-500)] text-white border-none cursor-pointer transition-colors hover:bg-[var(--primary-600)] disabled:opacity-50"
        >
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
