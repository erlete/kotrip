'use client';

import { signOut, useSession } from '@/features/auth';
import {
  Avatar,
  Button,
  Dropdown,
  Label,
  Modal,
  Separator,
  Spinner,
} from '@heroui/react';
import { LogOut, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

/**
 * Paleta de colores para el avatar generativo.
 * Se selecciona un color a partir de un hash del nombre del usuario.
 */
const AVATAR_COLORS = [
  'var(--primary-600)',
  'var(--secondary-600)',
  'var(--error-600)',
  'var(--warning-600)',
  'var(--success-600)',
  'var(--info-600)',
  'var(--purple-600)',
  'var(--primary-800)',
  'var(--secondary-800)',
  'var(--error-800)',
];

/**
 * Genera un color de fondo determinista a partir de un nombre de usuario.
 *
 * @param name - Nombre del usuario.
 * @returns Una propiedad CSS personalizada de la paleta de colores.
 */
function getAvatarColor(name?: string): string {
  if (!name) return AVATAR_COLORS[0];
  const hash = Array.from(name).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/**
 * Obtiene las iniciales de un nombre (primera y última palabra).
 *
 * @param name - Nombre completo del usuario.
 * @returns Las iniciales en mayúscula, o null si no hay nombre.
 */
function getInitials(name?: string): string | null {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last =
    parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase() || null;
}

/**
 * Menú desplegable de cuenta de usuario en la barra superior.
 * Muestra el avatar del usuario y un dropdown con opciones de perfil y cierre de sesión.
 * Utiliza los componentes Dropdown, Modal y Avatar de HeroUI v3.
 */
export function TopbarAccountDropdown() {
  const { data: user } = useSession();
  const router = useRouter();

  const t = useTranslations('LogoutButton');
  const p = useTranslations('Title.Profile');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const displayName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(' ');

  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const avatarBg = useMemo(() => getAvatarColor(displayName), [displayName]);

  /**
   * Ejecuta el cierre de sesión mediante una transición asíncrona.
   */
  const handleConfirmLogout = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  /**
   * Maneja la selección de una opción del menú desplegable.
   * @param key - Identificador de la opción seleccionada.
   */
  const handleAction = (key: React.Key) => {
    if (key === 'profile') {
      router.push('/profile');
    } else if (key === 'logout') {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger
          className="cursor-pointer"
          data-testid="topbar__account-dropdown"
        >
          <div className="flex items-center justify-center">
            <Avatar
              size="sm"
              style={{
                backgroundColor: !user?.avatarURL ? avatarBg : undefined,
              }}
            >
              {user?.avatarURL && (
                <Avatar.Image
                  src={user.avatarURL}
                  alt={displayName}
                />
              )}
              <Avatar.Fallback>
                {initials ? (
                  <span className="font-semibold">{initials}</span>
                ) : (
                  <User className="w-1/2 h-1/2" />
                )}
              </Avatar.Fallback>
            </Avatar>
          </div>
        </Dropdown.Trigger>
        <Dropdown.Popover
          placement="bottom"
          className="min-w-[220px]"
        >
          <Dropdown.Menu onAction={handleAction}>
            <Dropdown.Section>
              <Dropdown.Item
                id="profile-header"
                textValue={displayName}
              >
                <div className="flex flex-col items-start gap-0 py-0.5">
                  <Label className="text-sm font-semibold">{displayName}</Label>
                  <span className="text-[var(--text-muted)] text-xs">
                    {user?.email}
                  </span>
                </div>
              </Dropdown.Item>
            </Dropdown.Section>
            <Separator />
            <Dropdown.Section>
              <Dropdown.Item
                id="profile"
                textValue={p('title')}
              >
                <div className="flex flex-row items-center gap-2">
                  <User
                    size={15}
                    className="flex-shrink-0 opacity-70"
                  />
                  <Label>{p('title')}</Label>
                </div>
              </Dropdown.Item>
            </Dropdown.Section>
            <Separator />
            <Dropdown.Section>
              <Dropdown.Item
                id="logout"
                textValue={t('logoutLink')}
                variant="danger"
              >
                <div className="flex flex-row items-center gap-2">
                  <LogOut
                    size={15}
                    className="flex-shrink-0"
                  />
                  <Label>{t('logoutLink')}</Label>
                </div>
              </Dropdown.Item>
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      {/* Modal de confirmación de cierre de sesión (HeroUI v3) */}
      <Modal>
        <Modal.Backdrop
          isOpen={isModalOpen}
          onOpenChange={(open) => {
            if (!isPending) setIsModalOpen(open);
          }}
        >
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>{t('modalTitle')}</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>{t('modalDescription')}</p>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  slot="close"
                  variant="ghost"
                >
                  {t('cancelButton')}
                </Button>
                <Button
                  variant="danger"
                  onPress={handleConfirmLogout}
                  isDisabled={isPending}
                  data-testid="logout-confirm-button"
                >
                  {isPending && (
                    <Spinner
                      color="current"
                      size="sm"
                    />
                  )}
                  {t('confirmButton')}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
