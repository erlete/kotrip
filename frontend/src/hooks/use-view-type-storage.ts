'use client';

import { startTransition, useEffect, useRef, useState } from 'react';

/**
 * Tipo de vista disponible para listados.
 */
export type ViewType = 'grid' | 'list';

/**
 * Resultado del hook useViewTypeStorage.
 */
interface UseViewTypeStorageResult {
  /** Tipo de vista actual. */
  viewType: ViewType;
  /** Función para actualizar el tipo de vista. */
  updateViewType: (newViewType: ViewType) => void;
  /** Indica si ya se ha leído el valor de localStorage (hidratación completa). */
  isHydrated: boolean;
}

/**
 * Hook para manejar la preferencia de tipo de vista con persistencia en localStorage.
 *
 * Evita hydration mismatch devolviendo el valor por defecto durante SSR,
 * y sincronizando con localStorage solo en el cliente.
 * Devuelve isHydrated=false hasta que se haya leído localStorage,
 * permitiendo mostrar un skeleton mientras se carga.
 *
 * @param storageKey - Clave única para almacenar la preferencia en localStorage.
 * @param defaultValue - Valor por defecto si no existe preferencia guardada.
 * @returns Objeto con viewType, updateViewType e isHydrated.
 */
export function useViewTypeStorage(
  storageKey: string,
  defaultValue: ViewType = 'grid',
): UseViewTypeStorageResult {
  const [viewType, setViewType] = useState<ViewType>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (!isFirstRenderRef.current) return;
    isFirstRenderRef.current = false;

    const stored = localStorage.getItem(storageKey);
    startTransition(() => {
      if (stored === 'grid' || stored === 'list') {
        setViewType(stored);
      }
      setIsHydrated(true);
    });
  }, [storageKey]);

  /**
   * Actualiza el tipo de vista y persiste la preferencia en localStorage.
   *
   * @param newViewType - Nuevo tipo de vista a establecer.
   */
  const updateViewType = (newViewType: ViewType) => {
    setViewType(newViewType);
    localStorage.setItem(storageKey, newViewType);
  };

  return { viewType, updateViewType, isHydrated };
}
