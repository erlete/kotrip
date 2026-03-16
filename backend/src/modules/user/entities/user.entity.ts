import { CUDTzEntity } from '@/lib/data/entities/timestamped.entity';
import { Language, Role, UserStatus } from '@kotrip/data';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad User (Usuario).
 *
 * Representa a un usuario verificado y activo en el sistema Kotrip.
 * Los usuarios se crean después de completar el proceso de verificación
 * a través del módulo de autenticación.
 *
 * @remarks
 * Alcance funcional:
 * - Almacena credenciales y datos de perfil de usuarios verificados.
 * - Gestiona roles y permisos a traves del campo `role`.
 * - Permite personalizacion de idioma y avatar.
 *
 * Seguridad:
 * - La contrasena se almacena hasheada con bcrypt (nunca en texto plano).
 * - El campo `password` tiene `select: false` para evitar exposicion accidental.
 *
 * @see Verification Entidad de invitaciones pendientes de verificación.
 */
@Entity({
  comment: 'Usuarios verificados y activos del sistema Kotrip',
  name: 'user',
})
@Index('idx_user_email', ['email'], { unique: true })
export class User extends CUDTzEntity {
  // #region Primary Key

  /**
   * Identificador único del usuario (UUID v4).
   *
   * @remarks Se genera automáticamente al crear el usuario.
   */
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Identificador único del usuario (UUID v4)',
    name: 'id',
  })
  id: string;

  // #endregion

  // #region Columns - Identificación

  /**
   * Correo electrónico del usuario.
   *
   * @remarks
   * - Debe ser único en el sistema.
   * - Se usa como identificador principal para login.
   * - Máximo 512 caracteres.
   */
  @Column({
    comment: 'Correo electrónico único del usuario (usado para login)',
    length: 512,
    name: 'email',
    type: 'varchar',
    unique: true,
  })
  email: string;

  /**
   * Nombre del usuario.
   *
   * @remarks
   * - Puede ser null si el usuario no ha configurado un nombre.
   * - Máximo 512 caracteres.
   */
  @Column({
    comment: 'Nombre del usuario',
    length: 512,
    name: 'first_name',
    nullable: true,
    type: 'varchar',
  })
  firstName: null | string;

  /**
   * Apellidos del usuario.
   *
   * @remarks
   * - Puede ser null si el usuario no ha configurado apellidos.
   * - Máximo 512 caracteres.
   */
  @Column({
    comment: 'Apellidos del usuario',
    length: 512,
    name: 'last_name',
    nullable: true,
    type: 'varchar',
  })
  lastName: null | string;

  // #endregion

  // #region Columns - Seguridad

  /**
   * Contraseña del usuario (hasheada con bcrypt).
   *
   * @remarks
   * - NUNCA se almacena en texto plano.
   * - Hasheada con bcrypt usando PASSWORDS_SALT_ROUNDS.
   * - `select: false` evita que se incluya en queries por defecto.
   * - Máximo 512 caracteres para el hash.
   */
  @Column({
    comment: 'Contraseña hasheada con bcrypt (nunca en texto plano)',
    length: 512,
    name: 'password',
    select: false,
    type: 'varchar',
  })
  password: string;

  /**
   * Indica si el usuario tiene habilitada la autenticación de dos factores.
   *
   * @remarks
   * - Campo preservado para futura implementación de 2FA.
   * - Por defecto está deshabilitado.
   */
  @Column({
    comment: 'Indica si el 2FA está habilitado para este usuario',
    default: false,
    name: 'two_factor_enabled',
    type: 'boolean',
  })
  twoFactorEnabled: boolean;

  // #endregion

  // #region Columns - Rol y Permisos

  /**
   * Rol del usuario en el sistema.
   *
   * @remarks
   * Roles disponibles:
   * - USER: Usuario estándar con acceso a funcionalidades de viaje.
   * - ADMIN: Administrador con acceso total al sistema.
   */
  @Column({
    comment: 'Rol del usuario que determina sus permisos en el sistema',
    default: Role.USER,
    enum: Role,
    enumName: 'Role',
    name: 'role',
    type: 'enum',
  })
  role: Role;

  /**
   * Estado del usuario en la plataforma.
   *
   * @remarks
   * - Determina si el usuario puede iniciar sesión y acceder a la plataforma.
   * - Solo los estados `APPROVED` e `IMPORTED` permiten acceso completo.
   * - Por defecto es `APPROVED`.
   */
  @Column({
    comment: 'Estado del usuario en la plataforma',
    default: UserStatus.APPROVED,
    enum: UserStatus,
    enumName: 'UserStatus',
    name: 'status',
    type: 'enum',
  })
  status: UserStatus;

  /**
   * Fecha y hora del último cambio de estado del usuario.
   *
   * @remarks
   * - Se actualiza cada vez que el campo `status` cambia.
   * - Incluye zona horaria (timestamptz).
   */
  @Column({
    comment: 'Fecha y hora del último cambio de estado del usuario',
    name: 'last_status_change',
    nullable: true,
    type: 'timestamptz',
  })
  lastStatusChange: Date | null;

  // #endregion

  // #region Columns - Preferencias

  /**
   * Idioma preferido del usuario.
   *
   * @remarks
   * - Afecta a la interfaz y comunicaciones.
   * - Por defecto es español (ES).
   */
  @Column({
    comment: 'Idioma preferido del usuario para la interfaz',
    default: Language.ES,
    enum: Language,
    enumName: 'Language',
    name: 'language',
    type: 'enum',
  })
  language: Language;

  /**
   * Nombre del archivo de avatar del usuario.
   *
   * @remarks
   * - Almacena solo el nombre del archivo, no la ruta completa.
   * - El archivo se almacena en MinIO bajo la ruta del usuario.
   */
  @Column({
    comment: 'Nombre del archivo de avatar en MinIO',
    length: 512,
    name: 'avatar_file_name',
    nullable: true,
    type: 'varchar',
  })
  avatarFileName: null | string;

  // #endregion

  // #region Columns - Tracking

  /**
   * Fecha y hora del último inicio de sesión.
   *
   * @remarks
   * - Se actualiza cada vez que el usuario completa un login exitoso.
   * - Incluye zona horaria (timestamptz).
   */
  @Column({
    comment: 'Fecha y hora del último inicio de sesión exitoso',
    name: 'last_log_in',
    nullable: true,
    type: 'timestamptz',
  })
  lastLogIn: Date | null;

  // #endregion
}
