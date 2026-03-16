/**
 * Tests unitarios para el guard de autenticacion JWT (AuthGuard).
 * Cubre:
 * - Validación de tokens válidos
 * - Manejo de tokens inválidos/expirados
 * - Extracción de tokens del header
 * - Validación de estado 2FA del usuario
 *
 * @version     1.0.0
 * @author      Kotrip
 * @copyright   2025, Kotrip
 */

import { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { Language, Role, UserStatus } from '@kotrip/data';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

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
    getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
  };

  const createMockExecutionContext = (
    token?: string,
    url: string = '/api/test',
  ): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: token ? `Bearer ${token}` : undefined,
      },
      url,
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
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('debería estar definido', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('debería permitir acceso con token válido y usuario validado', async () => {
      const mockContext = createMockExecutionContext('valid-token');
      mockJwtService.verifyAsync.mockResolvedValue(mockUser);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'test-jwt-secret',
      });
    });

    it('debería agregar el usuario al request', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer valid-token' },
        url: '/api/test',
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

    it('debería lanzar UnauthorizedException si no hay token', async () => {
      const mockContext = createMockExecutionContext(undefined);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debería lanzar UnauthorizedException si el token es inválido', async () => {
      const mockContext = createMockExecutionContext('invalid-token');
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debería lanzar UnauthorizedException si el usuario no está validado', async () => {
      const unvalidatedUser: UserActiveInterface = {
        ...mockUser,
        validated: false,
      };
      const mockContext = createMockExecutionContext(
        'valid-token',
        '/api/protected',
      );
      mockJwtService.verifyAsync.mockResolvedValue(unvalidatedUser);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debería permitir acceso a /auth/verify-otp aunque el usuario no esté validado', async () => {
      const unvalidatedUser: UserActiveInterface = {
        ...mockUser,
        validated: false,
      };
      const mockContext = createMockExecutionContext(
        'valid-token',
        '/auth/verify-otp',
      );
      mockJwtService.verifyAsync.mockResolvedValue(unvalidatedUser);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('debería extraer token de header Bearer válido', () => {
      const mockRequest = {
        headers: { authorization: 'Bearer my-token-123' },
      } as any;

      const token = AuthGuard.extractTokenFromHeader(mockRequest);

      expect(token).toBe('my-token-123');
    });

    it('debería retornar undefined si no hay header Authorization', () => {
      const mockRequest = {
        headers: {},
      } as any;

      const token = AuthGuard.extractTokenFromHeader(mockRequest);

      expect(token).toBeUndefined();
    });

    it('debería retornar undefined si el tipo no es Bearer', () => {
      const mockRequest = {
        headers: { authorization: 'Basic my-token-123' },
      } as any;

      const token = AuthGuard.extractTokenFromHeader(mockRequest);

      expect(token).toBeUndefined();
    });

    it('debería retornar undefined si el header está malformado', () => {
      const mockRequest = {
        headers: { authorization: 'Bearer' },
      } as any;

      const token = AuthGuard.extractTokenFromHeader(mockRequest);

      expect(token).toBeUndefined();
    });
  });

  describe('configuración JWT', () => {
    it('debería obtener JWT_SECRET del configService', () => {
      expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('debería usar el secret correcto para verificar tokens', async () => {
      const mockContext = createMockExecutionContext('valid-token');
      mockJwtService.verifyAsync.mockResolvedValue(mockUser);

      await guard.canActivate(mockContext);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'test-jwt-secret',
      });
    });
  });
});
