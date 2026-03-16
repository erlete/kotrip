/**
 * @file theme-toggle.tsx
 * @description
 * Componente de alternancia de tema claro/oscuro.
 * Utiliza el Switch de HeroUI como mecanismo de cambio.
 */

'use client';

import { useTheme } from '@/features/theme';
import { Switch } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

/**
 * Componente de alternancia de tema claro/oscuro.
 *
 * Utiliza el hook `useTheme` para gestionar el estado del tema
 * y el componente `Switch` de HeroUI v3 para la interfaz visual.
 * El thumb del switch muestra un ícono de sol o luna según el modo activo.
 *
 * @returns Elemento JSX del toggle de tema.
 */
export default function ThemeToggle() {
  const t = useTranslations('ToggleComponent');
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const uniqueId = useId();
  const themeToggleId = `theme-toggle-${uniqueId}`;

  return (
    <Switch
      id={themeToggleId}
      name="theme"
      isSelected={isDarkMode}
      onChange={toggleTheme}
      aria-label={isDarkMode ? t('ariaDarkLabel') : t('ariaLightLabel')}
      className="shrink-0"
      size="sm"
    >
      <Switch.Control>
        <Switch.Thumb>
          {isDarkMode ? (
            <Moon className="w-3 h-3 text-[var(--text)]" />
          ) : (
            <Sun className="w-3 h-3 text-[var(--text)]" />
          )}
        </Switch.Thumb>
      </Switch.Control>
    </Switch>
  );
}
