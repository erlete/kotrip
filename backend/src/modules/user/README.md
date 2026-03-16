# Módulo de Usuarios (`user`)

## Descripción General

El módulo de **Usuarios** (`UserModule`) gestiona todas las operaciones relacionadas con los usuarios registrados en la plataforma Kotrip. Este módulo proporciona funcionalidades CRUD completas, gestión de perfiles, avatares, contraseñas y autenticación de dos factores (2FA).

---

## Arquitectura del Módulo

```
user/
├── user.module.ts                # Módulo NestJS
├── user.controller.ts            # Controlador de endpoints
├── user.service.ts               # Lógica de negocio
├── user-module.spec.ts           # Tests unitarios
├── dto/                          # Objetos de transferencia de datos
│   ├── create-user.dto.ts        # DTO para crear usuarios
│   ├── update-user.dto.ts        # DTO para actualizar usuarios
│   ├── update-pass.dto.ts        # DTO para actualizar contraseñas
│   └── mail.dto.ts               # DTO para operaciones de correo
├── dto-outputs/                  # DTOs de salida
│   ├── user.output.dto.ts        # DTO de salida de usuario individual
│   ├── all-users.output.dto.ts   # DTO de salida de lista de usuarios
│   └── avatar.output.dto.ts      # DTO de salida de avatar
├── entities/                     # Entidades de base de datos
│   ├── user.entity.ts            # Entidad principal de usuario
│   └── user-otp.ts               # Entidad para códigos OTP
├── enums/                        # Enumeraciones
│   ├── language.enum.ts          # Idiomas soportados
│   └── order-user.enum.ts        # Campos de ordenamiento
└── interfaces/                   # Interfaces TypeScript
    ├── user.output.interface.ts  # Interfaz de salida de usuario
    └── avatar.output.interface.ts# Interfaz de avatar
```

---

## Entidades

### Entidad Principal: `User`

Representa un usuario verificado y activo en el sistema.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | UUID | Identificador único del usuario |
| `email` | varchar(255) | Correo electrónico único |
| `name` | varchar(255) | Nombre completo del usuario |
| `password` | varchar | Contraseña hasheada (no seleccionable por defecto) |
| `role` | enum | Rol del usuario en el sistema |
| `language` | enum | Idioma preferido (`ES`, `EN`) |
| `avatarFileName` | varchar | Nombre del archivo de avatar |
| `lastLogIn` | timestamp | Fecha/hora del último inicio de sesión |
| `twoFactorEnabled` | boolean | Indica si el 2FA está habilitado |
| `createdAt` | timestamp | Fecha de creación |
| `updatedAt` | timestamp | Fecha de última actualización |
| `deletedAt` | timestamp | Soft delete (null si activo) |

### Roles de Usuario (`Role`)

| Rol     | Descripción               | Permisos                          |
| ------- | ------------------------- | --------------------------------- |
| `USER`  | Usuario estándar          | Acceso a funcionalidades de viaje |
| `ADMIN` | Administrador del sistema | Acceso total al sistema           |

### Entidad: `UserOTP`

Gestiona códigos de un solo uso para autenticación 2FA.

| Campo       | Tipo       | Descripción              |
| ----------- | ---------- | ------------------------ |
| `id`        | UUID       | Identificador único      |
| `userId`    | UUID       | Usuario propietario (FK) |
| `code`      | varchar(6) | Código OTP generado      |
| `expiresAt` | timestamp  | Fecha de expiración      |
| `createdAt` | timestamp  | Fecha de creación        |

---

## Servicio Principal: `UserService`

### Métodos de Consulta

```typescript
// Obtener usuario por ID (sin contraseña)
findById(id: string): Promise<User>

// Obtener usuario por email (sin contraseña)
findByMail(mail: string): Promise<User>

// Obtener usuario con todos los datos (incluye contraseña)
findAllData(email: string): Promise<User>

// Obtener todos los usuarios (información básica)
findAll(): Promise<User[]>

// Obtener usuarios paginados con filtros
findAllPaginated(
  page: number,
  pageSize: number,
  order: OrderUser,
  mail?: string
): Promise<PaginatedResponse<User>>

// Obtener idioma del usuario
getUserLanguage(id: string): Promise<Language>
```

### Métodos de Creación y Actualización

```typescript
// Crear nuevo usuario
createUser(dto: CreateUserDto): Promise<User>

// Actualizar información del usuario
updateUser(
  userActive: UserActive,
  updateDto: UpdateUserDto
): Promise<User>

// Actualizar contraseña
updatePassword(
  mail: string,
  updatePasswordDto: UpdatePasswordDto
): Promise<void>

// Actualizar fecha de último login
updateLastLogIn(id: string): Promise<void>

// Guardar entidad directamente
saveUserEntity(user: User): Promise<User>
```

### Métodos de Eliminación

```typescript
// Eliminar usuario (soft delete)
deleteUser(mail: string): Promise<void>

// Validaciones:
// - No permite eliminar ADMIN
// - Elimina datos relacionados en cascada
```

### Gestión de 2FA

```typescript
// Generar y enviar código OTP
generateOtp(userId: string): Promise<void>

// Validar código OTP
validateOtp(userId: string, code: string): Promise<boolean>

// Activar/desactivar 2FA
toggleTwoFactor(userId: string, enable: boolean): Promise<void>
```

---

## API Endpoints

### Endpoints Públicos

| Método | Endpoint            | Descripción               | Auth |
| ------ | ------------------- | ------------------------- | ---- |
| GET    | `/users/avatar/:id` | Obtener avatar de usuario | No   |

