'use client';

import type { ItineraryStop } from '@/features/trips/services/trips-api';
import type { LatLngBoundsExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet';

/**
 * Crea un icono numerado circular para los marcadores del mapa.
 */
function createNumberedIcon(index: number, selected: boolean): L.DivIcon {
  const bg = selected
    ? 'background: var(--primary-500); box-shadow: 0 0 0 4px rgba(42,168,148,0.3);'
    : 'background: var(--primary-700);';

  return L.divIcon({
    className: '',
    html: `<div style="
      ${bg}
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      border: 2px solid white;
    ">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

/**
 * Componente interno que ajusta los límites del mapa a las paradas visibles.
 */
function FitBounds({ stops }: { stops: ItineraryStop[] }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length === 0) return;

    const bounds: LatLngBoundsExpression = stops.map(
      (s) => [s.latitude, s.longitude] as [number, number],
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, stops]);

  return null;
}

/**
 * Obtiene la ruta a pie real entre todas las paradas usando OSRM público.
 *
 * @param stops Lista de paradas con coordenadas.
 * @returns Array de segmentos de ruta, donde cada segmento es un array de [lat, lng].
 */
async function fetchWalkingRoutes(
  stops: ItineraryStop[],
): Promise<[number, number][][]> {
  if (stops.length < 2) return [];

  const segments: [number, number][][] = [];

  // Peticiones por pares consecutivos para obtener cada tramo individual
  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    const coords = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`,
      );
      const data = await res.json();

      if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
        // OSRM devuelve [lng, lat], Leaflet necesita [lat, lng]
        const coords = data.routes[0].geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
        );
        segments.push(coords);
      } else {
        // Fallback: línea recta si OSRM falla para este tramo
        segments.push([
          [from.latitude, from.longitude],
          [to.latitude, to.longitude],
        ]);
      }
    } catch {
      // Fallback: línea recta si la petición falla
      segments.push([
        [from.latitude, from.longitude],
        [to.latitude, to.longitude],
      ]);
    }
  }

  return segments;
}

interface ItineraryMapProps {
  stops: ItineraryStop[];
  selectedIndex: number;
  onSelectStop: (index: number) => void;
}

/**
 * Mapa interactivo del itinerario con marcadores numerados y rutas a pie reales.
 *
 * Utiliza OpenStreetMap como capa de teselas, Leaflet para la renderización
 * y la API pública de OSRM para calcular rutas peatonales reales entre paradas.
 */
export function ItineraryMap({
  stops,
  selectedIndex,
  onSelectStop,
}: ItineraryMapProps) {
  const defaultCenter: [number, number] =
    stops.length > 0 ? [stops[0].latitude, stops[0].longitude] : [40.4, -3.7];

  const [routeSegments, setRouteSegments] = useState<[number, number][][]>([]);

  // Calcular rutas reales cuando cambian las paradas
  useEffect(() => {
    if (stops.length < 2) {
      setRouteSegments([]);
      return;
    }

    let cancelled = false;

    fetchWalkingRoutes(stops).then((segments) => {
      if (!cancelled) setRouteSegments(segments);
    });

    return () => {
      cancelled = true;
    };
  }, [stops]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={10}
      className="w-full h-full rounded-[var(--rounded-lg)] z-0"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds stops={stops} />

      {/* Rutas a pie reales entre paradas */}
      {routeSegments.map((segment, idx) => (
        <Polyline
          key={`route-${idx}`}
          positions={segment}
          pathOptions={{
            color: 'rgba(42, 168, 148, 0.7)',
            weight: 4,
          }}
        />
      ))}

      {/* Marcadores numerados */}
      {stops.map((stop, idx) => (
        <Marker
          key={stop.id}
          position={[stop.latitude, stop.longitude]}
          icon={createNumberedIcon(idx, idx === selectedIndex)}
          eventHandlers={{
            click: () => onSelectStop(idx),
          }}
        />
      ))}
    </MapContainer>
  );
}
