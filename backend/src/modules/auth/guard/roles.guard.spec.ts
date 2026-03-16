/**
 * Tests unitarios para el guard de autorizacion basada en roles (RolesGuard).
 * Cubre:
 * - Acceso sin restricción de roles
 * - Verificación de roles requeridos
 * - Acceso ADMIN a cualquier recurso
 * - Manejo de errores
 *
 * @version     2.0.0
 * @author      Kotrip
 * @copyright   2025, Kotrip
 */

import { ErrorManager } from '@/common/error-handling/error.manager';
import { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { Language, Role, UserStatus } from '@kotrip/data';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
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

  const mockI18nService = {
    t: jest.fn((key: string) => key),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockExecutionContext = (
    user?: UserActiveInterface | null,
  ): ExecutionContext => {
    const mockRequest = {
      user: user ?? undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
    i18nService = module.get<I18nService>(I18nService);
  });

  it('debería estar definido', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    describe('sin restricción de roles', () => {
      it('debería permitir acceso si no hay roles definidos', () => {
        mockReflector.getAllAndOverride.mockReturnValue(undefined);
        const mockContext = createMockExecutionContext(mockUser);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('debería lanzar error si los roles son un array vacío', () => {
        mockReflector.getAllAndOverride.mockReturnValue([]);
        const mockContext = createMockExecutionContext(mockUser);

        // Con array vacío, some() devuelve false, por lo que el guard lanza error
        // ya que ningún rol coincide con los roles requeridos (vacíos)
        expect(() => guard.canActivate(mockContext)).toThrow();
      });
    });

    describe('verificación de roles', () => {
      it('debería permitir acceso si el usuario tiene el rol requerido', () => {
        mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);
        const mockContext = createMockExecutionContext(mockUser);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('debería permitir acceso si el usuario tiene uno de los roles requeridos', () => {
        mockReflector.getAllAndOverride.mockReturnValue([
          Role.USER,
          Role.ADMIN,
        ]);
        const mockContext = createMockExecutionContext(mockUser);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('debería lanzar error si el usuario no tiene el rol requerido', () => {
        mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
        const mockContext = createMockExecutionContext(mockUser);

        // USER no tiene ADMIN, pero el guard gives ADMIN bypass,
        // so this test needs a non-ADMIN user with a required role they don't have.
        // Actually, the guard checks user.role === Role.ADMIN first, then checks includes.
        // mockUser has Role.USER, required is [Role.ADMIN].
        // user.role !== Role.ADMIN, so it goes to the includes check.
        // USER doesn't include ADMIN, so it throws.
        expect(() => guard.canActivate(mockContext)).toThrow();
      });
    });

    describe('acceso ADMIN', () => {
      it('debería permitir acceso a ADMIN aunque no esté en los roles', () => {
        mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);
        const adminUser: UserActiveInterface = {
          ...mockUser,
          role: Role.ADMIN,
        };
        const mockContext = createMockExecutionContext(adminUser);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('debería permitir acceso a ADMIN a cualquier recurso', () => {
        mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);
        const adminUser: UserActiveInterface = {
          ...mockUser,
          role: Role.ADMIN,
        };
        const mockContext = createMockExecutionContext(adminUser);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });
    });

    describe('manejo de errores', () => {
      it('debería lanzar error si no hay usuario en el request', () => {
        mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);
        const mockContext = createMockExecutionContext(null);

        expect(() => guard.canActivate(mockContext)).toThrow();
      });

      it('debería usar i18n para mensajes de error', () => {
        mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
        const mockContext = createMockExecutionContext(mockUser);

        try {
          guard.canActivate(mockContext);
        } catch {
          // El error debería haber usado i18n.t()
          expect(mockI18nService.t).toHaveBeenCalled();
        }
      });
    });

    describe('diferentes roles', () => {
      const testCases = [
        { role: Role.USER, requiredRoles: [Role.USER], shouldPass: true },
        {
          role: Role.ADMIN,
          requiredRoles: [Role.ADMIN],
          shouldPass: true,
        },
        {
          role: Role.ADMIN,
          requiredRoles: [Role.USER],
          shouldPass: true,
        },
        {
          role: Role.USER,
          requiredRoles: [Role.ADMIN],
          shouldPass: false,
        },
      ];

      testCases.forEach(({ role, requiredRoles, shouldPass }) => {
        it(`${shouldPass ? 'debería permitir' : 'debería denegar'} acceso a ${role} para roles ${requiredRoles.join(', ')}`, () => {
          mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
          const userWithRole: UserActiveInterface = {
            ...mockUser,
            role,
          };
          const mockContext = createMockExecutionContext(userWithRole);

          if (shouldPass) {
            expect(guard.canActivate(mockContext)).toBe(true);
          } else {
            expect(() => guard.canActivate(mockContext)).toThrow();
          }
        });
      });
    });
  });
});
