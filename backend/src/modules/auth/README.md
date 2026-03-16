# Módulo de Autenticación (Auth Module)

## Descripción General

El módulo de autenticación (`AuthModule`) gestiona todas las operaciones relacionadas con la autenticación y autorización de usuarios en la plataforma Kotrip. Este módulo proporciona funcionalidades de registro, verificación, inicio de sesión, gestión de tokens JWT, autenticación de dos factores (2FA) y recuperación de contraseñas.

## Responsabilidades Principales

1. **Registro de Usuarios**: Crear solicitudes de registro pendientes de verificación
2. **Verificación**: Confirmar y activar cuentas de usuario mediante tokens
3. **Inicio de Sesión**: Autenticar usuarios y emitir tokens JWT
4. **Gestión de Tokens JWT**: Generar y refrescar tokens de acceso y refresco
5. **Autenticación 2FA**: Validar códigos OTP para autenticación de dos factores
6. **Actualización de Sesión**: Actualizar información del usuario y regenerar tokens
7. **Gestión de Verificaciones**: La aprobación y rechazo de usuarios se gestiona desde `/admin/users`

## Estructura del Módulo

```
auth/
├── decorators/                   # Decoradores personalizados
│   ├── auth.decorator.ts        # Decorador de autenticación y roles
│   ├── password-matches.decorator.ts # Validador de coincidencia de contraseñas
│   └── roles.decorator.ts       # Decorador de roles
├── dto/                          # Objetos de transferencia de datos
│   ├── login.dto.ts             # DTO para inicio de sesión
│   ├── new-register.dto.ts      # DTO para nuevo registro
│   ├── otp.dto.ts               # DTO para códigos OTP
│   ├── verify.dto.ts            # DTO para verificación de email
│   ├── reset-pass.dto.ts        # DTO para resetear contraseña
│   ├── reset-pre-pass.ts        # DTO para solicitud de reset
│   └── update-session.dto.ts    # DTO para actualizar sesión
├── dto-outputs/                  # DTOs de salida
│   ├── login.output.dto.ts      # DTO de salida de login
│   ├── new-register.output.dto.ts # DTO de salida de registro
│   ├── needs-validation.output.dto.ts # DTO para 2FA requerido
├── entities/                     # Entidades de base de datos
│   └── verification.entity.ts   # Entidad de registros pendientes
├── guard/                        # Guards de protección
│   ├── auth.guard.ts            # Guard de autenticación JWT
│   ├── refresh.guard.ts         # Guard de token de refresco
│   └── roles.guard.ts           # Guard de roles
├── interfaces/                   # Interfaces TypeScript
│   └── login.interface.ts       # Interfaz de respuesta de login
├── services/                     # Servicios
│   ├── auth.service.ts          # Servicio principal de autenticación
│   └── reset.service.ts         # Servicio de recuperación de contraseña
├── auth.controller.ts            # Controlador de endpoints
├── auth.module.ts                # Módulo NestJS
└── auth-module.spec.ts           # Tests unitarios
```

## Entidades

### Verification Entity

La entidad `Verification` representa una solicitud de registro pendiente de verificación:

- **id** (number): Identificador único
- **senderEmail** (string | null): Email de quien envió la invitación (para invitaciones organizacionales)
- **targetEmail** (string): Email del usuario a registrar
- **verificationToken** (string): Token JWT para verificar el registro
- **name** (string): Nombre del usuario
- **password** (string): Contraseña hasheada
- **language** (Language): Idioma preferido
- **acceptedAt** (Date | null): Fecha de aceptación del registro
- **createdAt** (Date): Fecha de creación
- **updatedAt** (Date): Fecha de última actualización
- **deletedAt** (Date | null): Fecha de eliminación (soft delete)

## Servicios Principales

### AuthService

El servicio `AuthService` proporciona los siguientes métodos:

#### Inicio de Sesión y Tokens

- **login(dto: LoginDto)**: Inicia sesión con usuario y contraseña
  - Valida credenciales
  - Si 2FA está activado, envía email con OTP y retorna `NeedsValidationInterface`
  - Si no hay 2FA, actualiza `lastLogIn` y retorna tokens JWT
  - Retorna: `LoginResponse` (LoginInterface o NeedsValidationInterface)

