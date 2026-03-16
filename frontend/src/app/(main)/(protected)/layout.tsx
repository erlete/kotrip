import { ProtectedLayout } from '@/components/layout/protected-layout';
import { ServerAuthGuard } from '@/features/auth';
import { PropsWithChildren } from 'react';

/**
 * Layout para las paginas protegidas de la aplicacion.
 *
 * Envuelve el contenido con ServerAuthGuard para requerir autenticacion
 * y con ProtectedLayout para la estructura visual (topbar, contenido, footer).
 */
export default function Layout({ children }: PropsWithChildren) {
  return (
    <ServerAuthGuard require="auth">
      <ProtectedLayout>{children}</ProtectedLayout>
    </ServerAuthGuard>
  );
}
