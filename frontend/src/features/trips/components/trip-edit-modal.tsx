'use client';

import { useRouter } from '@/features/i18n';
import type {
  LocalitySearchResult,
  TripDetail,
} from '@/features/trips/services/trips-api';
import {
  searchLocalities,
  updateTrip,
} from '@/features/trips/services/trips-api';
import {
  Button,
  InputGroup,
  Label,
  Modal,
  TextArea,
  TextField,
} from '@heroui/react';
import { MapPin, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from 'react';
import { toast } from 'sonner';

/**
 * Devuelve el placeholder, la función de parseo y de formateo según el locale.
 */
function useDateFormat(locale: string) {
  const isDMY = locale !== 'en';
  const placeholder = isDMY ? 'DD/MM/AAAA' : 'MM/DD/YYYY';

  function parseDate(value: string): Date | null {
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    const [a, b, c] = parts.map(Number);
    if (isDMY) {
      const date = new Date(c, b - 1, a);
      return isNaN(date.getTime()) ? null : date;
    }
    const date = new Date(c, a - 1, b);
    return isNaN(date.getTime()) ? null : date;
  }

  function formatForInput(isoDate: string): string {
    const d = new Date(isoDate);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return isDMY ? `${dd}/${mm}/${yyyy}` : `${mm}/${dd}/${yyyy}`;
  }

  return { placeholder, parseDate, formatForInput };
}

/**
 * Props del modal de edición de viaje.
 */
interface TripEditModalProps {
  /** Datos actuales del viaje. */
  trip: TripDetail;
  /** Indica si el modal está abierto. */
  isOpen: boolean;
  /** Callback para cambiar el estado de apertura. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal de edición de un viaje existente.
 *
 * Permite modificar nombre, descripción, fechas, presupuesto y localidad
 * del viaje. Incluye autocompletado de localidades mediante búsqueda.
 */
export function TripEditModal({
  trip,
  isOpen,
  onOpenChange,
}: TripEditModalProps) {
  const t = useTranslations('Trips');
  const router = useRouter();
  const locale = useLocale();
  const {
    placeholder: datePlaceholder,
    parseDate,
    formatForInput,
  } = useDateFormat(locale);
  const [isPending, startTransition] = useTransition();

  /* Estado de localidad */
  const [localityQuery, setLocalityQuery] = useState('');
  const [localityResults, setLocalityResults] = useState<
    LocalitySearchResult[]
  >([]);
  const [selectedLocality, setSelectedLocality] =
    useState<LocalitySearchResult | null>(
      trip.locality
        ? {
            id: trip.locality.id,
            name: trip.locality.name,
            province: trip.locality.province,
            autonomousCommunity: '',
          }
        : null,
    );
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Búsqueda debounced de localidades. */
  useEffect(() => {
    if (localityQuery.length < 2) {
      setLocalityResults([]);
      setShowLocalityDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const result = await searchLocalities(localityQuery);
      if ('localities' in result) {
        setLocalityResults(result.localities);
        setShowLocalityDropdown(result.localities.length > 0);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localityQuery]);

  /** Envía las modificaciones del viaje. */
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const description = (form.get('description') as string) || undefined;
    const startDateStr = form.get('startDate') as string;
    const endDateStr = form.get('endDate') as string;
    const budgetStr = form.get('budget') as string;
    const budget = budgetStr ? Number(budgetStr) : undefined;

    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);

    if (!startDate || !endDate) {
      toast.error(t('createForm.invalidDate'));
      return;
    }

    /* Calcular estado automático según las fechas */
    const now = new Date();
    let status: 'PLANNED' | 'ACTIVE' | 'FINISHED' | undefined;
    if (endDate < now) {
      status = 'FINISHED';
    } else if (startDate <= now) {
      status = 'ACTIVE';
    } else {
      status = 'PLANNED';
    }

    startTransition(async () => {
      const result = await updateTrip(trip.id, {
        name,
        description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status,
        budget,
        localityId: selectedLocality?.id,
      });

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  const budget = trip.budget as unknown as number | null;

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
              <Modal.Heading>{t('editForm.title')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <form
                id="edit-trip-form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                {/* Nombre */}
                <TextField
                  name="name"
                  isRequired
                  defaultValue={trip.name}
                >
                  <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                    {t('createForm.name')}
                  </Label>
                  <InputGroup>
                    <InputGroup.Input
                      placeholder={t('createForm.namePlaceholder')}
                      minLength={3}
                      maxLength={100}
                    />
                  </InputGroup>
                </TextField>

                {/* Descripción */}
                <TextField
                  name="description"
                  defaultValue={(trip.description as unknown as string) ?? ''}
                >
                  <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                    {t('createForm.description')}
                  </Label>
                  <TextArea
                    placeholder={t('createForm.descriptionPlaceholder')}
                    rows={3}
                  />
                </TextField>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    name="startDate"
                    isRequired
                    defaultValue={formatForInput(trip.startDate)}
                  >
                    <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                      {t('createForm.startDate')}
                    </Label>
                    <InputGroup>
                      <InputGroup.Input
                        type="text"
                        placeholder={datePlaceholder}
                        pattern="\d{1,2}/\d{1,2}/\d{4}"
                      />
                    </InputGroup>
                  </TextField>

                  <TextField
                    name="endDate"
                    isRequired
                    defaultValue={formatForInput(trip.endDate)}
                  >
                    <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                      {t('createForm.endDate')}
                    </Label>
                    <InputGroup>
                      <InputGroup.Input
                        type="text"
                        placeholder={datePlaceholder}
                        pattern="\d{1,2}/\d{1,2}/\d{4}"
                      />
                    </InputGroup>
                  </TextField>
                </div>

                {/* Presupuesto */}
                <TextField
                  name="budget"
                  defaultValue={budget != null ? String(budget) : ''}
                >
                  <Label className="text-sm font-semibold text-[var(--text-subtitle)]">
                    {t('createForm.budget')}
                  </Label>
                  <InputGroup>
                    <InputGroup.Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder={t('createForm.budgetPlaceholder')}
                    />
                  </InputGroup>
                </TextField>

                {/* Localidad con autocompletado */}
                <div className="relative">
                  <label className="text-sm font-semibold text-[var(--text-subtitle)] mb-1 block">
                    {t('createForm.locality')}
                  </label>
                  {selectedLocality ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--rounded-sm)]">
                      <MapPin
                        size={14}
                        className="text-[var(--primary-400)] shrink-0"
                      />
                      <span className="text-sm text-[var(--text)] flex-1">
                        {selectedLocality.name} ({selectedLocality.province})
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedLocality(null)}
                        className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={localityQuery}
                      onChange={(e) => setLocalityQuery(e.target.value)}
                      onFocus={() => {
                        if (localityResults.length > 0)
                          setShowLocalityDropdown(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowLocalityDropdown(false), 200);
                      }}
                      placeholder={t('createForm.localityPlaceholder')}
                      className="w-full px-3 py-2 bg-[var(--bg-light)] border border-[var(--border)] rounded-[var(--rounded-sm)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary-500)] transition-colors"
                    />
                  )}
                  {showLocalityDropdown && (
                    <ul className="absolute z-50 left-0 right-0 mt-1 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--rounded-sm)] max-h-40 overflow-y-auto shadow-lg">
                      {localityResults.map((loc) => (
                        <li key={loc.id}>
                          <button
                            type="button"
                            onMouseDown={() => {
                              setSelectedLocality(loc);
                              setLocalityQuery('');
                              setShowLocalityDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-[var(--text)] hover:bg-[rgba(42,168,148,0.1)] transition-colors"
                          >
                            {loc.name}{' '}
                            <span className="text-[var(--text-muted)]">
                              ({loc.province})
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                slot="close"
                variant="ghost"
                isDisabled={isPending}
              >
                {t('backToTrips')}
              </Button>
              <Button
                type="submit"
                form="edit-trip-form"
                variant="primary"
                isDisabled={isPending}
              >
                {isPending ? t('editForm.saving') : t('editForm.save')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