- **validateOtp(mail, otp)**: Valida código OTP para login con 2FA
  - Verifica el código OTP
  - Actualiza `lastLogIn`
  - Genera y retorna tokens JWT
  - Retorna: `LoginInterface`

- **createBackendTokens(payload)**: Genera tokens JWT de acceso y refresco
  - Crea access token con expiración configurada en `JWT_EXPIRATION`
  - Crea refresh token con expiración configurada en `JWT_REFRESH_EXPIRATION`
  - Retorna: `{ access_token, expires_in, refresh_token }`

- **refreshToken(user: UserActiveInterface)**: Refresca los tokens JWT
  - Valida que el usuario exista
  - Genera nuevos tokens de acceso y refresco
  - Retorna información actualizada del usuario
  - Retorna: `LoginInterface`

#### Registro y Verificación

- **register(dto: NewRegisterDto, lang: Language)**: Crea una nueva solicitud de registro
  - Verifica que no exista registro previo
  - Verifica que el email no esté ya registrado
  - Genera token JWT de verificación con expiración configurada
  - Hashea la contraseña con bcrypt
  - Guarda el registro en la tabla `verification`
  - Retorna: `NewRegisterOutput`

- **verifyEmail(email, code)**: Verifica el email de un usuario mediante código de 6 dígitos
  - Busca la verificación pendiente más reciente
  - Compara el código con el hash almacenado
  - Aplica la política de admisión de la plataforma
  - Retorna: resultado de admisión ('ADMITTED', 'PENDING' o 'REJECTED')

#### Actualización de Sesión

- **updateSession(userActive, updateDto)**: Actualiza información del usuario y regenera tokens
  - Permite actualizar: idioma, nombre, email, avatar y contraseña
  - Valida contraseña antigua si se proporciona
  - Verifica disponibilidad de nuevo email
  - Actualiza los datos del usuario
  - Genera nuevos tokens JWT con información actualizada
  - Retorna: `LoginInterface`

### ResetService

Servicio para recuperación de contraseñas (si está implementado):

- **requestReset(email)**: Solicita un enlace de recuperación de contraseña
- **resetPassword(token, newPassword)**: Resetea la contraseña usando un token válido

## DTOs Principales

### LoginDto

```typescript
{
  username: string; // Nombre de usuario
  password: string; // Contraseña del usuario
}
```

### NewRegisterDto

```typescript
{
  mail: string; // Email del usuario
  name: string; // Nombre del usuario
  password: string; // Contraseña
  repeatPassword: string; // Confirmación de contraseña
}
```

### VerifyDto

```typescript
{
  mail: string; // Email del usuario
  verificationToken: string; // Token de verificación JWT
}
```

### UpdateSessionDto

```typescript
{
  language?: Language;       // Nuevo idioma
  name?: string;            // Nuevo nombre
  mail?: string;            // Nuevo email
  avatarFileName?: string;  // Nuevo avatar
  password?: string;        // Nueva contraseña
  oldPassword?: string;     // Contraseña actual (requerida si se cambia password)
}
```

## Interfaces de Respuesta

### LoginInterface

```typescript
{
  user: {
    id: number;
    email: string;
    username: string;
    role: Role;
    language: Language;
    twoFactorEnabled: boolean;
    validated: boolean;
    lastLogIn: string | null;
    avatarURL: string;
  }
  backendTokens: {
    accessToken: string; // Token JWT de acceso
    refreshToken: string; // Token JWT de refresco
  }
}
```

### NeedsValidationInterface

```typescript
{
  needsValidation: true; // Indica que se requiere validación 2FA
}
```

### LoginResponse

```typescript
type LoginResponse = LoginInterface | NeedsValidationInterface;
```

## Guards de Seguridad

### AuthGuard

Protege rutas que requieren autenticación:

- Extrae y verifica el token JWT del header `Authorization: Bearer <token>`
- Valida que el token sea válido y no haya expirado
- Verifica que el usuario esté validado (importante para 2FA)
- Inyecta el payload del usuario en `request.user`
- Permite acceso solo a `/auth/verify-otp` si el usuario no está validado

