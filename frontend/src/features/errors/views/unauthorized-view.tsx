'use client';

import PublicBaseLayout from '@/components/layout/public-base-layout';
import { signOutNoRedirect } from '@/features/auth';
import { ErrorView } from '@/features/errors/components/error-view';
import { useTranslations } from 'next-intl';

/** Ruta de redirección para errores de autenticación. */
const REDIRECT_PATH = '/login';

/** Tiempo de espera en segundos antes de la redirección automática. */
const REDIRECT_DELAY = 20;

/**
 * Vista de error de no autorizado (401).
 *
 * @remarks
 * Se muestra cuando el usuario no está autenticado o su sesión ha expirado.
 * Al montar, limpia las cookies de autenticación para evitar bucles infinitos
 * entre unauthorized y login cuando la sesión ha expirado pero las cookies aún existen.
 * Traduce todo el contenido internamente usando `useTranslations` con
 * namespace fijo para garantizar tipado seguro.
 *
 * @returns Elemento JSX de la vista de error de no autorizado.
 */
export default function UnauthorizedView() {
  const t = useTranslations('Errors.unauthorized');
  const r = useTranslations('Routes');

  /**
   * Limpia las cookies de autenticación al mostrar esta vista.
   * Ignora errores ya que solo intentamos limpiar el estado de sesión.
   */
  const handleMount = async () => {
    await signOutNoRedirect().catch(() => {
      // Ignorar errores - solo intentamos limpiar
    });
  };

  return (
    <PublicBaseLayout className="flex flex-col items-center justify-center gap-6 [&_h1]:text-[var(--primary-500)] [&_p]:text-[var(--text)] [&_p]:text-xl [&_p]:max-w-[40ch]">
      <ErrorView
        icon="lockKeyhole"
        iconVariant="unauthorized"
        title={t('title')}
        description={t('description')}
        suggestionsTitle={t('suggestionsTitle')}
        suggestions={[
          t('suggestions.signIn'),
          t('suggestions.createAccount'),
          t('suggestions.goBack'),
        ]}
        redirect={{
          path: REDIRECT_PATH,
          delay: REDIRECT_DELAY,
          destination: r('/login'),
        }}
        action={{
          label: t('actions.signIn'),
          href: REDIRECT_PATH,
        }}
        onMount={handleMount}
      />
    </PublicBaseLayout>
  );
}
