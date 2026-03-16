# Módulo de Archivos (`files`)

## Descripción General

El módulo de **Archivos** (`FilesModule`) gestiona el almacenamiento y recuperación de archivos en la plataforma Kotrip. Utiliza **MinIO** como backend de almacenamiento compatible con S3, proporcionando una capa de abstracción para operaciones de archivos.

---

## Arquitectura del Módulo

```
files/
├── files.module.ts               # Módulo principal
├── files-user.controller.ts      # Endpoints para usuarios
├── files-logs.controller.ts      # Endpoints para logs/admin
├── services/
│   └── file-service.service.ts   # Lógica de negocio
├── dto-outputs/                  # DTOs de respuesta
│   ├── file-list.output.dto.ts
│   ├── file-url.outout.ts
│   └── upload-file.output.dto.ts
├── interfaces/                   # Interfaces internas
│   ├── delete-file.interface.ts
│   ├── file-list.interface.ts
│   ├── file-url.interface.ts
│   └── upload-file.interface.ts
└── enums/
    └── buckets.enum.ts           # Definición de buckets
```

---

## Conceptos Clave

### Buckets

Los **buckets** son contenedores lógicos que organizan los archivos por tipo/propósito:

| Bucket           | Propósito                               | Acceso  |
| ---------------- | --------------------------------------- | ------- |
| `avatars`        | Fotos de perfil de usuarios             | Público |
| `course-posters` | Imágenes de portada de cursos           | Público |
| `activity-media` | Media de actividades (imágenes, videos) | Público |
| `submissions`    | Archivos entregados por estudiantes     | Privado |
| `exports`        | Reportes y exportaciones                | Privado |
| `logs`           | Archivos de log del sistema             | Privado |

### Object Keys

Las **claves de objeto** (`objectKey`) identifican unívocamente un archivo dentro de un bucket. Siguen una estructura jerárquica:

```
{entity-type}/{entity-id}/{filename}

Ejemplos:
- users/550e8400-e29b/avatar.png
- courses/d290f1ee-6c54/poster.jpg
- activities/7c9e6679-7425/diagram.svg
- attempts/3fa85f64-5717/submission.pdf
```

---

## Capacidades

### Subida de Archivos

```typescript
interface UploadFileParams {
  bucket: Buckets;
  objectKey: string;
  file: Buffer | Stream;
  contentType: string;
  metadata?: Record<string, string>;
}

// El servicio:
// 1. Valida el tipo de archivo (MIME type)
// 2. Escanea con ClamAV (antimalware)
// 3. Sube a MinIO
// 4. Retorna URL de acceso
```

### Descarga de Archivos

```typescript
// Genera URLs firmadas con tiempo de expiración
interface GetFileUrlParams {
  bucket: Buckets;
  objectKey: string;
  expiresIn?: number; // segundos, default 3600
}

// Retorna:
// - URL firmada para acceso temporal
// - O URL pública para buckets públicos
```

### Eliminación de Archivos

```typescript
interface DeleteFileParams {
  bucket: Buckets;
  objectKey: string;
}

// Eliminación soft (marca como eliminado) o hard (elimina físicamente)
```

### Listado de Archivos

```typescript
interface ListFilesParams {
  bucket: Buckets;
  prefix?: string; // Para filtrar por path
  limit?: number;
  marker?: string; // Paginación
}

// Retorna lista con metadata básica
```

---

## Integración con ClamAV

El módulo integra **ClamAV** para escaneo antimalware de archivos subidos:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Cliente   │───>│ FileService │───>│   ClamAV    │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                  │
                          │   scan(buffer)   │
                          │<─────────────────│
                          │                  │
                          │   isInfected?    │
                          │─────┬────────────┘
                          │     │
                    ┌─────▼─────▼─────┐
                    │  Si infectado:  │
                    │  rechazar upload│
                    │                 │
                    │  Si limpio:     │
                    │  subir a MinIO  │
                    └─────────────────┘
```

### Configuración de ClamAV

| Variable         | Descripción              | Default  |
| ---------------- | ------------------------ | -------- |
| `CLAMAV_HOST`    | Host del servicio ClamAV | `clamav` |
| `CLAMAV_PORT`    | Puerto del servicio      | `3310`   |
| `CLAMAV_TIMEOUT` | Timeout de escaneo (ms)  | `30000`  |

---

## Flujos de Negocio

### Flujo: Subir Avatar de Usuario

```
1. Usuario sube imagen
   └── POST /files/avatar

