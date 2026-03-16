import { Pathname } from '@/features/i18n';
import { Role } from '@kotrip/data';
import type { LucideIcon } from 'lucide-react';
import { Messages } from 'next-intl';

/** Configuracion de acceso por roles para una ruta. */
export type AccessConfig = {
  /** Roles permitidos. Si esta vacio o ausente, todos los roles tienen acceso. */
  roles?: Role[];
};

/** Configuracion de la entrada en la barra de navegacion lateral. */
export type SidebarConfig = {
  /** Clave de traduccion para la etiqueta del enlace. */
  labelKey: keyof Messages['Routes'];
  /** Icono de Lucide que representa la ruta. */
  icon: LucideIcon;
  /** Orden de aparicion en el menu (menor valor aparece primero). */
  order?: number;
};

/** Entrada del registro de rutas con configuracion de acceso y sidebar. */
export type RouteRegistryEntry = {
  /** Pathname tipado de la ruta. */
  path: Pathname;
  /** Configuracion de acceso (roles permitidos). */
  access?: AccessConfig;
  /** Configuracion de sidebar (icono, etiqueta, orden). */
  sidebar?: SidebarConfig;
};

/** Ruta de sidebar resuelta con posibles hijos anidados. */
export type SidebarRoute = {
  /** Pathname tipado de la ruta. */
  path: Pathname;
  /** Configuracion de sidebar de esta ruta. */
  sidebar: SidebarConfig;
  /** Rutas hijas anidadas. */
  children?: SidebarRoute[];
};
