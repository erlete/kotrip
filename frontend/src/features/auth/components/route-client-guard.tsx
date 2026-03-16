'use client';

import { PropsWithChildren } from 'react';
import { ClientAuthGuard } from './client-auth-guard';

/**
 * Guard del lado del cliente que resuelve roles desde el registro de rutas
 * usando el pathname actual. Pensado para layouts, evitando repetir
 * la logica de proteccion en cada pagina.
 */
export function RouteClientGuard({ children }: PropsWithChildren) {
  return <ClientAuthGuard>{children}</ClientAuthGuard>;
}