### RefreshGuard

Protege la ruta de refresco de tokens:

- Extrae y verifica el refresh token del header `Authorization: Refresh <token>`
- Usa el secreto `JWT_REFRESH_SECRET` para verificar
- Permite renovar el access token sin reautenticación completa

### RolesGuard

Protege rutas basándose en roles de usuario:

- Verifica que el usuario tenga uno de los roles permitidos
- Se combina con el decorador `@Roles(...roles)`
- Funciona en conjunto con `AuthGuard`

## Decoradores

### @Auth(...roles)

Decorador compuesto que:

- Aplica `@UseGuards(AuthGuard, RolesGuard)`
- Establece metadata de roles permitidos
- Simplifica la protección de endpoints

Ejemplo:

```typescript
@Auth(Role.ADMIN)
@Get('admin-only')
adminEndpoint() { ... }
```

### @PasswordMatches

Validador personalizado que verifica que `password` y `repeatPassword` coincidan en DTOs de registro.

## Configuración JWT

El módulo utiliza las siguientes variables de entorno:

```env
# Token de acceso
JWT_SECRET=<clave-secreta>              # Secreto para firmar access tokens
JWT_EXPIRATION=15m                      # Duración del access token (ej: 15m, 1h, 1d)
JWT_GLOBAL=true                         # Si el módulo JWT está disponible globalmente

# Token de refresco
JWT_REFRESH_SECRET=<clave-secreta-refresh> # Secreto para firmar refresh tokens
JWT_REFRESH_EXPIRATION=30d              # Duración del refresh token (ej: 7d, 30d)

# Verificación de registro
INVITE_EXPIRATION=7d                    # Duración del token de verificación
```

### Flujo de Tokens

1. **Login inicial**: Se generan ambos tokens (access y refresh)
2. **Access token expira**: El cliente usa el refresh token para obtener nuevos tokens
3. **Refresh token expira**: El usuario debe volver a hacer login

### Cálculo de EXPIRE_TIME

```typescript
EXPIRE_TIME = parseInt(JWT_EXPIRATION.replace('m', '')) * 60 * 1000;
// Ejemplo: '15m' -> 15 * 60 * 1000 = 900,000 ms = 15 minutos
```

## Seguridad

### Protección de Contraseñas

- Se usa bcrypt con 10 rondas de salt (`PASSWORDS_SALT_ROUNDS`)
- Las contraseñas nunca se devuelven en respuestas
- Las contraseñas antiguas se validan antes de permitir cambios

### Tokens JWT

- Los access tokens son de corta duración (por defecto 15 minutos)
- Los refresh tokens son de larga duración (por defecto 30 días)
- Cada tipo de token usa un secreto diferente
- Los tokens incluyen payload con información del usuario

### Autenticación de Dos Factores

- Si está activada, el login envía un OTP por email
- El cliente debe llamar a `/auth/verify-otp` con el código
- Los códigos tienen una duración limitada (10 minutos)
- Después de validar el OTP, se emiten los tokens normales

### Throttling

El módulo implementa rate limiting con ThrottlerModule:

- Límite: 10 peticiones
- Ventana: 60 segundos (60,000 ms)
- Protege contra ataques de fuerza bruta

## Integración con Otros Cursos

### UserModule

- AuthService utiliza UserService para operaciones CRUD de usuarios
- Dependencia bidireccional gestionada con `forwardRef()`
- UserService maneja la gestión de OTP para 2FA

### MailModule

- Se utiliza Bull queue (`mail-queue`) para enviar emails de forma asíncrona
- Envío de códigos OTP para 2FA
- Envío de enlaces de verificación de registro
- Envío de enlaces de recuperación de contraseña

## Flujos de Autenticación

### Flujo de Registro

1. Usuario envía datos a `/auth/register`
2. Sistema valida que email no esté duplicado
3. Se crea registro en tabla `verification` con token JWT
4. Se envía email con enlace de verificación (opcional/TODO)
5. Usuario hace clic en enlace con token
6. Sistema valida token y crea usuario en tabla `user`
7. Usuario puede hacer login

