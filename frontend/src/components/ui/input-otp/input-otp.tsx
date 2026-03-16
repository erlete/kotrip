'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OTPPattern = RegExp | 'digits' | 'alphanumeric' | 'letters';

export interface InputOTPProps {
  /** Número máximo de slots del OTP */
  maxLength?: number;
  /** Si el input es requerido */
  required?: boolean;
  /** Valor controlado */
  value?: string;
  /** Callback onChange controlado */
  onChange?: (value: string) => void;
  /** Se ejecuta cuando todos los slots están llenos */
  onComplete?: (value: string) => void;
  /** Se ejecuta solo cuando una acción de pegado completa todos los slots */
  onAutoSend?: (value: string) => void;
  /** Patrón para validar cada caracter */
  pattern?: OTPPattern;
  /** Marcar como inválido (modo no controlado) */
  invalid?: boolean;
  /**
   * Cuando es false (por defecto), el foco está bloqueado en orden secuencial,
   * el usuario no puede hacer clic o navegar a un slot hasta que todos los
   * anteriores estén llenos. Establecer true permite la navegación libre
   * entre slots.
   */
  allowFreeNavigation?: boolean;
  /** Variante visual del input OTP */
  variant?: 'joined' | 'separated';
  /** Clase extra para el elemento raíz */
  className?: string;
  /** Children: OTPGroup, FakeDash */
  children: React.ReactNode;
}

