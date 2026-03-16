'use client';

import createGlobe from 'cobe';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { VisitedPlace } from '../views/globe-view';

/**
 * Convierte coordenadas geográficas a ángulos esféricos para cobe.
 *
 * @param lat Latitud en grados.
 * @param lng Longitud en grados.
 * @returns Tupla [phi, theta] en radianes.
 */
function locationToAngles(lat: number, lng: number): [number, number] {
  return [
    Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
    (lat * Math.PI) / 180,
  ];
}

/** Ángulos iniciales centrados en España (~40.4N, -3.7W). */
const [SPAIN_PHI, SPAIN_THETA] = locationToAngles(40.4, -3.7);

/**
 * Props del componente de globo.
 */
interface GlobeCanvasProps {
  /** Lugares visitados por el usuario para mostrar como marcadores. */
  visitedPlaces: VisitedPlace[];
  /** Color principal para los marcadores en formato RGB 0-1. */
  markerColor?: [number, number, number];
}

/**
 * Componente canvas que renderiza un globo 3D interactivo.
 *
 * Utiliza la librería `cobe` para generar un globo WebGL ligero.
 * El globo rota lentamente, se centra en España y permite
 * arrastre en todas las direcciones (horizontal y vertical).
 */
export function GlobeCanvas({
  visitedPlaces,
  markerColor = [0.16, 0.66, 0.58],
}: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const dragOffsetPhi = useRef(0);
  const dragOffsetTheta = useRef(0);
  const phiRef = useRef(SPAIN_PHI);
  const thetaRef = useRef(SPAIN_THETA);

  const markers = useMemo(
    () =>
      visitedPlaces.map((place) => ({
        location: [place.lat, place.lng] as [number, number],
        size: 0.07,
      })),
    [visitedPlaces],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      pointerStart.current = {
        x: e.clientX - dragOffsetPhi.current,
        y: e.clientY - dragOffsetTheta.current,
      };
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    },
    [],
  );

  const onPointerUp = useCallback(() => {
    pointerStart.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (pointerStart.current !== null) {
      dragOffsetPhi.current = e.clientX - pointerStart.current.x;
      dragOffsetTheta.current = e.clientY - pointerStart.current.y;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (pointerStart.current !== null && e.touches[0]) {
      dragOffsetPhi.current = e.touches[0].clientX - pointerStart.current.x;
      dragOffsetTheta.current = e.touches[0].clientY - pointerStart.current.y;
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let width = 0;
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: SPAIN_PHI,
      theta: SPAIN_THETA,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 2.5,
      baseColor: [0.12, 0.14, 0.18],
      markerColor,
      glowColor: [0.08, 0.08, 0.12],
      markers,
      onRender: (state) => {
        if (pointerStart.current === null) {
          phiRef.current += 0.001;
        }
        state.phi = phiRef.current + dragOffsetPhi.current / 200;
        state.theta = thetaRef.current + dragOffsetTheta.current / 200;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    const canvas = canvasRef.current;
    setTimeout(() => {
      if (canvas) canvas.style.opacity = '1';
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [markerColor, markers]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerOut={onPointerUp}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      className="w-full max-w-[600px] aspect-square"
      style={{
        cursor: 'grab',
        contain: 'layout paint size',
        opacity: 0,
        transition: 'opacity 1s ease',
      }}
    />
  );
}
