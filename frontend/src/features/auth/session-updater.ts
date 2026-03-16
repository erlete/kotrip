'use server';

import { durationToMs } from '@/lib/utils/duration';
import { getRawSession, setSession } from './cookies';

/**
 * Caché en memoria del último update por usuario.
 * Usado para throttling de actualizaciones de sesión.
 */
const lastUpdateCache = new Map<string, number>();

/**
 * Actualiza la expiración de la cookie de sesión si ha pasado suficiente tiempo.
 *
 * Implementa un patrón de "sliding window" donde cada actividad del usuario
 * extiende la vida de la sesión. El throttling previene actualizaciones excesivas.
 *
 * @returns true si la sesión fue actualizada, false si fue throttled o no había sesión
 */
export async function updateSessionExpiration(): Promise<boolean> {
  const session = await getRawSession();

  if (!session) {
    return false; // No hay sesión que actualizar
  }

  // Verificar que tenemos un ID de usuario para identificar la sesión
  if (!('id' in session)) {
    return false; // No podemos identificar la sesión
  }

  const userId = session.id;
  const now = Date.now();
  const throttleMs = durationToMs(process.env.SESSION_UPDATE_THROTTLE || '5m');

  const lastUpdate = lastUpdateCache.get(userId) || 0;
  const timeSinceUpdate = now - lastUpdate;

  // Throttle: no actualizar si aún no ha pasado suficiente tiempo
  if (timeSinceUpdate < throttleMs) {
    return false;
  }

  // Actualizar la cookie de sesión (esto resetea su maxAge)
  await setSession(session);

  // Actualizar el caché con el timestamp actual
  lastUpdateCache.set(userId, now);

  // Limpieza del caché para prevenir memory leak
  // Si el caché crece demasiado, limpiamos las entradas más antiguas
  if (lastUpdateCache.size > 1000) {
    const entries = Array.from(lastUpdateCache.entries());
    // Ordenar por timestamp, más recientes primero
    entries.sort((a, b) => b[1] - a[1]);
    // Limpiar y mantener solo las 500 entradas más recientes
    lastUpdateCache.clear();
    entries.slice(0, 500).forEach(([id, time]) => {
      lastUpdateCache.set(id, time);
    });
  }

  return true;
}