interface OTPContextValue {
  slots: string[];
  focusedIndex: number | null;
  invalid: boolean;
  maxLength: number;
  pattern: RegExp;
  required: boolean;
  allowFreeNavigation: boolean;
  variant: 'joined' | 'separated';
  registerRef: (index: number, el: HTMLInputElement | null) => void;
  handleSlotChange: (index: number, char: string) => void;
  handleSlotKeyDown: (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  handleSlotPaste: (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => void;
  handleSlotFocus: (index: number) => void;
  handleSlotBlur: () => void;
  registerSlot: (index: number) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const OTPContext = createContext<OTPContextValue | null>(null);

function useOTPContext() {
  const ctx = useContext(OTPContext);
  if (!ctx)
    throw new Error('OTP sub-components must be used inside <InputOTP>');
  return ctx;
}

// ─── Pattern helpers ──────────────────────────────────────────────────────────

function resolvePattern(pattern: OTPPattern): RegExp {
  if (pattern instanceof RegExp) return pattern;
  switch (pattern) {
    case 'digits':
      return /^\d$/;
    case 'letters':
      return /^[a-zA-Z]$/;
    case 'alphanumeric':
      return /^[a-zA-Z0-9]$/;
    default:
      return /^\d$/;
  }
}

function filterByPattern(str: string, pattern: RegExp): string {
  return str
    .split('')
    .filter((ch) => pattern.test(ch))
    .join('');
}

// ─── isMac ────────────────────────────────────────────────────────────────────

const isMac = () =>
  typeof navigator !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

// ─── Root Component ───────────────────────────────────────────────────────────

/**
 * Componente raíz del input OTP.
 *
 * Proporciona el contexto compartido para todos los sub-componentes
 * (OTPGroup, OTPSlot, FakeDash) y gestiona el estado de los slots,
 * la validación y la navegación entre ellos.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del input OTP.
 */
export function InputOTP({
  maxLength = 6,
  required = true,
  value,
  onChange,
  onComplete,
  onAutoSend,
  pattern = 'digits',
  invalid: invalidProp = false,
  allowFreeNavigation = false,
  variant = 'joined',
  className,
  children,
}: InputOTPProps) {
  const tAria = useTranslations('Aria.InputOtp');
  const isControlled = value !== undefined;
  const resolvedPattern = useMemo(() => resolvePattern(pattern), [pattern]);

  // Slot state (uncontrolled)
  const [internalSlots, setInternalSlots] = useState<string[]>(() =>
    Array(maxLength).fill(''),
  );
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  // internalInvalid tracks validation errors raised internally (e.g. wrong char)
  const [internalInvalid, setInternalInvalid] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const slotCount = useRef(0);
  // True while the component itself is moving focus programmatically.
  // Prevents handleSlotFocus from re-intercepting its own focusSlot calls.
  const isProgrammaticFocus = useRef(false);

  // Derive invalid from prop OR internal state - no setState inside an effect
  const invalid = invalidProp || internalInvalid;

  // Side-effect only: focus slot 0 when prop flips to invalid
  useLayoutEffect(() => {
    if (invalidProp) {
      inputRefs.current[0]?.focus();
    }
  }, [invalidProp]);

  // Derive slots from controlled value
  const slots: string[] = useMemo(() => {
    if (isControlled && value !== undefined) {
      return Array.from({ length: maxLength }, (_, i) => {
        const ch = value[i];
        return ch === ' ' ? '' : (ch ?? '');
      });
    }
    return internalSlots;
  }, [isControlled, value, maxLength, internalSlots]);

  const setSlots = useCallback(
    (next: string[]) => {
      const serialized = next.map((s) => s || ' ').join('');

      if (isControlled) {
        onChange?.(serialized);
      } else {
        setInternalSlots(next);
        onChange?.(serialized);
      }
    },
    [isControlled, onChange],
  );

  const focusSlot = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, slotCount.current - 1));

    isProgrammaticFocus.current = true;

    requestAnimationFrame(() => {
      inputRefs.current[clamped]?.focus();
    });
  }, []);

  useLayoutEffect(() => {
    const allEmpty = slots.every((s) => s === '');

    if (allEmpty) {
      requestAnimationFrame(() => {
        focusSlot(0);
      });
    }
  }, [slots, focusSlot]);

  // Register slot count
  const registerSlot = useCallback((index: number) => {
    slotCount.current = Math.max(slotCount.current, index + 1);
  }, []);

  // Check completion and trigger optional auto-send on paste only.
  const checkComplete = useCallback(
    (nextSlots: string[], source: 'input' | 'paste') => {
      const full = nextSlots.every((s) => s !== '');
      if (full) {
        const joined = nextSlots.join('');
        onComplete?.(joined);
        if (source === 'paste') {
          // Defer autosend until the next frame so pasted values are already
          // reflected in the DOM/state before form submission runs.
          requestAnimationFrame(() => {
            onAutoSend?.(joined);
          });
        }
      }
    },
    [onAutoSend, onComplete],
  );

  // Slot handlers
  const handleSlotChange = useCallback(
    (index: number, char: string) => {
      if (!resolvedPattern.test(char)) return;
      const next = [...slots];
      next[index] = char;
      setSlots(next);
      setInternalInvalid(false);
      if (index < maxLength - 1) {
        focusSlot(index + 1);
      }
      checkComplete(next, 'input');
    },
    [slots, maxLength, resolvedPattern, setSlots, focusSlot, checkComplete],
  );

  const handleSlotKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      const mac = isMac();
      const clearAll =
        (mac && e.metaKey && e.key === 'Backspace') ||
        (!mac && e.ctrlKey && e.key === 'Backspace');

      if (clearAll) {
        e.preventDefault();
        const next = Array(maxLength).fill('');
        setSlots(next);
        focusSlot(0);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();

        const next = [...slots];
        const activeIndex = focusedIndex ?? index;

        // Si el slot actual tiene valor, lo borramos
        if (next[activeIndex] !== '') {
          next[activeIndex] = '';
          setSlots(next);
          // Mantenemos el foco en el mismo índice
          focusSlot(activeIndex);
          return;
        }

        // Si el slot actual está vacío, movemos el foco al anterior
        // PERO sin borrar su contenido
        if (activeIndex > 0) {
          focusSlot(activeIndex - 1);
        }

        return;
      }

      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        focusSlot(index - 1);
        return;
      }
      if (e.key === 'ArrowRight' && index < maxLength - 1) {
        e.preventDefault();
        if (allowFreeNavigation) {
          focusSlot(index + 1);
        } else {
          if (slots[index] !== '') {
            focusSlot(index + 1);
          }
        }
        return;
      }
    },
    [slots, maxLength, setSlots, focusSlot, allowFreeNavigation, focusedIndex],
  );

  const handleSlotPaste = useCallback(
    (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const raw = e.clipboardData.getData('text');
      const filtered = filterByPattern(raw, resolvedPattern);
      if (!filtered) return;

      const trimmed = filtered.slice(0, maxLength);
      const next = [...slots];
      for (let i = 0; i < trimmed.length; i++) {
        if (index + i < maxLength) {
          next[index + i] = trimmed[i];
        }
      }
      setSlots(next);
      setInternalInvalid(false);

      const nextIndex = Math.min(index + trimmed.length, maxLength - 1);
      focusSlot(nextIndex);

      checkComplete(next, 'paste');
    },
    [slots, maxLength, resolvedPattern, setSlots, focusSlot, checkComplete],
  );

  const handleSlotFocus = useCallback(
    (index: number) => {
      // Programmatic focus (auto-advance, backspace, paste) - always allow.
      if (isProgrammaticFocus.current) {
        isProgrammaticFocus.current = false;
        setFocusedIndex(index);
        return;
      }

      if (!allowFreeNavigation) {
        const firstEmpty = slots.findIndex((s) => s === '');
        const target = firstEmpty === -1 ? maxLength - 1 : firstEmpty;

        // Solo bloquear si intenta saltar sobre slots vacíos
        if (index > target && slots[index] === '') {
          focusSlot(target);
          return;
        }
      }
      setFocusedIndex(index);
    },
    [allowFreeNavigation, slots, maxLength, focusSlot],
  );

  const handleSlotBlur = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  // Stable callback so OTPSlot can register its DOM node without
  // directly mutating the ref (which the linter forbids on hook returns).
  const registerRef = useCallback(
    (index: number, el: HTMLInputElement | null) => {
      inputRefs.current[index] = el;
    },
    [],
  );

  const contextValue: OTPContextValue = {
    slots,
    focusedIndex,
    invalid,
    maxLength,
    pattern: resolvedPattern,
    required,
    allowFreeNavigation,
    variant,
    registerRef,
    handleSlotChange,
    handleSlotKeyDown,
    handleSlotPaste,
    handleSlotFocus,
    handleSlotBlur,
    registerSlot,
  };

  return (
    <OTPContext.Provider value={contextValue}>
      <div
        data-variant={variant}
        className={clsx(
          'inline-flex items-center gap-2',
          invalid &&
            '[&_.otp-slot]:border-[var(--error-500)] [&_.otp-slot]:shadow-[0_0_0_3px_var(--error-50),inset_0_1px_0_rgba(255,255,255,0.04)] [&_.otp-slot]:animate-[shake_0.38s_cubic-bezier(0.36,0.07,0.19,0.97)_both]',
          className,
        )}
        role="group"
        aria-label={tAria('otpInput')}
      >
        {children}
      </div>
    </OTPContext.Provider>
  );
}

