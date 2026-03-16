# Módulo Seeder

## Descripción General

El módulo Seeder proporciona datos de prueba para el sistema Kotrip, permitiendo una visualización rápida y testing de todas las funcionalidades del backend. Se ejecuta automáticamente durante el arranque de la aplicación en modo desarrollo.

## Arquitectura

### Estructura de Carpetas

```
seeder/
├── inputs/
│   ├── data/           # Archivos JSON con datos de prueba
│   │   ├── users.json
│   │   ├── courses.json
│   │   ├── units.json
│   │   ├── activities.json
│   │   ├── activity-contents.json
│   │   ├── activity-items.json
│   │   ├── activity-item-clues.json
│   │   ├── course-teams.json
│   │   ├── course-team-members.json
│   │   ├── assignments.json
│   │   ├── assignment-attempts.json
│   │   └── assignment-attempt-items.json
│   ├── files/          # Archivos multimedia de prueba (imágenes, videos)
│   └── schemas/        # Esquemas JSON para validación
│       ├── users.schema.json
│       ├── courses.schema.json
│       └── ... (uno por cada archivo de datos)
├── seeders/            # Clases seeder para cada entidad
│   ├── users.seeder.ts
│   ├── courses.seeder.ts
│   └── ...
├── seeder.config.ts    # Configuración y orden de ejecución
├── seeder.module.ts    # Módulo principal de orquestación
└── README.md           # Este archivo
```

### Orden de Ejecución

Los seeders se ejecutan en un orden específico para respetar las dependencias entre entidades:

| Orden | Seeder | Descripción |
| --- | --- | --- |
| 1 | Users | Usuarios del sistema (admins, instructores, estudiantes) |
| 2 | Courses | Cursos con configuración de participación |
| 3 | Units | Unidades temáticas dentro de cada curso |
| 4 | Course Teams | Equipos de trabajo para cursos colaborativos |
| 5 | Course Team Members | Asignación de usuarios a equipos |
| 6 | Activities | Actividades interactivas de diferentes tipos |
| 7 | Activity Contents | Configuración JSON pesada de actividades |
| 8 | Activity Items | Ítems/preguntas dentro de cada actividad |
| 9 | Activity Clues | Pistas para ítems con factor de penalización |
| 10 | Assignments | Asignaciones (entregas de actividades) |
| 11 | Assignment Attempts | Intentos de estudiantes en asignaciones |
| 12 | Assignment Attempt Items | Respuestas a ítems individuales |

### Propagación de ID Maps

El sistema utiliza **ID Maps** para resolver referencias entre entidades. Cada seeder puede generar un mapa de IDs de referencia -> UUIDs reales que se propaga a seeders posteriores:

```typescript
// Mapas disponibles en SeederModule.idMaps
{
  userEmailToId: Map<string, string>,    // email -> UUID
  courseId: Map<string, string>,         // refId -> UUID
  unitId: Map<string, string>,           // refId -> UUID
  activityId: Map<string, string>,       // refId -> UUID
  activityItemId: Map<string, string>,   // refId -> UUID
  clueId: Map<string, string>,           // refId -> UUID
  courseTeamId: Map<string, string>,     // refId -> UUID
  assignmentId: Map<string, string>,     // refId -> UUID
  attemptId: Map<string, string>,        // refId -> UUID
}
```

## Formato de Archivos de Datos

Todos los archivos JSON soportan dos formatos:

### Formato Envuelto (Recomendado)

```json
{
  "$schema": "../schemas/nombre.schema.json",
  "data": [
    { "id": "ref-id-1", ... },
    { "id": "ref-id-2", ... }
  ]
}
```

### Formato Array Directo

```json
[
  { "id": "ref-id-1", ... },
  { "id": "ref-id-2", ... }
]
```

## Convenciones de Nomenclatura

### IDs de Referencia

Cada tipo de entidad usa un prefijo específico para sus IDs de referencia:

| Entidad      | Prefijo       | Ejemplo                    |
| ------------ | ------------- | -------------------------- |
| Course       | `course-`     | `course-cs101`             |
| Unit         | `unit-`       | `unit-cs101-basics`        |
| Activity     | `activity-`   | `activity-vars-true-false` |
| ActivityItem | `item-`       | `item-vars-tf-1`           |
| ActivityClue | `clue-`       | `clue-vars-tf-1-a`         |
| CourseTeam   | `team-`       | `team-web-alpha`           |
| Assignment   | `assignment-` | `assignment-vars-quiz`     |
| Attempt      | `attempt-`    | `attempt-vars-student1-1`  |
| AttemptItem  | `aat-`        | `aat-vars-s1-1-item1`      |

### Usuarios

Los usuarios se referencian por email, no por ID:

- `superadmin@kotrip.local` - Super administrador
- `orgadmin@kotrip.local` - Administrador de organización
- `instructor1@kotrip.local`, `instructor2@kotrip.local` - Instructores
- `ta1@kotrip.local` - Asistente de enseñanza
- `student1@kotrip.local` ... `student5@kotrip.local` - Estudiantes

## Valores Normalizados

El sistema de scoring utiliza valores normalizados en el rango **[0, 1]**:

### Campos de Actividad

| Campo | Rango | Descripción |
| --- | --- | --- |
| `unitWeight` | 0.0 - 1.0 | Peso de la actividad en la calificación de la unidad |
| `incorrectPenaltyFactor` | 0.0 - 1.0 | Factor de penalización por respuestas incorrectas |

