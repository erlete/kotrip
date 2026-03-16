/**
 * ### DurationUtils (TEST)
 *
 * Tests unitarios para las utilidades de parsing y manipulación de duraciones temporales.
 * Cubre todos los casos de uso incluyendo:
 * - Parsing de formatos válidos (ms, s, m, h, d, w)
 * - Manejo de errores para formatos inválidos
 * - Conversiones a diferentes unidades
 * - Cálculo de fechas de expiración
 * - Validación de formatos
 *
 * @version     1.0.0
 * @author      Kotrip
 * @copyright   2025, Kotrip
 */

import {
  durationToMs,
  durationToSeconds,
  getExpirationDate,
  isValidDuration,
  ParsedDuration,
  parseDuration,
} from './duration.utils';

describe('DurationUtils', () => {
  describe('parseDuration', () => {
    describe('formatos válidos', () => {
      it('debería parsear milisegundos correctamente', () => {
        const result: ParsedDuration = parseDuration('500ms');

        expect(result.value).toBe(500);
        expect(result.unit).toBe('ms');
        expect(result.milliseconds).toBe(500);
        expect(result.seconds).toBe(0);
      });

      it('debería parsear segundos correctamente', () => {
        const result: ParsedDuration = parseDuration('30s');

        expect(result.value).toBe(30);
        expect(result.unit).toBe('s');
        expect(result.milliseconds).toBe(30000);
        expect(result.seconds).toBe(30);
      });

      it('debería parsear minutos correctamente', () => {
        const result: ParsedDuration = parseDuration('15m');

        expect(result.value).toBe(15);
        expect(result.unit).toBe('m');
        expect(result.milliseconds).toBe(15 * 60 * 1000);
        expect(result.seconds).toBe(15 * 60);
      });

      it('debería parsear horas correctamente', () => {
        const result: ParsedDuration = parseDuration('2h');

        expect(result.value).toBe(2);
        expect(result.unit).toBe('h');
        expect(result.milliseconds).toBe(2 * 60 * 60 * 1000);
        expect(result.seconds).toBe(2 * 60 * 60);
      });

      it('debería parsear días correctamente', () => {
        const result: ParsedDuration = parseDuration('30d');

        expect(result.value).toBe(30);
        expect(result.unit).toBe('d');
        expect(result.milliseconds).toBe(30 * 24 * 60 * 60 * 1000);
        expect(result.seconds).toBe(30 * 24 * 60 * 60);
      });

      it('debería parsear semanas correctamente', () => {
        const result: ParsedDuration = parseDuration('1w');

        expect(result.value).toBe(1);
        expect(result.unit).toBe('w');
        expect(result.milliseconds).toBe(7 * 24 * 60 * 60 * 1000);
        expect(result.seconds).toBe(7 * 24 * 60 * 60);
      });

      it('debería manejar valores decimales', () => {
        const result: ParsedDuration = parseDuration('1.5h');

        expect(result.value).toBe(1.5);
        expect(result.unit).toBe('h');
        expect(result.milliseconds).toBe(1.5 * 60 * 60 * 1000);
      });

      it('debería ignorar mayúsculas/minúsculas', () => {
        const result: ParsedDuration = parseDuration('15M');

        expect(result.unit).toBe('m');
        expect(result.milliseconds).toBe(15 * 60 * 1000);
      });

      it('debería ignorar espacios al inicio y final', () => {
        const result: ParsedDuration = parseDuration('  15m  ');

        expect(result.value).toBe(15);
        expect(result.milliseconds).toBe(15 * 60 * 1000);
      });
    });

    describe('formatos inválidos', () => {
      it('debería lanzar error para formato sin unidad', () => {
        expect(() => parseDuration('15')).toThrow(
          'Formato de duración inválido',
        );
      });

      it('debería lanzar error para unidad no soportada', () => {
        expect(() => parseDuration('15x')).toThrow(
          'Formato de duración inválido',
        );
      });

      it('debería lanzar error para string vacío', () => {
        expect(() => parseDuration('')).toThrow('Formato de duración inválido');
      });

      it('debería lanzar error para formato con solo unidad', () => {
        expect(() => parseDuration('m')).toThrow(
          'Formato de duración inválido',
        );
      });

      it('debería lanzar error para valores negativos', () => {
        expect(() => parseDuration('-15m')).toThrow(
          'Formato de duración inválido',
        );
      });

      it('debería lanzar error para texto sin números', () => {
        expect(() => parseDuration('abc')).toThrow(
          'Formato de duración inválido',
        );
      });

      it('debería lanzar error para formato con espacios internos', () => {
        expect(() => parseDuration('15 m')).toThrow(
          'Formato de duración inválido',
        );
      });
    });
  });

  describe('durationToMs', () => {
    it('debería convertir minutos a milisegundos', () => {
      expect(durationToMs('15m')).toBe(15 * 60 * 1000);
    });

    it('debería convertir horas a milisegundos', () => {
      expect(durationToMs('1h')).toBe(60 * 60 * 1000);
    });

    it('debería convertir días a milisegundos', () => {
      expect(durationToMs('30d')).toBe(30 * 24 * 60 * 60 * 1000);
    });

    it('debería convertir semanas a milisegundos', () => {
      expect(durationToMs('2w')).toBe(2 * 7 * 24 * 60 * 60 * 1000);
    });

    it('debería lanzar error para formato inválido', () => {
      expect(() => durationToMs('invalid')).toThrow();
    });
  });

  describe('durationToSeconds', () => {
    it('debería convertir minutos a segundos', () => {
      expect(durationToSeconds('15m')).toBe(15 * 60);
    });

    it('debería convertir horas a segundos', () => {
      expect(durationToSeconds('2h')).toBe(2 * 60 * 60);
    });

    it('debería convertir días a segundos', () => {
      expect(durationToSeconds('7d')).toBe(7 * 24 * 60 * 60);
    });

    it('debería convertir semanas a segundos', () => {
      expect(durationToSeconds('1w')).toBe(7 * 24 * 60 * 60);
    });

    it('debería redondear milisegundos a segundos', () => {
      expect(durationToSeconds('500ms')).toBe(0);
      expect(durationToSeconds('1500ms')).toBe(1);
    });

    it('debería lanzar error para formato inválido', () => {
      expect(() => durationToSeconds('xyz')).toThrow();
    });
  });

  describe('getExpirationDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T10:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debería calcular fecha de expiración para minutos', () => {
      const result = getExpirationDate('15m');
      const expected = new Date('2025-01-15T10:15:00.000Z');

      expect(result.getTime()).toBe(expected.getTime());
    });

    it('debería calcular fecha de expiración para horas', () => {
      const result = getExpirationDate('2h');
      const expected = new Date('2025-01-15T12:00:00.000Z');

      expect(result.getTime()).toBe(expected.getTime());
    });

    it('debería calcular fecha de expiración para días', () => {
      const result = getExpirationDate('30d');
      const expected = new Date('2025-02-14T10:00:00.000Z');

      expect(result.getTime()).toBe(expected.getTime());
    });

    it('debería calcular fecha de expiración para semanas', () => {
      const result = getExpirationDate('1w');
      const expected = new Date('2025-01-22T10:00:00.000Z');

      expect(result.getTime()).toBe(expected.getTime());
    });

    it('debería devolver un objeto Date válido', () => {
      const result = getExpirationDate('5m');

      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result.getTime())).toBe(false);
    });
  });

  describe('isValidDuration', () => {
    describe('formatos válidos', () => {
      it('debería retornar true para milisegundos', () => {
        expect(isValidDuration('100ms')).toBe(true);
      });

      it('debería retornar true para segundos', () => {
        expect(isValidDuration('60s')).toBe(true);
      });

      it('debería retornar true para minutos', () => {
        expect(isValidDuration('15m')).toBe(true);
      });

      it('debería retornar true para horas', () => {
        expect(isValidDuration('24h')).toBe(true);
      });

      it('debería retornar true para días', () => {
        expect(isValidDuration('30d')).toBe(true);
      });

      it('debería retornar true para semanas', () => {
        expect(isValidDuration('4w')).toBe(true);
      });

      it('debería retornar true para valores decimales', () => {
        expect(isValidDuration('1.5h')).toBe(true);
      });
    });

    describe('formatos inválidos', () => {
      it('debería retornar false para string vacío', () => {
        expect(isValidDuration('')).toBe(false);
      });

      it('debería retornar false para solo números', () => {
        expect(isValidDuration('15')).toBe(false);
      });

      it('debería retornar false para unidades no soportadas', () => {
        expect(isValidDuration('15y')).toBe(false);
      });

      it('debería retornar false para texto aleatorio', () => {
        expect(isValidDuration('abc')).toBe(false);
      });

      it('debería retornar false para valores negativos', () => {
        expect(isValidDuration('-5m')).toBe(false);
      });

      it('debería retornar false para formato con espacios', () => {
        expect(isValidDuration('5 m')).toBe(false);
      });
    });
  });

  describe('casos de uso reales', () => {
    it('debería manejar configuración típica de JWT access token (15m)', () => {
      const duration = '15m';
      const ms = durationToMs(duration);
      const seconds = durationToSeconds(duration);

      expect(ms).toBe(900000);
      expect(seconds).toBe(900);
    });

    it('debería manejar configuración típica de JWT refresh token (30d)', () => {
      const duration = '30d';
      const ms = durationToMs(duration);
      const seconds = durationToSeconds(duration);

      expect(ms).toBe(2592000000);
      expect(seconds).toBe(2592000);
    });

    it('debería manejar configuración típica de OTP expiration (5m)', () => {
      const duration = '5m';
      const ms = durationToMs(duration);
      const seconds = durationToSeconds(duration);

      expect(ms).toBe(300000);
      expect(seconds).toBe(300);
    });

    it('debería manejar configuración típica de invite expiration (7d)', () => {
      const duration = '7d';
      const ms = durationToMs(duration);
      const seconds = durationToSeconds(duration);

      expect(ms).toBe(604800000);
      expect(seconds).toBe(604800);
    });
  });
});