### Endpoints Autenticados

| Método | Endpoint             | Descripción               | Roles |
| ------ | -------------------- | ------------------------- | ----- |
| GET    | `/users/profile`     | Perfil del usuario actual | Todos |
| PATCH  | `/users/profile`     | Actualizar perfil         | Todos |
| POST   | `/users/avatar`      | Subir avatar              | Todos |
| DELETE | `/users/avatar`      | Eliminar avatar           | Todos |
| PATCH  | `/users/password`    | Cambiar contraseña        | Todos |
| POST   | `/users/2fa/enable`  | Activar 2FA               | Todos |
| POST   | `/users/2fa/disable` | Desactivar 2FA            | Todos |

### Endpoints de Administración

| Método | Endpoint     | Descripción        | Roles |
| ------ | ------------ | ------------------ | ----- |
| GET    | `/users`     | Listar usuarios    | ADMIN |
| GET    | `/users/:id` | Detalle de usuario | ADMIN |
| POST   | `/users`     | Crear usuario      | ADMIN |
| PATCH  | `/users/:id` | Actualizar usuario | ADMIN |
| DELETE | `/users/:id` | Eliminar usuario   | ADMIN |

---

## Flujos de Negocio

### Flujo: Actualización de Perfil

```
1. Usuario envía datos actualizados
   └── PATCH /users/profile

2. Validaciones:
   ├── Email único (si cambia)
   ├── Nombre no vacío
   └── Idioma válido

3. Actualizar campos permitidos:
   ├── name
   ├── language
   └── (otros campos según rol)

4. Si cambió email:
   └── Requerir re-verificación (futuro)

5. Retornar usuario actualizado
```

### Flujo: Cambio de Contraseña

```
1. Usuario envía contraseñas
   └── PATCH /users/password
   └── Body: { currentPassword, newPassword, confirmPassword }

2. Validaciones:
   ├── currentPassword coincide con DB
   ├── newPassword != currentPassword
   └── newPassword == confirmPassword

3. Hash de nueva contraseña
   └── bcrypt con 12 rounds

4. Actualizar en DB

5. Invalidar sesiones previas (futuro)

6. Retornar confirmación
```

### Flujo: Activación de 2FA

```
1. Usuario solicita activar 2FA
   └── POST /users/2fa/enable

2. Generar código OTP de 6 dígitos
   └── Almacenar en UserOTP con expiración 5 min

3. Enviar código por email
   └── mailService.sendOtpEmail()

4. Usuario confirma con código
   └── POST /users/2fa/confirm
   └── Body: { otpCode }

5. Si código válido:
   ├── twoFactorEnabled = true
   └── Eliminar OTP usado

6. Futuros logins requerirán OTP
```

---

## Relaciones con Otros Módulos

### Dependencias

```
User ←──── Auth
     │      └── Login, registro, tokens
     │
     ├──── CourseTeamMember
     │      └── Membresía en equipos
     │
     ├──── Attempt
     │      └── Intentos de asignaciones
     │
     ├──── CourseTeam.createdBy
     │      └── Creador del equipo
     │
     └──── Files
            └── Avatar en MinIO
```

### Módulo Auth

- `AuthService` utiliza `UserService` para validar credenciales.
- Los tokens JWT incluyen `userId` y `role`.
- La verificación de cuenta crea el `User` final.

### Módulo Delivery

- `Attempt.userId` referencia al usuario.
- `CourseTeamMember.userId` para membresías de equipo.

---

## Seguridad

### Contraseñas

- Hash con **bcrypt** (12 rounds).
- Nunca se retornan en queries (decorador `@Exclude`).
- Validación de complejidad en DTOs.

### Soft Delete

- Los usuarios eliminados mantienen sus datos.
- El campo `deletedAt` marca la eliminación.
- Se excluyen de queries por defecto.

### Rate Limiting

- Endpoints de password tienen rate limit estricto.
- Endpoints de 2FA tienen rate limit por usuario.

---

## Configuración

### Variables de Entorno

| Variable                 | Descripción             | Default |
| ------------------------ | ----------------------- | ------- |
| `BCRYPT_ROUNDS`          | Rounds para hash        | `12`    |
| `OTP_EXPIRATION_MINUTES` | Expiración de OTP       | `5`     |
| `AVATAR_MAX_SIZE_MB`     | Tamaño máximo de avatar | `5`     |

---

## Testing

```bash
# Tests unitarios
npm run test -- --testPathPattern=user

# Tests de integración
npm run test:e2e -- --testPathPattern=user
```

### Datos de Prueba

```typescript
const mockUser = {
  id: 'uuid-here',
  email: 'test@kotrip.local',
  name: 'Test User',
  role: Role.USER,
  language: Language.ES,
};
```

---

## Troubleshooting

### Error: "Email already exists"

- El email debe ser único en todo el sistema.
- Verificar si existe un usuario soft-deleted con ese email.

### Error: "Invalid password"

- Verificar que la contraseña actual sea correcta.
- Revisar requisitos de complejidad de nueva contraseña.

### Error: "OTP expired"

- Los códigos OTP expiran en 5 minutos.
- Solicitar nuevo código y reintentar.

---

## Dependencias

### Internas

- `@/auth/*`: Para decoradores de autenticación.
- `@/files/*`: Para gestión de avatares.
- `@/mail/*`: Para envío de OTPs.

### Externas

- `bcrypt`: Hash de contraseñas.
- `class-validator`: Validación de DTOs.
- `class-transformer`: Transformación y exclusión de campos.
