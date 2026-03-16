import { themedAsset } from '@/lib/themed-asset';
import type { AppConfig } from './config.types';

export const defaultConfig: AppConfig = {
  brand: {
    title: 'Kotrip',
    description: 'Plataforma de gestión de aprendizaje para cursos en línea',
    logo: {
      path: {
        normal: '/assets/svg/brand.svg',
        negative: '/assets/svg/brand.svg',
        loader: '/assets/svg/brand-loader.svg',
      },
      alt: 'Logo Kotrip',
      dimmensions: {
        width: 187.5,
        height: 62.5,
      },
    },
    favicon: '/assets/svg/logo.svg',
    footerImages: [],
  },

  theme: {
    defaultMode: 'dark',
    allowToggle: false,
  },

  i18n: {
    defaultLanguage: 'es',
    availableLanguages: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
    ],
  },

  contact: {
    email: 'info@kotrip.es',
    phone: '+34000000000',
    linkedIn: 'https://www.linkedin.com/company/kotrip',
  },

  legal: {
    cookies: 'https://kotrip.es/politica-cookies',
    privacy: 'https://kotrip.es/politica-privacidad',
  },

  /* @todo: no integrado en los componentes todavía */
  typography: {
    fontFamily: 'Inter, sans-serif',
    scale: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
    },
  },

  /* @todo: no integrado en los componentes todavía */
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
  },

  /* @todo: no integrado en los componentes todavía */
  animation: {
    level: 'full',
  },

  layout: {
    sidebarCollapsedByDefault: false,
  },

  roles: {
    ADMIN: 'Administrator',
    USER: 'User',
  },
};
