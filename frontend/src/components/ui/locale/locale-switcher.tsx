import { localeItems } from '@/features/i18n';
import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcherSelect from './locale-switcher-select';

/**
 * Componente selector de idioma.
 *
 * Detecta el locale actual y renderiza el selector con
 * los idiomas disponibles en la configuracion de la aplicacion.
 */
export default function LocaleSwitcher() {
  const t = useTranslations('Placeholders');
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      items={localeItems}
      label={t('placeholderLanguage')}
    />
  );
}
