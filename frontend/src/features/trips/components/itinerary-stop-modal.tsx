'use client';

import { useRouter } from '@/features/i18n';
import type { ItineraryStop } from '@/features/trips/services/trips-api';
import {
  createItineraryStop,
  updateItineraryStop,
} from '@/features/trips/services/trips-api';
import { Button, InputGroup, Label, Modal, TextField } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';

/**
 * Props del modal de creación/edición de parada de itinerario.
 */
interface ItineraryStopModalProps {
  /** ID del viaje. */
  tripId: string;
  /** Parada existente si se está editando. Null para creación. */
  stop: ItineraryStop | null;
  /** Indica si el modal está abierto. */
  isOpen: boolean;
  /** Callback para cambiar el estado de apertura. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal para crear o editar una parada de itinerario.
 */
export function ItineraryStopModal({
  tripId,
  stop,
  isOpen,
  onOpenChange,
}: ItineraryStopModalProps) {
  const t = useTranslations('Trips.itinerary');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = stop !== null;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const latitude = Number(form.get('latitude'));
    const longitude = Number(form.get('longitude'));
    const travelMethod = (form.get('travelMethod') as string) || undefined;
    const travelTimeMin = form.get('travelTime') as string;
    const travelTime = travelTimeMin ? Number(travelTimeMin) * 60 : undefined;
    const arriveAt = (form.get('arriveAt') as string) || undefined;

    if (!name || Number.isNaN(latitude) || Number.isNaN(longitude)) return;

    startTransition(async () => {
      const body = {
        name,
        latitude,
        longitude,
        travelMethod: travelMethod as 'CAR' | 'WALKING' | undefined,
        travelTime,
        arriveAt: arriveAt ? new Date(arriveAt).toISOString() : undefined,
      };

      const result = isEditing
        ? await updateItineraryStop(tripId, stop.id, body)
        : await createItineraryStop(tripId, body);

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  const travelTime = stop?.travelTime as unknown as number | null;
  const travelMethod = stop?.travelMethod as unknown as string | null;
  const arriveAt = stop?.arriveAt as unknown as string | null;

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!isPending) onOpenChange(open);
        }}
      >
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {isEditing ? t('editStop') : t('addStop')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <form
                id="stop-form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                {/* Nombre */}
                <TextField
                  name="name"
                  isRequired
                  defaultValue={stop?.name ?? ''}
                >
                  <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                    {t('fieldName')}
                  </Label>
                  <InputGroup>
                    <InputGroup.Input
                      type="text"
                      placeholder={t('fieldNamePlaceholder')}
                    />
                  </InputGroup>
                </TextField>

                {/* Coordenadas */}
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    name="latitude"
                    isRequired
                    defaultValue={stop ? String(stop.latitude) : ''}
                  >
                    <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                      {t('fieldLatitude')}
                    </Label>
                    <InputGroup>
                      <InputGroup.Input
                        type="number"
                        step="any"
                        placeholder="42.2372"
                      />
                    </InputGroup>
                  </TextField>

                  <TextField
                    name="longitude"
                    isRequired
                    defaultValue={stop ? String(stop.longitude) : ''}
                  >
                    <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                      {t('fieldLongitude')}
                    </Label>
                    <InputGroup>
                      <InputGroup.Input
                        type="number"
                        step="any"
                        placeholder="-8.7263"
                      />
                    </InputGroup>
                  </TextField>
                </div>

                {/* Método de viaje */}
                <div>
                  <label className="text-sm font-semibold text-[var(--text-subtitle)] mb-1 block">
                    {t('fieldTravelMethod')}
                  </label>
                  <select
                    name="travelMethod"
                    defaultValue={travelMethod ?? ''}
                    className="w-full px-3 py-2 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--rounded-sm)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary-500)] transition-colors"
                  >
                    <option value="">-</option>
                    <option value="CAR">{t('travelMethodCar')}</option>
                    <option value="WALKING">{t('travelMethodWalking')}</option>
                  </select>
                </div>

                {/* Tiempo de viaje (minutos) */}
                <TextField
                  name="travelTime"
                  defaultValue={
                    travelTime ? String(Math.round(travelTime / 60)) : ''
                  }
                >
                  <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                    {t('fieldTravelTime')}
                  </Label>
                  <InputGroup>
                    <InputGroup.Input
                      type="number"
                      min={0}
                      placeholder="15"
                    />
                  </InputGroup>
                </TextField>

                {/* Hora de llegada */}
                <TextField
                  name="arriveAt"
                  defaultValue={arriveAt ? arriveAt.slice(0, 16) : ''}
                >
                  <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                    {t('arriveAt')}
                  </Label>
                  <InputGroup>
                    <InputGroup.Input type="datetime-local" />
                  </InputGroup>
                </TextField>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                slot="close"
                variant="ghost"
                isDisabled={isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                form="stop-form"
                variant="primary"
                isDisabled={isPending}
              >
                {isPending
                  ? isEditing
                    ? t('saving')
                    : t('creating')
                  : isEditing
                    ? t('save')
                    : t('addStop')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
