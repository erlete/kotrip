/**
 * Tests unitarios para el guard de renovacion de tokens JWT (RefreshGuard).
 * Cubre:
 * - Validación de tokens de refresco válidos
 * - Manejo de tokens inválidos/expirados
 * - Extracción de tokens con tipo Refresh
 * - Manejo de errores
 *
 * @version     1.0.0
 * @author      Kotrip
 * @copyright   2025, Kotrip
 */

import { ErrorManager } from '@/common/error-handling/error.manager';
import { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { Language, Role, UserStatus } from '@kotrip/data';
import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { RefreshGuard } from './refresh.guard';

describe('RefreshGuard', () => {
  let guard: RefreshGuard;
  let jwtService: JwtService;
  let configService: ConfigService;
  let i18nService: I18nService;

  const mockUser: UserActiveInterface = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'test@test.com',
    firstName: 'Test',
    status: UserStatus.APPROVED,
    lastName: 'User',
    role: Role.USER,
    language: Language.ES,
    validated: true,
    twoFactorEnabled: false,
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('test-refresh-secret'),
  };

  const mockI18nService = {
    t: jest.fn((key: string) => key),
  };

  const createMockExecutionContext = (
    token?: string,
    tokenType: string = 'Refresh',
  ): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: token ? `${tokenType} ${token}` : undefined,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    guard = module.get<RefreshGuard>(RefreshGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    i18nService = module.get<I18nService>(I18nService);
  });

  it('debería estar definido', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('debería permitir acceso con token de refresco válido', async () => {
      const mockContext = createMockExecutionContext('valid-refresh-token');
      mockJwtService.verifyAsync.mockResolvedValue(mockUser);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-refresh-token',
        {
          secret: 'test-refresh-secret',
        },
      );
    });

    it('debería agregar el usuario al request', async () => {
      const mockRequest = {
        headers: { authorization: 'Refresh valid-token' },
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      mockJwtService.verifyAsync.mockResolvedValue(mockUser);

      await guard.canActivate(mockContext);

      expect((mockRequest as any).user).toEqual(mockUser);
    });

    it('debería lanzar ErrorManager si no hay token', async () => {
      const mockContext = createMockExecutionContext(undefined);

      await expect(guard.canActivate(mockContext)).rejects.toThrow();
      expect(mockI18nService.t).toHaveBeenCalledWith(
        'error.AUTH.UNAUTHORIZED_USER',
      );
    });

    it('debería lanzar error si el token es inválido', async () => {
      const mockContext = createMockExecutionContext('invalid-token');
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });

    it('debería lanzar error si el token está expirado', async () => {
      const mockContext = createMockExecutionContext('expired-token');
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });

    it('debería rechazar tokens con tipo Bearer', async () => {
      const mockContext = createMockExecutionContext('valid-token', 'Bearer');

      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });

    it('debería rechazar tokens con tipo Basic', async () => {
      const mockContext = createMockExecutionContext('valid-token', 'Basic');

      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('debería extraer token de header Refresh válido', async () => {
      const mockRequest = {
        headers: { authorization: 'Refresh my-refresh-token-123' },
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      mockJwtService.verifyAsync.mockResolvedValue(mockUser);

      await guard.canActivate(mockContext);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'my-refresh-token-123',
        expect.any(Object),
      );
    });

    it('debería lanzar error si no hay header Authorization', async () => {
      const mockRequest = {
        headers: {},
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });

    it('debería lanzar error si el tipo no es Refresh', async () => {
      const mockContext = createMockExecutionContext('token', 'Bearer');

      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });
  });

  describe('configuración JWT', () => {
    it('debería obtener JWT_REFRESH_SECRET del configService', () => {
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'JWT_REFRESH_SECRET',
      );
    });

    it('debería usar el secret de refresco correcto para verificar tokens', async () => {
      const mockContext = createMockExecutionContext('valid-token');
      mockJwtService.verifyAsync.mockResolvedValue(mockUser);

      await guard.canActivate(mockContext);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'test-refresh-secret',
      });
    });
  });

  describe('manejo de ErrorManager', () => {
    it('debería propagar ErrorManager existente', async () => {
      const mockContext = createMockExecutionContext('valid-token');
      const errorManager = new ErrorManager('UNAUTHORIZED', 'Custom error');
      mockJwtService.verifyAsync.mockRejectedValue(errorManager);

      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });

    it('debería convertir errores genéricos en ErrorManager', async () => {
      const mockContext = createMockExecutionContext('valid-token');
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Generic error'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });
  });
});
