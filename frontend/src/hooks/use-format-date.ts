/**
 * @file use-format-date.ts
 * @description
 * -----------------------------------------------------
 * Utilidades para formatear la fecha
 * -----------------------------------------------------
 * @version 0.0.1a
 * @created 2025-03-11
 * @modified 2025-06-25




 * */

'use client';

import {
  DateTimeFormatOptions,
  useFormatter,
  useTranslations,
} from 'next-intl';
import { useCallback } from 'react';

/**
 * Opciones de formato para fechas (dd/mm/yyyy).
 */
const dateFormatOptions: DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

/**
 * Opciones de formato para horas (24h con zona horaria).
 */
const timeFormatOptions: DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZoneName: 'short',
};

/**
 * Opciones de formato para fechas largas (ej: "1 de febrero de 2026").
 */
const longDateFormatOptions: DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

/**
 * Opciones de formato para horas sin segundos (ej: "14:30").
 */
const shortTimeFormatOptions: DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

/**
 * Hook que devuelve un callback para formatear fecha + hora.
 *
 * @returns Función que formatea fecha y hora con opciones opcionales.
 *
 * @example
 * const formatDateTime = useFormatDateTime();
 * const formatted = formatDateTime('2025-01-10T12:34:56Z');
 * // "10/01/2025 13:34:56 GMT+1" (según locale)
 */
export function useFormatDateTime() {
  const format = useFormatter();

  return useCallback(
    (
      isoDate: string | Date,
      options?: {
        date?: DateTimeFormatOptions;
        time?: DateTimeFormatOptions;
      },
    ): string => {
      const dateTime = new Date(isoDate);

      const formattedDate = format.dateTime(
        dateTime,
        options?.date || dateFormatOptions,
      );
      const formattedTime = format.dateTime(
        dateTime,
        options?.time || timeFormatOptions,
      );

      return `${formattedDate} ${formattedTime}`;
    },
    [format],
  );
}

/**
 * Hook que devuelve un callback para formatear solo la fecha.
 *
 * @returns Función que formatea la fecha.
 *
 * @example
 * const formatDate = useFormatDate();
 * const formatted = formatDate('2025-01-10T12:34:56Z');
 * // "10/01/2025" (según locale)
 */
export function useFormatDate() {
  const format = useFormatter();

  return useCallback(
    (isoDate: string): string => {
      const dateTime = new Date(isoDate);

      return format.dateTime(dateTime, dateFormatOptions);
    },
    [format],
  );
}

/**
 * Hook que devuelve un callback para formatear fecha + hora en formato largo.
 *
 * Formato resultante: "1 de febrero de 2026 a las 14:30"
 *
 * @returns Función que formatea fecha y hora en formato largo y legible.
 *
 * @example
 * const formatLongDateTime = useFormatLongDateTime();
 * const formatted = formatLongDateTime('2026-02-01T00:00:00.000Z');
 * // "1 de febrero de 2026 a las 00:00"
 */
export function useFormatLongDateTime() {
  const format = useFormatter();
  const t = useTranslations('Date');

  return useCallback(
    (isoDate: string | Date | null | undefined): string => {
      if (!isoDate) return '';

      const dateTime = new Date(isoDate);

      if (isNaN(dateTime.getTime())) return '';

      const formattedDate = format.dateTime(dateTime, longDateFormatOptions);
      const formattedTime = format.dateTime(dateTime, shortTimeFormatOptions);

      return t('longDateTime', { date: formattedDate, time: formattedTime });
    },
    [format, t],
  );
}

/**
 * Hook que devuelve un callback para formatear solo la fecha en formato largo.
 *
 * Formato resultante: "1 de febrero de 2026"
 *
 * @returns Función que formatea la fecha en formato largo y legible.
 *
 * @example
 * const formatLongDate = useFormatLongDate();
 * const formatted = formatLongDate('2026-02-01T00:00:00.000Z');
 * // "1 de febrero de 2026"
 */
export function useFormatLongDate() {
  const format = useFormatter();

  return useCallback(
    (isoDate: string | Date | null | undefined): string => {
      if (!isoDate) return '';

      const dateTime = new Date(isoDate);

      if (isNaN(dateTime.getTime())) return '';

      return format.dateTime(dateTime, longDateFormatOptions);
    },
    [format],
  );
}

/**
 * Hook que devuelve un callback para formatear solo la hora.
 *
 * @returns Función que formatea la hora con opciones opcionales.
 *
 * @example
 * const formatTime = useFormatTime();
 * const formatted = formatTime('2025-01-10T12:34:56Z');
 * // "13:34:56" (según locale)
 */
