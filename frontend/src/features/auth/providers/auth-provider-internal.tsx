'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { updateSession } from '../actions';
import { Session, ValidatedSession } from '../types';
import { AuthProviderProps } from './auth-provider';

export type SessionStatus =
  | 'updating'
  | 'needsValidation'
  | 'authenticated'
  | 'unauthenticated';

/**
 * Valor expuesto por el contexto de autenticación.
 */
export interface AuthContextValue {
  data: ValidatedSession | null;
  status: SessionStatus;
  update: (user: Partial<Session>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderInternalProps = AuthProviderProps & {
  session: Session | null;
};

/**
 * Provider interno de cliente que mantiene el estado de sesión.
 */
export function AuthProviderInternal({
  children,
  session,
}: AuthProviderInternalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const status: SessionStatus = useMemo(() => {
    if (isUpdating) return 'updating';
    if (!session) return 'unauthenticated';
    if ('needsValidation' in session) return 'needsValidation';
    return 'authenticated';
  }, [session, isUpdating]);

  const update = useCallback(
    async (newPartialUser: Partial<Session>) => {
      if (!session) return;

      setIsUpdating(true);
      try {
        await updateSession({ ...session, ...newPartialUser } as Session);
      } finally {
        setIsUpdating(false);
      }
    },
    [session],
  );

  const value = useMemo(
    () => ({
      data: (status === 'needsValidation' ? null : session) as ValidatedSession,
      status,
      update,
    }),
    [session, status, update],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

/**
 * Acceso al contexto de autenticación.
 *
 * @throws Error si se usa fuera de `AuthProvider`.
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
