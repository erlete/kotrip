'use client';

import type { ItineraryStop } from '@/features/trips/services/trips-api';
import type { LatLngBoundsExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet';

/**
 * Crea un icono numerado circular para los marcadores del mapa.
 *
 * @param index Número a mostrar en el marcador (posición en el itinerario).
 * @param selected Indica si el marcador está seleccionado.
 * @returns Instancia de DivIcon de Leaflet.
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
 * Props del componente de mapa del itinerario.
 */
interface ItineraryMapProps {
  /** Lista de paradas a renderizar en el mapa. */
  stops: ItineraryStop[];
  /** Índice de la parada actualmente seleccionada. */
  selectedIndex: number;
  /** Callback al seleccionar una parada. */
  onSelectStop: (index: number) => void;
}

/**
 * Mapa interactivo del itinerario con marcadores numerados y polilíneas.
 *
 * Utiliza OpenStreetMap como capa de teselas y Leaflet para la renderización.
 * Los marcadores se muestran con números circulares y se conectan con líneas rectas.
 */
export function ItineraryMap({
  stops,
  selectedIndex,
  onSelectStop,
}: ItineraryMapProps) {
  const defaultCenter: [number, number] =
    stops.length > 0 ? [stops[0].latitude, stops[0].longitude] : [40.4, -3.7];

  const polylinePositions = stops.map(
    (s) => [s.latitude, s.longitude] as [number, number],
  );

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

      {/* Polilínea que conecta las paradas */}
      {polylinePositions.length > 1 && (
        <Polyline
          positions={polylinePositions}
          pathOptions={{
            color: 'rgba(42, 168, 148, 0.6)',
            weight: 3,
            dashArray: '8, 6',
          }}
        />
      )}

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