2. Validaciones:
   ├── Tipo de archivo: image/jpeg, image/png, image/webp
   ├── Tamaño máximo: 5MB
   └── Dimensiones: mínimo 100x100, máximo 2000x2000

3. Escaneo ClamAV
   └── Si infectado: HTTP 422 "Archivo rechazado"

4. Procesamiento de imagen:
   ├── Redimensionar a 256x256
   └── Convertir a WebP (optimización)

5. Subir a MinIO:
   ├── Bucket: avatars
   └── Key: users/{userId}/avatar.webp

6. Actualizar User.avatarUrl

7. Retornar URL pública
```

### Flujo: Subir Entrega de Estudiante

```
1. Estudiante sube archivo
   └── POST /attempts/{attemptId}/files

2. Validaciones:
   ├── Intento existe y está ACTIVE
   ├── Usuario tiene permisos
   ├── Tipo de archivo permitido
   └── Tamaño dentro del límite

3. Escaneo ClamAV

4. Subir a MinIO:
   ├── Bucket: submissions
   └── Key: attempts/{attemptId}/{timestamp}_{filename}

5. Registrar en AssignmentAttemptItem (si aplica)

6. Retornar confirmación con URL firmada
```

### Flujo: Obtener Archivo con URL Firmada

```
1. Cliente solicita archivo privado
   └── GET /files/{bucket}/{objectKey}

2. Verificar permisos:
   ├── ¿Usuario autenticado?
   └── ¿Tiene acceso al recurso?

3. Generar URL firmada:
   ├── Validez: 1 hora por defecto
   └── Incluye firma criptográfica

4. Retornar URL para descarga directa
```

---

## API Endpoints

### Endpoints de Usuario

| Método | Endpoint                | Descripción              |
| ------ | ----------------------- | ------------------------ |
| POST   | `/files/avatar`         | Subir avatar de usuario  |
| DELETE | `/files/avatar`         | Eliminar avatar          |
| GET    | `/files/avatar/:userId` | Obtener avatar (público) |

### Endpoints de Contenido

| Método | Endpoint                              | Descripción              |
| ------ | ------------------------------------- | ------------------------ |
| POST   | `/files/courses/:courseId/poster`     | Subir poster de curso    |
| POST   | `/files/activities/:activityId/media` | Subir media de actividad |
| GET    | `/files/:bucket/:objectKey`           | Obtener URL firmada      |
| DELETE | `/files/:bucket/:objectKey`           | Eliminar archivo         |

### Endpoints de Administración

| Método | Endpoint                | Descripción                |
| ------ | ----------------------- | -------------------------- |
| GET    | `/admin/files/list`     | Listar archivos (paginado) |
| GET    | `/admin/files/stats`    | Estadísticas de uso        |
| DELETE | `/admin/files/orphaned` | Limpiar archivos huérfanos |

---

## Configuración de MinIO

### Variables de Entorno

| Variable           | Descripción             | Ejemplo      |
| ------------------ | ----------------------- | ------------ |
| `MINIO_ENDPOINT`   | Host del servidor MinIO | `minio:9000` |
| `MINIO_ACCESS_KEY` | Clave de acceso         | `minioadmin` |
| `MINIO_SECRET_KEY` | Clave secreta           | `minioadmin` |
| `MINIO_REGION`     | Región (opcional)       | `us-east-1`  |

### Inicialización de Buckets

Al arrancar, el módulo verifica y crea los buckets necesarios:

```typescript
async onModuleInit() {
  for (const bucket of Object.values(Buckets)) {
    const exists = await this.minioClient.bucketExists(bucket);
    if (!exists) {
      await this.minioClient.makeBucket(bucket);
      await this.setBucketPolicy(bucket);
    }
  }
}
```

### Políticas de Bucket

```json
// Buckets públicos (avatars, posters)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": ["s3:GetObject"],
    "Resource": ["arn:aws:s3:::avatars/*"]
  }]
}

