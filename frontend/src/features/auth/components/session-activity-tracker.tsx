'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { updateSessionExpiration } from '../session-updater';

/**
 * Componente que rastrea la actividad del usuario para extender la sesión.
 *
 * Escucha cambios de navegación y actualiza la expiración de la cookie
 * de sesión implementando un patrón de sliding window.
 */
export function SessionActivityTracker() {
  const pathname = usePathname();

  // Actualizar sesión en cada cambio de ruta
  useEffect(() => {
    const updateSession = async () => {
      const updated = await updateSessionExpiration();
      if (updated) {
        // console.log('[Auth] Session expiration extended on navigation');
      }
    };

    updateSession();
  }, [pathname]);

  // Actualizar en eventos de actividad del usuario (throttled)
  useEffect(() => {
    const handleActivity = async () => {
      await updateSessionExpiration();
    };

    const events = ['click', 'keydown', 'scroll', 'mousemove'] as const;
    let throttleTimeout: NodeJS.Timeout | null = null;

    const throttledHandler = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          handleActivity();
          throttleTimeout = null;
        }, 60000); // Máximo una actualización por minuto de eventos de UI
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, throttledHandler, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledHandler);
      });
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, []);

  return null; // No renderiza nada
}
