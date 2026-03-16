import { ProtectedLayout } from '@/components/layout/protected-layout';
import { ErrorView } from '@/features/errors/components/error-view';
import { getTranslations } from 'next-intl/server';

/** Ruta de redirección para errores de acceso prohibido. */
const REDIRECT_PATH = '/home';

/** Tiempo de espera en segundos antes de la redirección automática. */
const REDIRECT_DELAY = 20;

/**
 * Vista de error de acceso prohibido (403).
 *
 * @remarks
 * Se muestra cuando el usuario está autenticado pero no tiene permisos
 * suficientes para acceder a un recurso específico. Proporciona sugerencias
 * para resolver la situación y redirige automáticamente al inicio.
 * Traduce todo el contenido internamente usando `getTranslations` con
 * namespace fijo para garantizar tipado seguro.
 *
 * @returns Elemento JSX de la vista de error de acceso prohibido.
 */
export default async function ForbiddenView() {
  const t = await getTranslations('Errors.forbidden');
  const r = await getTranslations('Routes');

  return (
    <ProtectedLayout>
      <ErrorView
        icon="shieldX"
        iconVariant="forbidden"
        title={t('title')}
        description={t('description')}
        suggestionsTitle={t('suggestionsTitle')}
        suggestions={[
          t('suggestions.contactAdmin'),
          t('suggestions.goBack'),
          t('suggestions.goHome'),
        ]}
        redirect={{
          path: REDIRECT_PATH,
          delay: REDIRECT_DELAY,
          destination: r('/home'),
        }}
        action={{
          label: t('actions.goToHome'),
          href: REDIRECT_PATH,
        }}
      />
    </ProtectedLayout>
  );
}
