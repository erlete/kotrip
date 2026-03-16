import { User } from '@/modules/user/entities/user.entity';
import { Language, OtpPurpose } from '@kotrip/data';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entidad UserEmailVerification (Verificación de Email).
 *
 * Almacena los tokens de verificación de email asociados a usuarios,
 * tanto para el registro como para la recuperación de contraseña.
 * Cada registro contiene un hash bcrypt de un código OTP de 6 dígitos.
 *
 * @remarks
 * Alcance funcional:
 * - Verificación de email tras el registro de un usuario.
 * - Recuperación de contraseña mediante código OTP.
 * - El token almacenado es un hash bcrypt del código de 6 dígitos enviado por email.
 * - Un usuario puede tener múltiples registros si reenvía el código.
 * - El email de destino no es único ya que se pueden generar múltiples intentos.
 *
 * @see User Entidad del usuario asociado.
 * @see OtpPurpose Enum que distingue el propósito del código OTP.
 */
@Entity({
  comment: 'Verificaciones de email de registro de usuarios',
  name: 'user_email_verifications',
})
export class UserEmailVerification {
  /** Identificador único de la verificación. */
  @PrimaryGeneratedColumn({
    comment: 'Identificador único de la verificación',
    name: 'id',
  })
  id: number;

  /** Identificador del usuario asociado a esta verificación. */
  @Column({
    comment: 'UUID del usuario asociado a esta verificación',
    name: 'user_id',
    nullable: true,
    type: 'uuid',
  })
  userId: string | null;

  /** Relación con el usuario asociado. */
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  /** Email de destino de la verificación. */
  @Column({
    comment: 'Email de destino de la verificación',
    length: 512,
    name: 'target_email',
    type: 'varchar',
  })
  targetEmail: string;

  /**
   * Hash bcrypt del código de verificación de 6 dígitos.
   *
   * @remarks
   * El código en texto plano se envía por email al usuario.
   * Solo el hash se almacena en la base de datos por seguridad.
   */
  @Column({
    comment: 'Hash bcrypt del código de verificación de 6 dígitos',
    length: 512,
    name: 'verification_token',
    type: 'varchar',
  })
  verificationToken: string;

  /** Idioma preferido del usuario para comunicaciones. */
  @Column({
    comment: 'Idioma preferido del usuario para comunicaciones',
    default: Language.EN,
    enum: Language,
    enumName: 'Language',
    name: 'language',
    nullable: false,
    type: 'enum',
  })
  language: Language;

  /** Propósito del código OTP (registro o recuperación de contraseña). */
  @Column({
    comment: 'Propósito del código OTP',
    default: OtpPurpose.REGISTRATION_VERIFICATION,
    enum: OtpPurpose,
    enumName: 'OtpPurpose',
    name: 'purpose',
    nullable: false,
    type: 'enum',
  })
  purpose: OtpPurpose;

  /** Fecha de expiración del código OTP. */
  @Column({
    comment: 'Fecha de expiración del código OTP',
    name: 'expires_at',
    nullable: true,
    type: 'timestamptz',
  })
  expiresAt: Date | null;

  /** Fecha de aceptación (verificación exitosa del código). */
  @Column({
    comment: 'Fecha de aceptación de la verificación',
    name: 'accepted_at',
    nullable: true,
    type: 'timestamptz',
  })
  acceptedAt: Date | null;

  /** Fecha de creación del registro de verificación. */
  @CreateDateColumn({
    comment: 'Fecha de creación del registro de verificación',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  /** Fecha de última actualización. */
  @UpdateDateColumn({
    comment: 'Fecha de última actualización',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;

  /** Fecha de eliminación lógica. */
  @DeleteDateColumn({
    comment: 'Fecha de eliminación lógica',
    name: 'deleted_at',
    nullable: true,
    type: 'timestamptz',
  })
  deletedAt: Date | null;
}
