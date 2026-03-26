/**
 * @file locale-switcher-select.tsx
 * @description
 * Selector de idioma basado en HeroUI Select.
 * Permite al usuario cambiar el idioma de la aplicacion
 * mediante un menu desplegable accesible.
 */

'use client';

import { Locale, setUserLocale } from '@/features/i18n';
import type { Key } from '@heroui/react';
import { ListBox, Select } from '@heroui/react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

/**
 * Selector de idioma basado en HeroUI Select.
 *
 * Permite al usuario cambiar el idioma de la aplicación mediante un menú
 * desplegable accesible. El cambio se aplica de forma local mediante cookies
 * utilizando la función {@link setUserLocale}.
 *
 * @param defaultValue - Código del idioma actualmente seleccionado.
 * @param items - Lista de idiomas disponibles con su código y etiqueta visible.
 * @param label - Texto descriptivo utilizado como `aria-label` del selector.
 */
export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const placeholders = useTranslations('Placeholders');

  /**
   * Maneja el cambio de selección en el menú de idiomas.
   * Inicia una transición asíncrona para aplicar el nuevo locale.
   */
  const handleChange = (key: Key | null) => {
    if (!key) return;
    const locale = key as Locale;
    startTransition(async () => {
      await setUserLocale(locale);
    });
  };

  return (
    <Select
      aria-label={label}
      className={clsx('w-auto', isPending && 'pointer-events-none opacity-60')}
      defaultSelectedKey={defaultValue}
      name="language"
      placeholder={placeholders('placeholderLanguage')}
      onSelectionChange={handleChange}
    >
      <Select.Trigger className="flex items-center gap-1 rounded-[var(--rounded-sm)] border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--primary-500)]/40 hover:text-[var(--text)]">
        <span className="uppercase tracking-wide">
          {defaultValue.toUpperCase()}
        </span>
        <ChevronDown
          size={12}
          className="opacity-50"
        />
      </Select.Trigger>
      <Select.Popover className="rounded-[var(--rounded-sm)] border border-[var(--border)] bg-[var(--bg)] shadow-lg min-w-[120px]">
        <ListBox className="p-1">
          {items.map((item) => (
            <ListBox.Item
              key={item.value}
              id={item.value}
              textValue={item.label}
              className="cursor-pointer rounded-[var(--rounded-xs)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors hover:bg-[var(--primary-500)]/10 data-[selected]:text-[var(--primary-400)]"
            >
              {item.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
