// Este archivo se genera automáticamente por scripts/modules/generate-route-registry.mjs.
//! No editar manualmente.

import type { RouteRegistryEntry } from '@/features/routing';
import { Role } from '@kotrip/data';
import { Globe2, Headset, House, Mail, Plane } from 'lucide-react';

export const ROUTE_REGISTRY: RouteRegistryEntry[] = [
  { path: '/globe', sidebar: { labelKey: '/globe', icon: Globe2, order: 20 } },
  { path: '/home', sidebar: { labelKey: '/home', icon: House, order: 1 } },
  {
    path: '/invitations',
    access: { roles: [Role.USER, Role.ADMIN] },
    sidebar: { labelKey: '/invitations', icon: Mail, order: 15 },
  },
  {
    path: '/support',
    sidebar: { labelKey: '/support', icon: Headset, order: 90 },
  },
  {
    path: '/trips',
    access: { roles: [Role.USER, Role.ADMIN] },
    sidebar: { labelKey: '/trips', icon: Plane, order: 10 },
  },
  { path: '/trips/[id]', access: { roles: [Role.USER, Role.ADMIN] } },
  { path: '/trips/[id]/expenses', access: { roles: [Role.USER, Role.ADMIN] } },
  { path: '/trips/[id]/itinerary', access: { roles: [Role.USER, Role.ADMIN] } },
  { path: '/trips/[id]/tickets', access: { roles: [Role.USER, Role.ADMIN] } },
  { path: '/trips/create', access: { roles: [Role.USER, Role.ADMIN] } },
];