// ─── OTPGroup ─────────────────────────────────────────────────────────────────

export interface OTPGroupProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Contenedor de grupo para los slots del OTP.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del grupo OTP.
 */
export function OTPGroup({ children, className }: OTPGroupProps) {
  const { variant } = useOTPContext();

  return (
    <div
      className={clsx(
        'inline-flex items-center',
        variant === 'separated' && 'gap-1.5',
        variant === 'joined' && 'gap-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── OTPSlot ──────────────────────────────────────────────────────────────────

export interface OTPSlotProps {
  /** Índice de base cero del slot */
  index: number;
  className?: string;
}

/**
 * Slot individual del input OTP.
 *
 * Cada slot representa un caracter del código OTP y gestiona su propio
 * input, validación visual y estados de foco.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del slot OTP.
 */
export function OTPSlot({ index, className }: OTPSlotProps) {
  const tAria = useTranslations('Aria.InputOtp');
  const {
    slots,
    focusedIndex,
    invalid,
    required,
    pattern,
    variant,
    registerRef,
    handleSlotChange,
    handleSlotKeyDown,
    handleSlotPaste,
    handleSlotFocus,
    handleSlotBlur,
    registerSlot,
  } = useOTPContext();

  // Register this slot on mount
  useEffect(() => {
    registerSlot(index);
  }, [index, registerSlot]);

  const isFocused = focusedIndex === index;
  const hasValue = !!slots[index];

  return (
    <div
      className={clsx(
        'otp-slot relative flex items-center justify-center w-[3.25rem] h-[3.25rem] bg-[var(--bg-dark)] border-[1.5px] border-[var(--text-muted)] cursor-text overflow-hidden transition-all duration-[0.18s] ease-[cubic-bezier(0.4,0,0.2,1)]',
        // Variante separada: bordes redondeados normales
        variant === 'separated' && 'rounded-[var(--rounded-md)]',
        // Variante unida: sin bordes redondeados, bordes superpuestos
        variant === 'joined' && [
          'rounded-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
          'first:rounded-l-[var(--rounded-md)] last:rounded-r-[var(--rounded-md)]',
          '[&:not(:first-child)]:-ml-[1.5px]',
        ],
        // Estado hover (solo cuando no enfocado ni inválido)
        !isFocused && !invalid && 'hover:border-[var(--text-muted)]',
        // Estado enfocado
        isFocused && [
          'border-[var(--primary-500)] z-[1]',
          variant === 'separated' &&
            'shadow-[0_0_0_3px_var(--primary-350),inset_0_1px_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.4)] -translate-y-px',
          variant === 'joined' &&
            'shadow-[0_0_0_3px_var(--primary-350),inset_0_1px_0_rgba(255,255,255,0.06)] z-[2]',
        ],
        // Estado lleno (no enfocado, no inválido)
        hasValue &&
          !isFocused &&
          !invalid && [
            'border-[var(--primary-500)]',
            variant === 'separated' &&
              'shadow-[0_0_0_2px_var(--primary-350),inset_0_1px_0_rgba(255,255,255,0.05)]',
            variant === 'joined' &&
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_0_0_1px_var(--primary-500)]',
          ],
        // Estado inválido
        invalid &&
          'border-[var(--error-500)] shadow-[0_0_0_3px_var(--error-50),inset_0_1px_0_rgba(255,255,255,0.04)]',
        // Sombra base solo para variante separada
        variant === 'separated' &&
          !isFocused &&
          !hasValue &&
          !invalid &&
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_3px_rgba(0,0,0,0.4)]',
        className,
      )}
      aria-hidden="false"
    >
      <input
        ref={(el) => registerRef(index, el)}
        className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-center font-inherit text-2xl font-semibold text-[var(--text)] tracking-[0.02em] p-0 cursor-text caret-transparent selection:bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-inherit"
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={slots[index]}
        required={required && index === 0}
        aria-label={tAria('digit', { index: String(index + 1) })}
        autoComplete="one-time-code"
        onChange={(e) => {
          const val = e.target.value;

          if (!val) return;

          const char = val.slice(-1);

          if (pattern.test(char)) {
            handleSlotChange(index, char);
          }
        }}
        onKeyDown={(e) => handleSlotKeyDown(index, e)}
        onPaste={(e) => handleSlotPaste(index, e)}
        onFocus={() => handleSlotFocus(index)}
        onBlur={handleSlotBlur}
      />
      {isFocused && !hasValue && (
        <span
          className="absolute block w-[1.5px] h-[1.4rem] bg-[var(--primary-950)] rounded-[1px] pointer-events-none animate-[blink_1.1s_step-start_infinite]"
          aria-hidden
        />
      )}
    </div>
  );
}

// ─── FakeDash ─────────────────────────────────────────────────────────────────

export interface FakeDashProps {
  className?: string;
  /** Caracter visual, por defecto "–" */
  char?: string;
}

/**
 * Separador visual entre grupos de slots OTP.
 *
 * @param props - Props del componente.
 * @returns Elemento JSX del separador.
 */
export function FakeDash({ className, char = '–' }: FakeDashProps) {
  return (
    <span
      className={clsx(
        'flex items-center justify-center text-[var(--text-muted)] text-xl font-light leading-none select-none px-0.5',
        className,
      )}
      aria-hidden="true"
    >
      {char}
    </span>
  );
}
