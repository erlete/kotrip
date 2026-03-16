'use client';

import type { TripMember } from '@/features/trips/services/trips-api';
import { Switch } from '@heroui/react';
import { Crown, Trash2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

/** Claves de permisos configurables de un miembro del viaje. */
const PERMISSION_KEYS = [
  'canEditTrip',
  'canEditBudget',
  'canEditDetails',
  'canModifyMembers',
  'canInviteMembers',
  'canManageTickets',
] as const;

/** Clave de permiso de un miembro del viaje. */
type PermissionKey = (typeof PERMISSION_KEYS)[number];

const AVATAR_COLORS = [
  'bg-[var(--primary-500)]',
  'bg-[#7c6bbf]',
  'bg-[#bf6b8a]',
  'bg-[#6b9fbf]',
  'bg-[var(--primary-700)]',
];

/**
 * Props del componente de permisos de un miembro del viaje.
 */
interface MemberPermissionsProps {
  /** Datos del miembro. */
  member: TripMember;
  /** Índice de color para el avatar. */
  colorIndex: number;
  /** Indica si el usuario actual puede modificar miembros. */
  canModifyMembers: boolean;
  /** Indica si este miembro es el usuario actual. */
  isCurrentUser: boolean;
  /** Callback al alternar un permiso. */
  onToggle: (permissionKey: PermissionKey, newValue: boolean) => void;
  /** Callback al eliminar el miembro. */
  onRemove: (memberId: string) => void;
}

/**
 * Componente de permisos de un miembro del viaje.
 *
 * Muestra la información del miembro junto con sus permisos
 * configurables mediante interruptores. Los creadores del viaje
 * tienen todos los permisos activados y no editables.
 */
export function MemberPermissions({
  member,
  colorIndex,
  canModifyMembers,
  isCurrentUser,
  onToggle,
  onRemove,
}: MemberPermissionsProps) {
  const t = useTranslations('Trips');
  const format = useFormatter();

  const firstName = member.user.firstName as unknown as string | null;
  const lastName = member.user.lastName as unknown as string | null;
  const name =
    [firstName, lastName].filter(Boolean).join(' ') || member.user.email;
  const initials = getInitials(name);
  const decorativeRole = member.decorativeRole as unknown as string | null;

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] p-4 transition-colors hover:border-[rgba(42,168,148,0.15)]">
      {/* Información del miembro */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-[0.6875rem] font-semibold text-white shrink-0 ${AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]}`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[0.8125rem] font-semibold text-[var(--text)] truncate">
              {name}
            </span>
            {member.isCreator && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[0.625rem] font-bold bg-[rgba(212,184,77,0.15)] text-[var(--secondary-400)] border border-[rgba(212,184,77,0.25)]">
                <Crown size={10} />
                {t('permissions.creator')}
              </span>
            )}
          </div>
          <div className="text-[0.6875rem] text-[var(--text-muted)] mt-px">
            {decorativeRole ??
              t('detailView.memberSince', {
                date: format.dateTime(new Date(member.createdAt), {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }),
              })}
          </div>
        </div>

        {/* Botón de eliminar */}
        {canModifyMembers && !member.isCreator && (
          <button
            type="button"
            onClick={() => onRemove(member.id)}
            className="p-1.5 rounded-[var(--rounded-sm)] text-[var(--text-muted)] hover:text-[var(--error-400)] hover:bg-[rgba(232,84,84,0.1)] transition-colors"
            title={t('permissions.removeMember')}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Permisos (siempre visibles para todos los miembros) */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
        {PERMISSION_KEYS.map((key) => (
          <div
            key={key}
            className="flex items-center justify-between gap-2 px-2 py-1"
          >
            <span className="text-[0.6875rem] text-[var(--text-muted)]">
              {t(`permissions.${key}`)}
            </span>
            <Switch
              size="sm"
              isSelected={member.isCreator ? true : member[key]}
              isDisabled={
                member.isCreator || !canModifyMembers || isCurrentUser
              }
              onChange={() => onToggle(key, !member[key])}
            >
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Extrae las iniciales de un nombre completo.
 *
 * @param name Nombre completo del usuario.
 * @returns Iniciales (máximo 2 caracteres).
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
