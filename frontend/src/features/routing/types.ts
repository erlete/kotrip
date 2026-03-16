import { Pathname } from '@/features/i18n';
import { Role } from '@kotrip/data';
import type { LucideIcon } from 'lucide-react';
import { Messages } from 'next-intl';

export type AccessConfig = {
  roles?: Role[];
};

export type SidebarConfig = {
  labelKey: keyof Messages['Routes'];
  icon: LucideIcon;
  order?: number;
};

export type RouteRegistryEntry = {
  path: Pathname;
  access?: AccessConfig;
  sidebar?: SidebarConfig;
};

export type SidebarRoute = {
  path: Pathname;
  sidebar: SidebarConfig;
  children?: SidebarRoute[];
};
