/**
 * Propósito de un código OTP generado por el sistema.
 *
 * Permite distinguir entre verificaciones de registro y
 * recuperaciones de contraseña en la tabla `user_email_verifications`.
 */
export enum OtpPurpose {
  /** Verificación del email durante el registro de usuario. */
  REGISTRATION_VERIFICATION = 'REGISTRATION_VERIFICATION',
  /** Recuperación de contraseña mediante código OTP. */
  PASSWORD_RECOVERY = 'PASSWORD_RECOVERY',
}
