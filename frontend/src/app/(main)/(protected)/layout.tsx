import { ProtectedLayout } from '@/components/layout/protected-layout';
import { ServerAuthGuard } from '@/features/auth';
import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <ServerAuthGuard require="auth">
      <ProtectedLayout>{children}</ProtectedLayout>
    </ServerAuthGuard>
  );
}
