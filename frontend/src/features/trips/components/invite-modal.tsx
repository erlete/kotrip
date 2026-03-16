'use client';

import { useRouter } from '@/features/i18n';
import type { UserInfo } from '@/features/trips/services/trips-api';
import {
  inviteTripMember,
  searchUsers,
} from '@/features/trips/services/trips-api';
import { Button, Modal } from '@heroui/react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

/**
 * Props del modal de invitación de miembros.
 */
interface InviteModalProps {
  /** ID del viaje al que invitar. */
  tripId: string;
  /** IDs de usuarios que ya son miembros (para excluirlos de los resultados). */
  existingMemberUserIds: Set<string>;
  /** Indica si el modal está abierto. */
  isOpen: boolean;
  /** Callback para cambiar el estado de apertura. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal para invitar usuarios a un viaje.
 *
 * Permite buscar usuarios por nombre o email y enviar una invitación
 * al usuario seleccionado.
 */
export function InviteModal({
  tripId,
  existingMemberUserIds,
  isOpen,
  onOpenChange,
}: InviteModalProps) {
  const t = useTranslations('Trips.invitations');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Búsqueda debounced de usuarios. */
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const result = await searchUsers(query);
      if ('users' in result) {
        setResults(
          result.users.filter((u) => !existingMemberUserIds.has(u.id)),
        );
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, existingMemberUserIds]);

  /** Envía la invitación al usuario seleccionado. */
  function handleInvite() {
    if (!selectedUser) return;

    startTransition(async () => {
      const result = await inviteTripMember(tripId, {
        receiverId: selectedUser.id,
      });

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      setSelectedUser(null);
      setQuery('');
      setResults([]);
      onOpenChange(false);
      router.refresh();
    });
  }

  /** Nombre visual de un usuario. */
  function userName(user: UserInfo): string {
    const first = user.firstName as unknown as string | null;
    const last = user.lastName as unknown as string | null;
    return [first, last].filter(Boolean).join(' ') || user.email;
  }

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!isPending) onOpenChange(open);
        }}
      >
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{t('inviteTitle')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-3">
                {/* Barra de búsqueda */}
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedUser(null);
                    }}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-9 pr-3 py-2 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--rounded-sm)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary-500)] transition-colors"
                  />
                </div>

                {/* Resultados */}
                {results.length > 0 && !selectedUser && (
                  <ul className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-sm)] max-h-48 overflow-y-auto">
                    {results.map((user) => (
                      <li key={user.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setQuery(userName(user));
                            setResults([]);
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[rgba(42,168,148,0.1)] transition-colors flex flex-col"
                        >
                          <span className="font-medium">{userName(user)}</span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {user.email}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {query.length >= 2 && results.length === 0 && !selectedUser && (
                  <p className="text-sm text-[var(--text-muted)] text-center py-2">
                    {t('noResults')}
                  </p>
                )}

                {/* Usuario seleccionado */}
                {selectedUser && (
                  <div className="flex items-center gap-3 p-3 bg-[rgba(42,168,148,0.08)] border border-[rgba(42,168,148,0.2)] rounded-[var(--rounded-sm)]">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--text)]">
                        {userName(selectedUser)}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {selectedUser.email}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                slot="close"
                variant="ghost"
                isDisabled={isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                isDisabled={!selectedUser || isPending}
                onPress={handleInvite}
              >
                {isPending ? t('sending') : t('send')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