### Flujo de Login sin 2FA

1. Usuario envía credenciales a `/auth/login`
2. Sistema valida usuario y contraseña
3. Se actualiza `lastLogIn`
4. Se generan tokens JWT (access + refresh)
5. Se retorna `LoginInterface` con tokens y datos de usuario

### Flujo de Login con 2FA

1. Usuario envía credenciales a `/auth/login`
2. Sistema valida usuario y contraseña
3. Se detecta que tiene 2FA activado
4. Se genera y envía OTP por email
5. Se retorna `NeedsValidationInterface`
6. Usuario envía OTP a `/auth/verify-otp`
7. Sistema valida OTP
8. Se actualiza `lastLogIn`
9. Se generan tokens JWT
10. Se retorna `LoginInterface`

### Flujo de Refresh Token

1. Access token expira
2. Cliente envía refresh token a `/auth/refresh`
3. Sistema valida refresh token
4. Se generan nuevos access + refresh tokens
5. Se retorna `LoginInterface` actualizado

### Flujo de Actualización de Sesión

1. Usuario autenticado envía cambios a `/auth/update-session`
2. Sistema valida contraseña antigua si se cambia
3. Se actualizan datos en base de datos
4. Se generan nuevos tokens JWT con datos actualizados
5. Se retorna `LoginInterface` con nueva información

## Manejo de Errores

El módulo utiliza `ErrorManager` para gestionar errores:

- **UNAUTHORIZED**: Credenciales inválidas, OTP inválido, token inválido
- **NOT_FOUND**: Usuario no encontrado, registro no encontrado
- **CONFLICT**: Email duplicado, registro ya aceptado, emails no coinciden
- **BAD_REQUEST**: Contraseña antigua incorrecta, datos inválidos

## Tests

El módulo incluye tests unitarios completos en `auth-module.spec.ts`:

- Tests de creación de tokens JWT
- Tests de login con y sin 2FA
- Tests de refresh token
- Tests de registro y verificación
- Tests de rechazo de registros
- Tests de actualización de sesión
- Mocks de dependencias (JwtService, UserService, etc.)

## Mejores Prácticas

### Al Implementar Nuevos Endpoints Protegidos

```typescript
@Auth(Role.USER) // Requiere autenticación y rol USER
@Get('protected')
getProtectedResource(@ActiveUser() user: UserActiveInterface) {
  // user contiene información del token JWT validado
  return { message: `Hello ${user.name}` };
}
```

### Al Refrescar Tokens

```typescript
// El cliente debe enviar el refresh token en el header:
// Authorization: Refresh <refresh_token>

@UseGuards(RefreshGuard)
@Post('refresh')
refresh(@ActiveUser() user: UserActiveInterface) {
  return this.authService.refreshToken(user);
}
```

### Al Actualizar Información del Usuario

```typescript
@Auth(Role.USER)
@Patch('update-session')
updateSession(
  @ActiveUser() user: UserActiveInterface,
  @Body() updateDto: UpdateSessionDto,
) {
  return this.authService.updateSession(user, updateDto);
}
```

## Notas de Implementación

### Consideraciones Importantes

1. Los tokens JWT incluyen toda la información del usuario para evitar consultas adicionales
2. El refresh token debe enviarse con header `Refresh` en lugar de `Bearer`
3. La validación del usuario (`validated: true/false`) se usa para controlar acceso durante 2FA
4. Los registros aceptados no se borran automáticamente (solo se marcan con `acceptedAt`)

### Mejoras Pendientes

1. Implementar envío real de emails de verificación (actualmente es TODO)
2. Completar implementación de ResetService para recuperación de contraseña
3. Considerar implementar refresh token rotation para mayor seguridad
4. Añadir logs de auditoría para inicios de sesión y cambios de contraseña

### Dependencias Externas

- `@nestjs/jwt`: Para generación y verificación de tokens JWT
- `@nestjs/throttler`: Para rate limiting
- `@nestjs/bull`: Para colas de emails asíncronos
- `bcryptjs`: Para hasheo de contraseñas
- `nestjs-i18n`: Para mensajes multi-idioma
