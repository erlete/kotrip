import { ErrorView } from '@/features/errors/components/error-view';
import { getTranslations } from 'next-intl/server';

/** Ruta de redirección por defecto para errores de página no encontrada. */
const REDIRECT_PATH = '/login';

/** Tiempo de espera en segundos antes de la redirección automática. */
const REDIRECT_DELAY = 20;

/**
 * Props del componente NotFoundView.
 */
interface NotFoundViewProps {
  /** Ruta de redirección personalizada (opcional, por defecto '/login'). */
  redirectPath?: string;
  /** Nombre del destino para mostrar en los mensajes de la vista. */
  destination: string;
}

/**
 * Vista de error de página no encontrada (404).
 *
 * @remarks
 * Se muestra cuando el usuario intenta acceder a una ruta que no existe.
 * Proporciona sugerencias para resolver la situación y redirige automáticamente
 * al destino especificado. Traduce todo el contenido internamente usando
 * `getTranslations` con namespace fijo para garantizar tipado seguro.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX de la vista de error de página no encontrada.
 */
export default async function NotFoundView({
  redirectPath,
  destination,
}: NotFoundViewProps) {
  const t = await getTranslations('Errors.notFound');

  const effectiveRedirectPath = redirectPath || REDIRECT_PATH;

  return (
    <ErrorView
      icon="fileQuestion"
      iconVariant="warning"
      title={t('title')}
      description={t('description')}
      suggestionsTitle={t('suggestionsTitle')}
      suggestions={[
        t('suggestions.checkUrl'),
        t('suggestions.goBack'),
        t('actions.goBack', { destination }),
      ]}
      redirect={{
        path: effectiveRedirectPath,
        delay: REDIRECT_DELAY,
        destination,
      }}
      action={{
        label: t('actions.goTo', { destination }),
        href: effectiveRedirectPath,
      }}
    />
  );
}
