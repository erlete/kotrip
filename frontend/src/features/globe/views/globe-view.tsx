'use client';

import { Globe2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

/**
 * Carga diferida del componente de globo para evitar impacto en el bundle principal.
 * El componente requiere WebGL y acceso al DOM, por lo que no es compatible con SSR.
 */
const GlobeCanvas = dynamic(
  () =>
    import('../components/globe-canvas').then((mod) => ({
      default: mod.GlobeCanvas,
    })),
  { ssr: false },
);

/** Lugar visitado con coordenadas y nombre. */
export interface VisitedPlace {
  lat: number;
  lng: number;
  name: string;
}

/**
 * Vista de la página del globo terráqueo.
 *
 * Renderiza un globo 3D interactivo con marcadores en los
 * lugares visitados por el usuario en sus viajes.
 */
export function GlobeView({
  visitedPlaces,
}: {
  visitedPlaces: VisitedPlace[];
}) {
  const t = useTranslations('Globe');

  return (
    <div className="flex flex-col items-center gap-[var(--spacing-lg)] py-10 px-8 w-full mx-auto max-w-[72rem]">
      {/* Encabezado */}
      <header className="flex flex-col items-center gap-[var(--spacing-xs)] text-center">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[rgba(42,168,148,0.12)]">
          <Globe2
            size={24}
            className="text-[var(--primary-400)]"
          />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-md">
          {t('subtitle')}
        </p>
      </header>

      {/* Globo */}
      <div className="flex items-center justify-center w-full">
        <GlobeCanvas visitedPlaces={visitedPlaces} />
      </div>
    </div>
  );
}
