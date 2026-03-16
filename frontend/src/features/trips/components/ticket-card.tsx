'use client';

import type { Ticket } from '@/features/trips/services/trips-api';
import { getTicketDownloadUrl } from '@/features/trips/services/trips-api';
import { triggerBrowserDownload } from '@/features/trips/utils/ticket-download';
import { Button } from '@heroui/react';
import { Download, File, FileImage, FileText, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

/**
 * Detecta el tipo de icono según la extensión del archivo.
 *
 * @param url Path o URL del archivo.
 * @returns Componente de icono adecuado.
 */
function getFileIcon(url: string | null) {
  if (!url) return File;
  const ext = url.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return FileText;
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext ?? ''))
    return FileImage;
  return File;
}

/**
 * Props del componente de tarjeta de ticket.
 */
interface TicketCardProps {
  /** Datos del ticket. */
  ticket: Ticket;
  /** Mapa de ID de parada a nombre, para resolver la referencia. */
  stopNameMap: Map<string, string>;
}

/**
 * Tarjeta visual para un ticket de itinerario.
 *
 * Muestra el nombre, descripción, la parada vinculada y un botón de descarga.
 * Si el ticket no tiene archivo asociado, el botón se muestra deshabilitado.
 */
export function TicketCard({ ticket, stopNameMap }: TicketCardProps) {
  const t = useTranslations('Trips.tickets');
  const [isPending, startTransition] = useTransition();
  const [downloading, setDownloading] = useState(false);

  const objectUrl = ticket.objectUrl as unknown as string | null;
  const description = ticket.description as unknown as string | null;
  const tripItineraryId = ticket.tripItineraryId as unknown as string | null;
  const FileIcon = getFileIcon(objectUrl);
  const stopName = tripItineraryId
    ? stopNameMap.get(tripItineraryId)
    : undefined;

  const handleDownload = () => {
    if (!objectUrl) return;
    setDownloading(true);
    startTransition(async () => {
      const url = await getTicketDownloadUrl(objectUrl);
      if (url) {
        triggerBrowserDownload(url, ticket.name);
      }
      setDownloading(false);
    });
  };

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-lg)] p-5 flex flex-col gap-3 transition-colors hover:border-[rgba(42,168,148,0.2)]">
      {/* Encabezado con icono */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-[var(--rounded-sm)] bg-[rgba(42,168,148,0.12)] flex items-center justify-center shrink-0">
          <FileIcon
            size={20}
            className="text-[var(--primary-400)]"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text)] m-0 truncate">
            {ticket.name}
          </h3>
          {description && (
            <p className="text-xs text-[var(--text-muted)] m-0 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Parada vinculada */}
      {stopName && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <MapPin
            size={12}
            className="text-[var(--primary-400)]"
          />
          <span>
            {t('linkedStop')}: {stopName}
          </span>
        </div>
      )}

      {/* Botón de descarga */}
      <Button
        size="sm"
        variant="ghost"
        isDisabled={!objectUrl}
        onPress={handleDownload}
        className="self-start text-[var(--primary-500)] mt-auto"
      >
        <Download size={14} />
        {downloading || isPending
          ? t('downloading')
          : objectUrl
            ? t('download')
            : t('noFile')}
      </Button>
    </div>
  );
}