export function useFormatTime() {
  const format = useFormatter();

  return useCallback(
    (isoDate: string, options?: DateTimeFormatOptions): string => {
      const dateTime = new Date(isoDate);

      return format.dateTime(dateTime, options || timeFormatOptions);
    },
    [format],
  );
}

/**
 * Hook que devuelve un callback para formatear tiempo relativo.
 *
 * @returns Función que formatea el tiempo relativo.
 *
 * @example
 * const formatRelative = useFormatRelativeTime();
 * const label = formatRelative(Date.now() - 60_000);
 * // "hace 1 minuto" (según locale)
 */
export function useFormatRelativeTime() {
  const format = useFormatter();

  return useCallback(
    (isoDate: number | string): string => {
      const dateTime = new Date(isoDate);

      return format.relativeTime(dateTime, {
        // unit: ''
      });
    },
    [format],
  );
}

/**
 * Hook que devuelve un callback para formatear una duración.
 *
 * @returns Función que formatea una duración en milisegundos.
 *
 * @example
 * const formatDuration = useFormatDuration();
 * const label = formatDuration(90_000);
 * // "1 minuto 30 segundos" (según locale)
 */
export function useFormatDuration() {
  const format = useFormatter();

  return useCallback(
    (durationInMilliseconds: number): string => {
      if (durationInMilliseconds === 0)
        return format.number(0, { style: 'unit', unit: 'second' });

      // Time constants in milliseconds
      const MS_IN_SECOND = 1000;
      const MS_IN_MINUTE = 60 * MS_IN_SECOND;
      const MS_IN_HOUR = 60 * MS_IN_MINUTE;
      const MS_IN_DAY = 24 * MS_IN_HOUR;
      const MS_IN_WEEK = 7 * MS_IN_DAY;
      const MS_IN_MONTH = 30 * MS_IN_DAY; // Approximation
      const MS_IN_YEAR = 365 * MS_IN_DAY; // Approximation

      // Calculate time components
      const years = Math.floor(durationInMilliseconds / MS_IN_YEAR);
      const remainingAfterYears = durationInMilliseconds % MS_IN_YEAR;

      const months = Math.floor(remainingAfterYears / MS_IN_MONTH);
      const remainingAfterMonths = remainingAfterYears % MS_IN_MONTH;

      const weeks = Math.floor(remainingAfterMonths / MS_IN_WEEK);
      const remainingAfterWeeks = remainingAfterMonths % MS_IN_WEEK;

      const days = Math.floor(remainingAfterWeeks / MS_IN_DAY);
      const remainingAfterDays = remainingAfterWeeks % MS_IN_DAY;

      const hours = Math.floor(remainingAfterDays / MS_IN_HOUR);
      const remainingAfterHours = remainingAfterDays % MS_IN_HOUR;

      const minutes = Math.floor(remainingAfterHours / MS_IN_MINUTE);
      const remainingAfterMinutes = remainingAfterHours % MS_IN_MINUTE;

      // Calculate seconds with millisecond precision
      const secondsWithMs = remainingAfterMinutes / MS_IN_SECOND;

      const parts: string[] = [];

      // Add each non-zero time component
      if (years > 0) {
        parts.push(format.number(years, { style: 'unit', unit: 'year' }));
      }

      if (months > 0) {
        parts.push(format.number(months, { style: 'unit', unit: 'month' }));
      }

      if (weeks > 0) {
        parts.push(format.number(weeks, { style: 'unit', unit: 'week' }));
      }

      if (days > 0) {
        parts.push(format.number(days, { style: 'unit', unit: 'day' }));
      }

      if (hours > 0) {
        parts.push(format.number(hours, { style: 'unit', unit: 'hour' }));
      }

      if (minutes > 0) {
        parts.push(format.number(minutes, { style: 'unit', unit: 'minute' }));
      }

      // If we have seconds (potentially with milliseconds)
      // Only add seconds if they're > 0 OR if no other parts exist (to avoid empty result)
      if (secondsWithMs > 0 || parts.length === 0) {
        const hasDecimalPart = secondsWithMs % 1 !== 0;
        const showDecimals = parts.length === 0 && hasDecimalPart;

        if (showDecimals) {
          // Format with 3 decimal places when seconds is the only unit and milliseconds exist
          parts.push(`${secondsWithMs.toFixed(3)} s`);
        } else if (secondsWithMs > 0) {
          // Only show whole seconds if they're greater than 0
          parts.push(
            format.number(Math.floor(secondsWithMs), {
              style: 'unit',
              unit: 'second',
            }),
          );
        } else if (parts.length === 0) {
          // If no other parts and seconds = 0, show "0 seconds"
          parts.push(format.number(0, { style: 'unit', unit: 'second' }));
        }
      }

      return parts.join(' ');
    },
    [format],
  );
}
