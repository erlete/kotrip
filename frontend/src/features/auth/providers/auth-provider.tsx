import { HTMLProps, PropsWithChildren } from 'react';
import { getRawSession } from '../cookies';
import { AuthProviderInternal } from './auth-provider-internal';

/**
 * Props del `AuthProvider`.
 */
export type AuthProviderProps = PropsWithChildren &
  HTMLProps<HTMLSelectElement>;

/**
 * Provider de autenticación en servidor.
 *
 * Obtiene la sesión desde cookies y la pasa al provider interno de cliente.
 */
export async function AuthProvider(props: AuthProviderProps) {
  const session = await getRawSession();

  return (
    <AuthProviderInternal
      {...props}
      session={session}
    />
  );
}