// Buckets privados (submissions)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Principal": "*",
    "Action": ["s3:GetObject"],
    "Resource": ["arn:aws:s3:::submissions/*"]
  }]
}
```

---

## Validaciones

### Tipos de Archivo Permitidos

| Contexto       | MIME Types                                              |
| -------------- | ------------------------------------------------------- |
| Avatares       | `image/jpeg`, `image/png`, `image/webp`, `image/gif`    |
| Posters        | `image/jpeg`, `image/png`, `image/webp`                 |
| Activity Media | `image/*`, `video/mp4`, `video/webm`, `application/pdf` |
| Submissions    | Configurable por actividad                              |

### Límites de Tamaño

| Contexto       | Límite                        |
| -------------- | ----------------------------- |
| Avatares       | 5 MB                          |
| Posters        | 10 MB                         |
| Activity Media | 100 MB                        |
| Submissions    | 50 MB (default, configurable) |

---

## Consideraciones de Seguridad

### URLs Firmadas

Las URLs firmadas incluyen:

- Timestamp de expiración
- Firma HMAC con clave secreta
- Parámetros de acceso

```
https://minio.example.com/submissions/file.pdf
  ?X-Amz-Algorithm=AWS4-HMAC-SHA256
  &X-Amz-Credential=...
  &X-Amz-Date=20260101T120000Z
  &X-Amz-Expires=3600
  &X-Amz-Signature=abc123...
```

### Validación de Contenido

1. **Validación MIME**: Verifica el tipo declarado vs contenido real.
2. **Magic Bytes**: Comprueba cabeceras del archivo.
3. **Escaneo Antimalware**: ClamAV para todos los uploads.

### Control de Acceso

- Archivos privados requieren autenticación JWT.
- Se verifica ownership antes de retornar URLs.
- Logs de auditoría para accesos sensibles.

---

## Arquitectura de Almacenamiento

```
┌─────────────────────────────────────────────────────────────────┐
│                         MinIO Cluster                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│   │  avatars  │  │  posters  │  │   media   │  │submissions│   │
│   │  (public) │  │  (public) │  │  (public) │  │ (private) │   │
│   └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
│         │              │              │              │          │
│         └──────────────┴──────────────┴──────────────┘          │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │  Replicación /    │                        │
│                    │  Erasure Coding   │                        │
│                    └───────────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dependencias

### Internas

- `@/user/*`: Para actualizar avatarUrl.
- `@/content/*`: Para referencias de media.

### Externas

- `minio`: Cliente oficial de MinIO.
- `clamscan`: Cliente de ClamAV.
- `sharp`: Procesamiento de imágenes.
- `file-type`: Detección de MIME types.

---

## Testing

```bash
# Tests unitarios (con mocks de MinIO)
npm run test -- --testPathPattern=files

# Tests de integración (requiere MinIO local)
npm run test:e2e -- --testPathPattern=files
```

### Mocking MinIO en Tests

```typescript
const mockMinioClient = {
  bucketExists: jest.fn().mockResolvedValue(true),
  putObject: jest.fn().mockResolvedValue({ etag: 'abc123' }),
  getObject: jest.fn().mockResolvedValue(mockStream),
  presignedGetObject: jest.fn().mockResolvedValue('https://...'),
};
```

---

## Mantenimiento

### Limpieza de Archivos Huérfanos

Archivos que ya no tienen referencia en la base de datos:

```bash
# Job programado semanal
npm run files:cleanup-orphaned
```

### Monitoreo de Uso

```bash
# Obtener estadísticas
GET /admin/files/stats

# Respuesta:
{
  "totalSize": "15.2 GB",
  "byBucket": {
    "avatars": "250 MB",
    "submissions": "12 GB",
    ...
  },
  "fileCount": 15420
}
```

---

## Troubleshooting

### Error: "Connection refused to MinIO"

```bash
# Verificar que MinIO está corriendo
docker compose ps minio

# Verificar conectividad
docker compose exec backend curl http://minio:9000/minio/health/live
```

### Error: "ClamAV scan timeout"

```bash
# Verificar estado de ClamAV
docker compose exec clamav clamdscan --version

# Revisar logs
docker compose logs clamav
```

### Error: "Bucket not found"

```bash
# Forzar recreación de buckets
npm run files:init-buckets
```
