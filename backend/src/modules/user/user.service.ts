import { OrderDTO } from '@/common/dtos/order.dto';
import { PaginatedResponse } from '@/common/dtos/paginated.dto';
import { ErrorManager } from '@/common/error-handling/error.manager';
import { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { orderIntoFindOptions } from '@/common/utils';
import FileService from '@/modules/files/services/file-service.service';
import {
  getUserAvatarPath,
  KOTRIP_BUCKET,
  Language,
  PASSWORDS_SALT_ROUNDS,
  Role,
  UserStatus,
} from '@kotrip/data';
import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import {
  DeleteResult,
  FindOptionsWhere,
  ILike,
  Not,
  Repository,
} from 'typeorm';
import { UserEmailVerification } from '../auth/entities/user-email-verification.entity';
import {
  AllUsersOutputDto,
  UserInfoDTO,
} from './dto-outputs/all-users.output.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-pass.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { OrderUsers } from './enums/order-user.enum';
import { AvatarOutput } from './interfaces/avatar.output.interface';
import { UserOutput } from './interfaces/user.output.interface';

/**
 * Servicio de gestion de usuarios (CRUD).
 *
 * Se encarga de consulta, actualizacion, eliminacion y gestion de avatares.
 * No confundir con el servicio de autenticacion (AuthService), que gestiona
 * el registro y la autorizacion de usuarios.
 *
 * @see AuthService Servicio de autenticacion.
 * @see User Entidad del usuario.
 */
@Injectable()
export class UserService {
  /**
   * @param userRepository        Entidad de usuarios
   * @param verifyRepository      Entidad de verificaciones
   * @param fileService           Servicio de archivos
   * @param i18n                  Servicio de internacionalización
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserEmailVerification)
    private readonly verifyRepository: Repository<UserEmailVerification>,
    private readonly fileService: FileService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Busca usuarios por nombre o correo electr\u00f3nico.
   *
   * @param query T\u00e9rmino de b\u00fasqueda parcial (nombre, apellidos o email).
   * @returns Lista de hasta 10 usuarios que coincidan con el t\u00e9rmino.
   */
  async searchUsers(query: string): Promise<UserInfoDTO[]> {
    const users = await this.userRepository.find({
      where: [
        { firstName: ILike(`%${query}%`) },
        { lastName: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
      take: 10,
      order: { firstName: 'ASC' },
    });

    return users.map((u) => this.mapToUserInfoDto(u));
  }

  /**
   * Mapea una entidad `User` al DTO de informaci\u00f3n p\u00fablica del usuario.
   *
   * @param user Entidad del usuario.
   * @returns DTO con la informaci\u00f3n p\u00fablica del usuario.
   */
  private mapToUserInfoDto(user: User): UserInfoDTO {
    let avatarUrl: string | undefined;
    try {
      avatarUrl = this.getProfilePicUrl(user);
    } catch {
      avatarUrl = undefined;
    }

    return {
      avatarUrl,
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : new Date(0).toISOString(),
      email: user.email,
      firstName: user.firstName ?? '',
      id: user.id,
      lastStatusChange: user.lastStatusChange
        ? new Date(user.lastStatusChange).toISOString()
        : null,
      language: user.language,
      lastName: user.lastName ?? '',
      role: user.role,
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled,
    };
  }

  /**
   * Obtiene un usuario mediante la ID, oculta la contraseña para proteger ese dato.
   *
   * @param id ID (UUID) del usuario.
   * @returns Objeto del usuario sin la contraseña, o `null` si no existe.
   */
  async findById(id: string): Promise<null | Omit<User, 'password'>> {
    return await this.userRepository.findOneBy({ id: id });
  }

  /**
   * Obtiene el lenguaje almacenado de un usuario
   *
   * @param id        ID (UUID) del usuario para obtener la información
   * @returns         Un valor del enum Language
   */
  async getUserLanguage(id: string): Promise<Language> {
    const user = await this.userRepository.findOneBy({ id: id });

    if (!user) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    return user.language;
  }

  /**
   * Actualiza la fecha del último inicio de sesión del usuario
   *
   * @param id        ID (UUID) del usuario
   * @returns         Fecha y hora del inicio de sesión registrado.
   */
  async updateLastLogIn(id: string): Promise<Date> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    user.lastLogIn = new Date();
    await this.userRepository.save(user);

    return user.lastLogIn;
  }

  /**
   * Crea un usuario nuevo en la base de datos con todos los datos proporcionados
   * en el DTO de entrada.
   *
   * @param dto   DTO con la información del nuevo usuario
   * @returns     Devuelve el resultado del ORM al crear el usuario
   * @throws      CONFLICT: Si ya existe un usuario con el mismo correo
   */
  async createUser(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOneBy({ email: dto.mail });

    if (user)
      throw new ErrorManager(
        'CONFLICT',
        this.i18n.t('error.USER.MAIL_DUPLICATED'),
      );
    dto.role ??= Role.USER;

    const newUser = new User();
    newUser.email = dto.mail;
    newUser.firstName = dto.firstName;
    newUser.lastName = dto.lastName;
    newUser.password = dto.password;
    newUser.role = dto.role;
    newUser.language = dto.language ?? Language.EN;
    newUser.status =
      (dto as CreateUserDto & { status?: UserStatus }).status ??
      UserStatus.APPROVED;
    newUser.lastStatusChange = new Date();

    const fullResult = await this.userRepository.save(newUser);

    const result = {
      avatarFileName: fullResult.avatarFileName,
      createdAt: fullResult.createdAt,
      deletedAt: fullResult.deletedAt,
      email: fullResult.email,
      firstName: fullResult.firstName,
      id: fullResult.id,
      language: fullResult.language,
      lastLogIn: fullResult.lastLogIn,
      lastStatusChange: fullResult.lastStatusChange,
      lastName: fullResult.lastName,
      role: fullResult.role,
      status: fullResult.status,
      twoFactorEnabled: fullResult.twoFactorEnabled,
      updatedAt: fullResult.updatedAt,
    } as Omit<User, 'password'>;

    return result;
  }

  /**
   * Borra toda la información referente de un usuario en la base de datos.
   *
   * @param mail      Un string con el mail del usuario
   * @returns         Devuelve el resultado del ORM al realizar el delete.
   * @throws          NOT_FOUND: Si el usuario no existe
   * @throws          FORBIDDEN: Si se intenta eliminar un ADMIN
   */
  async deleteUser(mail: string): Promise<DeleteResult> {
    const user = await this.findByMail(mail);

    if (!user) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    if (user.role === Role.ADMIN) {
      throw new ErrorManager(
        'FORBIDDEN',
        this.i18n.t('error.USER.CANNOT_DELETE_YOU_USER'),
      );
    }

    // Eliminar archivos del usuario en MinIO (no falla si no existen)
    try {
      await this.fileService.deleteAllInPath([`users/${user.id}`]);
    } catch {
      // Log pero no fallar - la eliminación del usuario debe continuar
    }

    try {
      await this.verifyRepository.delete({ targetEmail: mail });
    } catch {
      // Ignorar errores de limpieza de verificaciones
    }

    return await this.userRepository.delete({ email: mail });
  }

  /**
   * Devuelve todos los usuarios en la base de datos.
   *
   * @returns     Un objeto de interfaz de tipo AllUsersOutput con todos los usuarios
   */
  async findAll(): Promise<AllUsersOutputDto> {
    const users = await this.userRepository.find({
      select: [
        'id',
        'email',
        'role',
        'twoFactorEnabled',
        'status',
        'lastStatusChange',
        'avatarFileName',
        'firstName',
        'lastName',
        'language',
        'createdAt',
      ],
    });

    const completeUsers: UserInfoDTO[] = [];

    for (const user of users) {
      let avatarUrl: string | undefined;

      try {
        avatarUrl = this.getProfilePicUrl(user);
      } catch {
        avatarUrl = undefined;
      }

      completeUsers.push({
        avatarUrl,
        createdAt: user.createdAt
          ? new Date(user.createdAt).toISOString()
          : new Date(0).toISOString(),
        email: user.email,
        firstName: user.firstName ?? '',
        id: user.id,
        lastStatusChange: user.lastStatusChange
          ? new Date(user.lastStatusChange).toISOString()
          : null,
        language: user.language,
        lastName: user.lastName ?? '',
        role: user.role,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled,
      });
    }

    return { user: completeUsers };
  }

  /**
   * Devuelve los usuarios de la plataforma de forma paginada.
   *
   * @param page            Número de página solicitada
   * @param pageSize        Tamaño de la página
   * @param order           Criterios de ordenación
   * @param requestingUser  Usuario que realiza la petición
   * @param mail            Filtro parcial por correo electrónico
   * @param firstName       Filtro parcial por nombre
   * @param lastName        Filtro parcial por apellidos
   * @param role            Filtro exacto por rol
   * @param status          Filtro exacto por estado
   * @returns               Objeto paginado con la lista de usuarios
   */
  async findAllPaginated(
    page: number,
    pageSize: number,
    order: OrderDTO<OrderUsers>[],
    requestingUser: UserActiveInterface,
    mail?: string,
    firstName?: string,
    lastName?: string,
    role?: string,
    status?: string,
  ): Promise<PaginatedResponse<UserInfoDTO>> {
    if (!page || !pageSize || page < 1 || pageSize < 1) {
      throw new ErrorManager(
        'NOT_ACCEPTABLE',
        await this.i18n.t('error.COMMON.PAGE_PAGESIZE_INVALID'),
      );
    }

    const where: FindOptionsWhere<User> = {
      ...(mail && { email: ILike(`%${mail}%`) }),
      ...(firstName && { firstName: ILike(`%${firstName}%`) }),
      ...(lastName && { lastName: ILike(`%${lastName}%`) }),
      ...(role && { role: role as Role }),
      ...(status && { status: status as UserStatus }),
    };

    // Ningún usuario se ve a sí mismo en el listado
    where.id = Not(requestingUser.id);

    const [users, total] = await this.userRepository.findAndCount({
      order: orderIntoFindOptions(order),
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'role',
        'language',
        'twoFactorEnabled',
        'status',
        'lastStatusChange',
        'createdAt',
        'avatarFileName',
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
    });

    const formattedUsers: UserInfoDTO[] = users.map((user) => {
      let avatarUrl: string | undefined;
      try {
        avatarUrl = this.getProfilePicUrl(user);
      } catch {
        //
      }

      const userRet: UserInfoDTO = {
        avatarUrl,
        createdAt: new Date(user.createdAt).toLocaleString(),
        email: user.email,
        firstName: user.firstName ?? '',
        id: user.id,
        lastStatusChange: user.lastStatusChange
          ? new Date(user.lastStatusChange).toISOString()
          : null,
        language: user.language,
        lastName: user.lastName ?? '',
        role: user.role,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled,
      };
      return userRet;
    });

    return {
      list: formattedUsers,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Devuelve todos los datos de un usuario empleando solo su correo pero omite su contraseña.
   *
   * @param mail  El correo del usuario que se quiere obtener
   * @returns     Un objeto de tipo User con todos los datos del usuario menos la contraseña
   */
  async findByMail(mail: string): Promise<null | Omit<User, 'password'>> {
    return await this.userRepository.findOneBy({ email: mail });
  }

  /**
   * Devuelve todos los datos de un usuario empleando solo su correo, incluyendo la contraseña.
   *
   * @param email  El correo del usuario que se quiere obtener
   * @returns      Un objeto de tipo User con todos los datos del usuario
   */
  async findAllData(email: string): Promise<null | User> {
    return this.userRepository.findOne({
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'password',
        'role',
        'twoFactorEnabled',
        'status',
        'language',
        'avatarFileName',
        'lastLogIn',
      ],
      where: { email: email },
    });
  }

  /**
   * Devuelve todos los datos de un usuario empleando su nombre de usuario.
   *
   * @param username  El nombre de usuario que se quiere obtener
   * @returns         Un objeto de tipo User con todos los datos del usuario
   */
  async findByUsername(username: string): Promise<null | User> {
    return this.userRepository.findOne({
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'password',
        'role',
        'twoFactorEnabled',
        'status',
        'language',
        'avatarFileName',
        'lastLogIn',
      ],
      where: { firstName: username },
    });
  }

  /**
   * Recupera la información del usuario empleando una interfaz de tipo UserOutput.
   *
   * @param mail  Correo del usuario del cual queremos obtener los datos
   * @returns     Una interfaz de tipo UserOutput con los datos filtrados
   */
  async profile(mail: string): Promise<UserOutput> {
    const user = await this.findAllData(mail);
    if (!user) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    let avatarUrl: string | undefined;
    try {
      avatarUrl = this.getProfilePicUrl(user);
    } catch {
      avatarUrl = undefined;
    }

    const userOut: UserOutput = {
      avatarUrl: avatarUrl ?? '',
      lastLogIn: user.lastLogIn ? user.lastLogIn.toISOString() : null,
      mail: user.email,
      role: user.role,
    };

    return userOut;
  }

  /**
   * Guarda una entidad de usuario en la base de datos.
   *
   * @param user  Entidad de usuario a guardar
   * @returns     Usuario actualizado de la base de datos
   */
  async saveUserEntity(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  /**
   * Sube una imagen de avatar al bucket dedicado del usuario.
   *
   * @param user  Objeto de tipo UserActiveInterface con los datos del usuario
   * @param file  Objeto de tipo Multer.File con el fichero a subir
   * @returns     Un objeto interfaz para confirmar si se sube bien el fichero o un error
   */
  async uploadProfilePic(user: UserActiveInterface, file: Express.Multer.File) {
    try {
      const userEnt = await this.findAllData(user.email);
      if (!userEnt) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.USER.NOT_FOUND'),
        );
      }

      const fileExtension = file.originalname.substring(
        file.originalname.lastIndexOf('.') + 1,
      );
      const hash = FileService.generateFileHash(file.buffer);
      const newFileName = `${hash}.${fileExtension}`;

      const oldAvatarName = userEnt.avatarFileName;

      if (oldAvatarName) {
        try {
          const oldPath = getUserAvatarPath(user.id, oldAvatarName);
          await this.fileService.deleteFileByName(KOTRIP_BUCKET, [oldPath]);
        } catch {
          // Ignorar si no existe
        }
      }

      const avatarPath = getUserAvatarPath(user.id, newFileName);
      await this.fileService.uploadFile(
        KOTRIP_BUCKET,
        [avatarPath],
        file.buffer,
        file.mimetype,
        false,
      );

      const userEntity = await this.userRepository.findOneBy({ id: user.id });
      if (!userEntity) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.USER.NOT_FOUND'),
        );
      }

      userEntity.avatarFileName = newFileName;
      await this.userRepository.save(userEntity);

      let avatarURL: string | undefined = undefined;
      try {
        avatarURL = this.getProfilePicUrl(userEntity);
      } catch {
        //
      }

      const uploadCheck: AvatarOutput = {
        avatar_url: avatarURL ?? '',
        file_name: newFileName,
        status: true,
      };

      return uploadCheck;
    } catch (error) {
      this.rethrowUnknownError(error, 'Error inesperado');
    }
  }

  /**
   * Elimina el avatar del usuario tanto del bucket como de la base de datos.
   *
   * @param user  Objeto de tipo UserActiveInterface con los datos del usuario
   * @returns     Objeto con el resultado de la operación
   */
  async deleteProfilePic(
    user: UserActiveInterface,
  ): Promise<{ success: boolean }> {
    const userEnt = await this.findAllData(user.email);
    if (!userEnt) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    if (!userEnt.avatarFileName) {
      throw new ErrorManager('NOT_FOUND', 'El usuario no tiene foto de perfil');
    }

    try {
      const avatarPath = getUserAvatarPath(user.id, userEnt.avatarFileName);
      await this.fileService.deleteFileByName(KOTRIP_BUCKET, [avatarPath]);
    } catch (error) {
      console.error('Error al eliminar el avatar del bucket:', error);
    }

    const userEntity = await this.userRepository.findOneBy({ id: user.id });
    if (!userEntity) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    userEntity.avatarFileName = null;
    await this.userRepository.save(userEntity);

    return { success: true };
  }

  /**
   * Recupera el avatar del usuario como un fichero descargable.
   *
   * @param user  Objeto de tipo UserActiveInterface con la información del usuario.
   * @returns     Objeto de tipo StreamableFile con el avatar del usuario.
   */
  async getProfilePic(user: UserActiveInterface): Promise<StreamableFile> {
    try {
      const userEnt = await this.findByMail(user.email);
      if (!userEnt) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.USER.NOT_FOUND'),
        );
      }

      if (userEnt.avatarFileName) {
        const avatarPath = getUserAvatarPath(user.id, userEnt.avatarFileName);
        const streamableFile = await this.fileService.retrieveFileByPath(
          KOTRIP_BUCKET,
          [avatarPath],
          false,
        );

        return streamableFile;
      } else {
        throw new ErrorManager('NOT_FOUND', 'User avatar not found');
      }
    } catch (error) {
      this.rethrowUnknownError(error, 'Error inesperado');
    }
  }

  /**
   * Obtiene la URL pública del avatar del usuario.
   *
   * @param user  Entidad del usuario de la que obtener la URL del avatar.
   * @returns     URL pública del avatar o `undefined` si el usuario no tiene avatar.
   */
  getProfilePicUrl(user: Omit<User, 'password'> | User): string | undefined {
    if (!user) {
      return undefined;
    }

    if (user.avatarFileName) {
      const avatarPath = getUserAvatarPath(user.id, user.avatarFileName);
      return FileService.getPublicURL(avatarPath);
    }

    return undefined;
  }

  /**
   * Cambia el estado del 2FA de un usuario.
   *
   * @param id        ID (UUID) del usuario
   * @returns         Nueva información del usuario
   */
  async updateOther2FA(id: string) {
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }
    user.twoFactorEnabled = !user.twoFactorEnabled;
    return await this.userRepository.save(user);
  }

  private rethrowUnknownError(error: unknown, fallbackMessage: string): never {
    if (error instanceof ErrorManager) {
      throw error;
    }

    const message =
      error instanceof Error && error.message ? error.message : fallbackMessage;
    throw new ErrorManager('INTERNAL_SERVER_ERROR', message);
  }

  /**
   * Actualiza la información de un usuario por parte de un administrador.
   *
   * @param id                    ID en base de datos del usuario a actualizar
   * @param updateUserDto         Objeto con nuevos datos
   * @param activeUser            Usuario que lanza la petición
   * @returns                     Usuario actualizado
   */
  async updateUserByAdmin(
    id: string,
    updateUserDto: UpdateUserDto,
    activeUser: UserActiveInterface,
  ): Promise<User> {
    try {
      if (id === activeUser.id) {
        throw new ErrorManager(
          'CONFLICT',
          this.i18n.t('error.USER.CANNOT_UPDATE_YOU_USER'),
        );
      }

      const {
        language,
        mail,
        firstName,
        lastName,
        role,
        twoFactorCode,
        status,
      } = updateUserDto;

      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.USER.NOT_FOUND'),
        );
      }

      if (updateUserDto.mail && updateUserDto.mail !== user.email) {
        const existingUserNewMail = await this.userRepository.findOne({
          where: { email: updateUserDto.mail },
        });

        if (existingUserNewMail) {
          throw new ErrorManager(
            'CONFLICT',
            this.i18n.t('error.USER.MAIL_DUPLICATED'),
          );
        }
      }

      if (typeof mail === 'string') user.email = mail;
      if (typeof firstName === 'string') user.firstName = firstName;
      if (typeof lastName === 'string') user.lastName = lastName;
      if (role !== undefined) user.role = role;
      if (twoFactorCode !== undefined) user.twoFactorEnabled = twoFactorCode;
      if (language !== undefined) user.language = language;
      if (status !== undefined) {
        user.status = status;
        user.lastStatusChange = new Date();
      }

      return await this.userRepository.save(user);
    } catch (error) {
      this.rethrowUnknownError(error, 'Error updating user');
    }
  }

  /**
   * Actualiza la contraseña de un usuario.
   *
   * @param userMail              Correo del usuario al que actualizar
   * @param updatePasswordDto     Nuevos datos de la contraseña
   * @returns                     Usuario actualizado
   */
  async updatePassword(userMail: string, updatePasswordDto: UpdatePasswordDto) {
    const { newPassword, oldPassword } = updatePasswordDto;

    const user = await this.userRepository.findOne({
      select: ['id', 'password'],
      where: { email: userMail },
    });

    if (!user) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    if (!user.password) {
      throw new ErrorManager(
        'INTERNAL_SERVER_ERROR',
        this.i18n.t('error.USER.NOT_FOUND'),
      );
    }

    const isPasswordValid = await bcryptjs.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new ErrorManager(
        `BAD_REQUEST`,
        this.i18n.t('error.USER.INVALID_OLD_PASSWORD'),
      );
    }

    user.password = await bcryptjs.hash(newPassword, PASSWORDS_SALT_ROUNDS);
    return await this.userRepository.save(user);
  }

  /**
   * Actualiza el estado de un usuario en la plataforma.
   *
   * @param id            ID (UUID) del usuario a actualizar
   * @param newStatus     Nuevo estado del usuario
   * @param activeUser    Administrador que ejecuta la operación
   * @returns             Objeto de confirmación
   */
  async updateUserStatus(
    id: string,
    newStatus: UserStatus,
    activeUser: UserActiveInterface,
  ): Promise<{ success: boolean }> {
    if (id === activeUser.id) {
      throw new ErrorManager(
        'CONFLICT',
        this.i18n.t('error.USER.CANNOT_UPDATE_YOU_USER'),
      );
    }

    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'status'],
      where: { id },
    });

    if (!user) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    user.status = newStatus;
    user.lastStatusChange = new Date();
    await this.userRepository.save(user);

    return { success: true };
  }

  /**
   * Reinicia la contraseña de un usuario por parte de un administrador.
   *
   * @param id            ID (UUID) del usuario
   * @param newPassword   Nueva contraseña en texto plano (se hasheará)
   * @param activeUser    Administrador que ejecuta la operación
   * @returns             Objeto de confirmación
   */
  async adminResetPassword(
    id: string,
    newPassword: string,
    activeUser: UserActiveInterface,
  ): Promise<{ success: boolean }> {
    if (id === activeUser.id) {
      throw new ErrorManager(
        'CONFLICT',
        this.i18n.t('error.USER.CANNOT_UPDATE_YOU_USER'),
      );
    }

    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { id },
    });

    if (!user) {
      throw new ErrorManager('NOT_FOUND', this.i18n.t('error.USER.NOT_FOUND'));
    }

    user.password = await bcryptjs.hash(newPassword, PASSWORDS_SALT_ROUNDS);
    await this.userRepository.save(user);

    return { success: true };
  }
}