### Campos de Clue (Pista)

| Campo           | Rango     | Descripción                     |
| --------------- | --------- | ------------------------------- |
| `penaltyFactor` | 0.0 - 1.0 | Penalización al usar esta pista |

### Campos de Scoring

| Campo                    | Rango     | Descripción                        |
| ------------------------ | --------- | ---------------------------------- |
| `rawScore`               | 0.0 - 1.0 | Puntuación antes de penalizaciones |
| `finalScore`             | 0.0 - 1.0 | Puntuación final normalizada       |
| `totalCluePenaltyFactor` | 0.0 - 1.0 | Penalización acumulada por pistas  |

## Tipos de Actividad

El sistema soporta múltiples tipos de actividad:

| Tipo                  | Descripción                             |
| --------------------- | --------------------------------------- |
| `FORM_TRUE_FALSE`     | Cuestionario verdadero/falso            |
| `FORM_SINGLE_CHOICE`  | Selección única                         |
| `FORM_FILL_GAPS`      | Completar espacios                      |
| `FORM_MATCHING`       | Emparejar elementos                     |
| `FORM_ORDERING`       | Ordenar elementos                       |
| `FORM_CLASSIFICATION` | Clasificar elementos                    |
| `IMAGE_HOTSPOTS`      | Identificar zonas en imagen             |
| `TEXT_REGEX`          | Respuesta de texto con validación regex |
| `VIDEO_TRUE_FALSE`    | Video + cuestionario V/F                |
| `VIDEO_TEXT_REGEX`    | Video + respuesta texto                 |
| `VM_TEXT_REGEX`       | Máquina virtual + validación            |
| `UPLOAD`              | Subida de archivos                      |

## Configuración

### Habilitar/Deshabilitar Seeders

En `seeder.config.ts`:

```typescript
export const SEEDER_CONFIG = {
  ENABLED: {
    USERS: true,
    COURSES: true,
    UNITS: true,
    // ... etc
  },
  ORDER: {
    USERS: 1,
    COURSES: 2,
    // ... etc
  },
};
```

### Variables de Entorno

| Variable   | Default | Descripción                                     |
| ---------- | ------- | ----------------------------------------------- |
| `NODE_ENV` | -       | Si no es `development`, el seeder no se ejecuta |

## Esquemas JSON

Cada archivo de datos tiene un esquema correspondiente en `inputs/schemas/` que proporciona:

- **Validación en IDE**: Autocompletado y verificación en tiempo real
- **Documentación**: Descripción de cada campo
- **Restricciones**: Rangos válidos, patrones, enums permitidos

Para activar la validación, incluye la referencia al schema en el archivo JSON:

```json
{
  "$schema": "../schemas/activities.schema.json",
  "data": [...]
}
```

## Archivos Multimedia

Los archivos multimedia de prueba se colocan en `inputs/files/`:

- `sample-image-1.png` - Imagen de ejemplo para actividades `IMAGE_*`
- `sample-video-1.mp4` - Video de ejemplo para actividades `VIDEO_*`
- `sample-video-2.mp4` - Video adicional

Estos archivos se suben automáticamente a MinIO durante el seeding.

## Datos de Prueba Incluidos

### Cursos (3)

| ID     | Nombre                       | Participación | Equipos            |
| ------ | ---------------------------- | ------------- | ------------------ |
| CS101  | Introduction to Programming  | Individual    | No                 |
| WEB201 | Web Development Fundamentals | Team          | LEARNER_MANAGED    |
| DB301  | Database Systems             | Team          | INSTRUCTOR_MANAGED |

### Unidades (6)

- **CS101**: Programming Basics, Control Flow, Functions and Modularity
- **WEB201**: HTML Fundamentals, CSS Styling
- **DB301**: SQL Basics

### Actividades (12)

Cubren todos los tipos de actividad disponibles, con diferentes configuraciones de:

- Dificultad (0-4)
- Política de reintentos (MAX, MEAN)
- Prerrequisitos
- Penalizaciones

### Equipos (4)

- **WEB201**: Alpha Team, Beta Team (gestionados por estudiantes)
- **DB301**: Group 1 - SQL Masters, Group 2 - Data Modelers (gestionados por instructor)

## Troubleshooting

### Error: Check constraint violation

Si ves errores como:

```
violates check constraint "CHK_..."
```

Verifica que los valores numéricos estén en el rango correcto [0, 1]:

- `unitWeight`
- `incorrectPenaltyFactor`
- `penaltyFactor`

### Error: Activity/Unit/Course not found

Verifica que:

1. El ID de referencia existe en el archivo correspondiente
2. El prefijo del ID es correcto (`unit-`, `activity-`, etc.)
3. El seeder dependiente se ejecutó antes (ver orden de ejecución)

### Los datos no se actualizan

El seeder solo crea registros si no existen. Para forzar recreación:

```bash
# Eliminar volumen de postgres y reiniciar
docker compose -f compose.yml -f compose.dev.yml down -v postgres backend
docker compose -f compose.yml -f compose.dev.yml up -d postgres backend
```

## Contribuir

Al agregar nuevos datos de prueba:

1. Actualiza el archivo JSON correspondiente en `inputs/data/`
2. Verifica que el esquema JSON refleje la estructura
3. Usa IDs de referencia consistentes con las convenciones
4. Documenta nuevas relaciones en este README
5. Ejecuta `npm run qa:compile` para verificar
6. Reinicia docker para probar el seeding completo
