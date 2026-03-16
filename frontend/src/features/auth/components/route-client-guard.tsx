'use client';

import { PropsWithChildren } from 'react';
import { ClientAuthGuard } from './client-auth-guard';

/**
 * Client-side guard that resolves roles from the route registry using the
 * current pathname. Intended for layouts to avoid per-page guard boilerplate.
 */
export function RouteClientGuard({ children }: PropsWithChildren) {
  return <ClientAuthGuard>{children}</ClientAuthGuard>;
}
