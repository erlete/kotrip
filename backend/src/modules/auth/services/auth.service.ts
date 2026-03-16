import { ErrorManager } from '@/common/error-handling/error.manager';
import { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { durationToMs, durationToSeconds } from '@/common/utils/duration.utils';
import {
  Language,
  PASSWORDS_SALT_ROUNDS,
  Role,
  UserStatus,
} from '@kotrip/data';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { hash } from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { IsNull, Repository } from 'typeorm';
import { UserService } from '../../user/user.service';
import { NewRegisterOutput } from '../dto-outputs/new-register.output.dto';
import { LoginDto } from '../dto/login.dto';
import { NewRegisterDto } from '../dto/new-register.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
import { UserEmailVerification } from '../entities/user-email-verification.entity';
import { LoginInterface } from '../interfaces/login.interface';

/**
 * Servicio de autenticación del módulo Auth.
 *
 * Gestiona el ciclo completo de autenticación de usuarios:
 * - Login con credenciales (email/contraseña).
 * - Registro de nuevos usuarios con verificación por email.
 * - Verificación de email mediante código de 6 dígitos.
 * - Gestión de tokens JWT (acceso y refresco).
 * - Actualización de sesión.
 *
 * @see UserService Servicio de gestión de usuarios.
 */
@Injectable()
export class AuthService {
  /** Tiempo de expiración del token de acceso en milisegundos. */
  private readonly accessTokenExpiresMs: number;

  /** Tiempo de expiración del token de refresco en segundos. */
  private readonly refreshTokenExpiresSec: number;

  /**
   * @param userService Servicio para el CRUD de usuario.
   * @param jwtService Servicio JWT para los tokens de acceso.
   * @param verifyRepository Repositorio de verificaciones de email.
   * @param i18n Servicio de internacionalización.
   * @param configService Servicio de configuración para variables de entorno.
   */
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserEmailVerification)
    private readonly verifyRepository: Repository<UserEmailVerification>,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly configService: ConfigService,
  ) {
    // Parsear duraciones de tokens desde configuración
    const accessExpiration =
      this.configService.getOrThrow<string>('JWT_EXPIRATION');
    const refreshExpiration = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRATION',
    );

    this.accessTokenExpiresMs = durationToMs(accessExpiration);
    this.refreshTokenExpiresSec = durationToSeconds(refreshExpiration);
  }

  /**
   * Crea tokens JWT de acceso y refresco para el usuario.
   *
   * @param payload Datos del usuario a incluir en los tokens.
   * @returns Objeto con access_token, refresh_token y expires_in.
   */
  async createBackendTokens(payload: UserActiveInterface) {
    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    return {
      access_token: await this.jwtService.signAsync(payload as object),
      expires_in: this.accessTokenExpiresMs,
      refresh_token: await this.jwtService.signAsync(payload as object, {
        expiresIn: this.refreshTokenExpiresSec,
        secret: refreshSecret,
      }),
    };
  }

  /**
   * Renueva los tokens JWT usando el token de refresco.
   *
   * @param user Información del usuario del token de refresco.
   * @returns Nueva respuesta de login con tokens actualizados.
   * @throws {ErrorManager} NOT_FOUND si el usuario ya no existe.
   * @throws {ErrorManager} FORBIDDEN si el status del usuario no permite acceso.
   */
  async refreshToken(user: UserActiveInterface): Promise<LoginInterface> {
    const fullUser = await this.userService.findByMail(user.email);

    if (!fullUser) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    // Verificar status del usuario - solo APPROVED e IMPORTED pueden refrescar
    if (
      fullUser.status !== UserStatus.APPROVED &&
      fullUser.status !== UserStatus.IMPORTED
    ) {
      throw new ErrorManager(
        'FORBIDDEN',
        'User status does not permit access',
        { reason: fullUser.status },
      );
    }

    const payload: UserActiveInterface = {
      email: fullUser.email,
      id: fullUser.id,
      status: fullUser.status,
      language: fullUser.language,
      firstName: fullUser.firstName,
      lastName: fullUser.lastName,
      role: fullUser.role,
      twoFactorEnabled: fullUser.twoFactorEnabled,
      validated: user.validated,
    };

    const backEndTokens = await this.createBackendTokens(payload);

    let avatarURL: string | undefined;
    try {
      avatarURL = this.userService.getProfilePicUrl(fullUser);
    } catch {
      avatarURL = undefined;
    }

    const output: LoginInterface = {
      backendTokens: {
        accessToken: backEndTokens.access_token,
        refreshToken: backEndTokens.refresh_token,
      },
      user: {
        avatarURL: avatarURL ?? '',
        email: fullUser.email,
        id: fullUser.id,
        language: fullUser.language,
        lastLogIn: fullUser.lastLogIn ? fullUser.lastLogIn.toISOString() : null,
        role: fullUser.role,
        twoFactorEnabled: fullUser.twoFactorEnabled,
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        validated: user.validated,
      },
    };

    return output;
  }

  /**
   * Inicia sesión en la plataforma.
   *
   * @param credentials Credenciales de login (email y password).
   * @returns LoginInterface con tokens JWT.
   * @throws {ErrorManager} UNAUTHORIZED si las credenciales son inválidas.
   * @throws {ErrorManager} FORBIDDEN si el status del usuario no permite acceso.
   */
  async login({ password, email }: LoginDto): Promise<LoginInterface> {
    const user = await this.userService.findAllData(email);

    if (!user) {
      throw new ErrorManager(
        'UNAUTHORIZED',
        this.i18n.t('error.AUTH.INVALID_CREDENTIALS'),
      );
    }

    if (!(await bcryptjs.compare(password, user.password))) {
      throw new ErrorManager(
        'UNAUTHORIZED',
        this.i18n.t('error.AUTH.INVALID_CREDENTIALS'),
      );
    }

    // Verificar status del usuario - solo APPROVED e IMPORTED pueden loguearse
    if (
      user.status !== UserStatus.APPROVED &&
      user.status !== UserStatus.IMPORTED
    ) {
      throw new ErrorManager('FORBIDDEN', 'User status does not permit login', {
        reason: user.status,
      });
    }

    // Actualizar lastLogIn
    const lastLogIn = await this.userService.updateLastLogIn(user.id);

    // Crear payload y tokens
    const payload_user: UserActiveInterface = {
      email: user.email,
      id: user.id,
      status: user.status,
      language: user.language,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      validated: true,
    };

    const backEndTokens = await this.createBackendTokens(payload_user);

    let avatarURL: string | undefined;
    try {
      avatarURL = this.userService.getProfilePicUrl(user);
    } catch {
      avatarURL = undefined;
    }

    const loginResponse: LoginInterface = {
      backendTokens: {
        accessToken: backEndTokens.access_token,
        refreshToken: backEndTokens.refresh_token,
      },
      user: {
        avatarURL: avatarURL ?? '',
        email: user.email,
        id: user.id,
        language: user.language,
        lastLogIn: lastLogIn.toISOString(),
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        firstName: user.firstName,
        lastName: user.lastName,
        validated: true,
      },
    };

    return loginResponse;
  }

  /**
   * Registra un nuevo usuario en la plataforma.
   *
   * @remarks
   * Crea un usuario directamente con status `APPROVED`.
   * Genera un código de verificación de 6 dígitos y almacena su hash
   * en `UserEmailVerification`.
   *
   * @param dto Datos del nuevo registro (email, nombre, contraseña).
   * @param lang Idioma preferido del usuario.
   * @returns Información del registro.
   * @throws {ErrorManager} CONFLICT si ya existe un usuario con ese email.
   */
  async register(dto: NewRegisterDto, lang: Language) {
    // Verificar duplicados en la tabla de usuarios
    const existingUser = await this.userService.findByMail(dto.mail);
    if (existingUser) {
      throw new ErrorManager(
        'CONFLICT',
        this.i18n.t('error.USER.MAIL_DUPLICATED'),
      );
    }

    // Crear usuario directamente con status APPROVED
    const hashedPassword = await hash(dto.password, PASSWORDS_SALT_ROUNDS);
    const newUser = await this.userService.createUser({
      firstName: dto.firstName,
      language: lang,
      lastName: dto.lastName,
      mail: dto.mail,
      password: hashedPassword,
      role: Role.USER,
    });

    const registerOutput: NewRegisterOutput = {
      admissionResult: 'ADMITTED',
      mail: newUser.email,
    };
    return registerOutput;
  }

  /**
   * Verifica el email de un usuario mediante un código de 6 dígitos.
   *
   * @param email Email del usuario a verificar.
   * @param code Código de verificación de 6 dígitos.
   * @returns Resultado de admisión.
   * @throws {ErrorManager} NOT_FOUND si no hay verificación pendiente.
   * @throws {ErrorManager} UNAUTHORIZED si el código es inválido o expirado.
   */
  async verifyEmail(
    email: string,
    code: string,
  ): Promise<{ admissionResult: 'ADMITTED' }> {
    // Buscar verificación pendiente más reciente
    const verification = await this.verifyRepository.findOne({
      order: { createdAt: 'DESC' },
      where: { acceptedAt: IsNull(), targetEmail: email },
    });

    if (!verification) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    // Verificar expiración basada en INVITE_EXPIRATION
    const inviteExpiration =
      this.configService.getOrThrow<string>('INVITE_EXPIRATION');
    const expirationMs = durationToMs(inviteExpiration);
    const elapsed = Date.now() - verification.createdAt.getTime();
    if (elapsed > expirationMs) {
      throw new ErrorManager(
        'UNAUTHORIZED',
        this.i18n.t('error.AUTH.INVALID_TOKEN'),
      );
    }

    // Comparar código con hash almacenado
    const isMatch = await bcryptjs.compare(
      code,
      verification.verificationToken,
    );
    if (!isMatch) {
      throw new ErrorManager(
        'UNAUTHORIZED',
        this.i18n.t('error.AUTH.INVALID_TOKEN'),
      );
    }

    // Marcar verificación como aceptada
    verification.acceptedAt = new Date();
    await this.verifyRepository.save(verification);

    // Buscar usuario asociado y aprobar
    const user = verification.userId
      ? await this.userService.findByMail(email)
      : null;

    if (user) {
      (user as { status: UserStatus }).status = UserStatus.APPROVED;
      (user as { lastStatusChange: Date }).lastStatusChange = new Date();
      await this.userService.saveUserEntity(
        user as Parameters<typeof this.userService.saveUserEntity>[0],
      );
    }

    return { admissionResult: 'ADMITTED' };
  }

  /**
   * Actualiza parcialmente la sesión/perfil del usuario
   * y devuelve un nuevo token con la información actualizada.
   *
   * @param userActive    UserActiveInterface del usuario autenticado
   * @param updateDto     Campos a actualizar (language, name, mail, avatarFileName, password, etc.)
   * @returns             LoginInterface con tokens actualizados
   */
  async updateSession(
    userActive: UserActiveInterface,
    updateDto: UpdateSessionDto,
  ): Promise<LoginInterface> {
    // Obtener usuario con todos los datos incluyendo la contraseña
    const user = await this.userService.findAllData(userActive.email);

    if (!user) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    // Si se va a actualizar la contraseña y se proporciona la antigua, validarla
    if (updateDto.password) {
      if (updateDto.oldPassword) {
        const isOldPasswordValid = await bcryptjs.compare(
          updateDto.oldPassword,
          user.password,
        );

        if (!isOldPasswordValid) {
          throw new ErrorManager(
            'BAD_REQUEST',
            this.i18n.t('error.USER.INVALID_OLD_PASSWORD'),
          );
        }
      }

      // Hashear la nueva contraseña
      user.password = await hash(updateDto.password, PASSWORDS_SALT_ROUNDS);
    }

    // Comprobar si se cambia el email y no existe un usuario con dicho email
    if (updateDto.mail && updateDto.mail !== user.email) {
      const existingUserNewMail = await this.userService.findByMail(
        updateDto.mail,
      );
      if (existingUserNewMail) {
        throw new ErrorManager(
          'CONFLICT',
          this.i18n.t('error.USER.MAIL_DUPLICATED'),
        );
      }
      user.email = updateDto.mail;
    }

    // Actualizar otros campos
    if (typeof updateDto.firstName === 'string')
      user.firstName = updateDto.firstName;
    if (typeof updateDto.lastName === 'string')
      user.lastName = updateDto.lastName;
    if (updateDto.language !== undefined) user.language = updateDto.language;
    if (typeof updateDto.avatarFileName === 'string')
      user.avatarFileName = updateDto.avatarFileName;
    if (updateDto.role !== undefined) user.role = updateDto.role;
    if (updateDto.twoFactorEnabled !== undefined)
      user.twoFactorEnabled = updateDto.twoFactorEnabled;

    // Guardar cambios en la base de datos
    const updatedUser = await this.userService.saveUserEntity(user);

    // Crear nuevo token JWT con los datos actualizados
    const payloadUser: UserActiveInterface = {
      email: updatedUser.email,
      id: updatedUser.id,
      status: updatedUser.status,
      language: updatedUser.language,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      validated: true,
    };

    let avatarURL: string | undefined;
    try {
      avatarURL = this.userService.getProfilePicUrl(updatedUser);
    } catch {
      avatarURL = undefined;
    }

    const internalTokens = await this.createBackendTokens(payloadUser);

    const userRet: LoginInterface = {
      backendTokens: {
        accessToken: internalTokens.access_token,
        refreshToken: internalTokens.refresh_token,
      },
      user: {
        avatarURL: avatarURL ?? null,
        email: payloadUser.email,
        id: payloadUser.id,
        language: payloadUser.language,
        lastLogIn: updatedUser.lastLogIn
          ? updatedUser.lastLogIn.toISOString()
          : null,
        role: payloadUser.role,
        twoFactorEnabled: payloadUser.twoFactorEnabled,
        firstName: payloadUser.firstName,
        lastName: payloadUser.lastName,
        validated: payloadUser.validated,
      },
    };

    return userRet;
  }
}
