'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { signOut } from '../actions';

/**
 * Formulario de cierre de sesion.
 *
 * Renderiza un boton que, al pulsarse, ejecuta la accion de cierre de sesion
 * eliminando las cookies de autenticacion y redirigiendo al login.
 */
export function LogoutForm() {
  // Los tipos de i18n se regeneran al reiniciar el frontend

  const t = useTranslations('LogoutForm');

  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="primary"
      >
        {t('logoutButton')}
      </Button>
    </form>
  );
}
