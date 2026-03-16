# Módulo de Validación i18n (`i18n-validator`)

## Descripción General

El módulo de **Validación i18n** (`I18nValidatorModule`) proporciona herramientas para verificar la integridad y completitud de las traducciones en la plataforma Kotrip. Detecta claves faltantes, traducciones sin usar y inconsistencias entre idiomas.

---

## Arquitectura del Módulo

```
i18n-validator/
├── i18n-validator.module.ts      # Módulo principal
├── i18n-validator.controller.ts  # Endpoints de validación
├── i18n-validator.service.ts     # Lógica de validación
└── interfaces/
    └── missing-translation.interface.ts  # Tipos
```

---

## Capacidades

### Detección de Problemas

| Tipo                 | Descripción                                           |
| -------------------- | ----------------------------------------------------- |
| **Claves faltantes** | Claves en idioma base que no existen en otros idiomas |
| **Claves huérfanas** | Claves que existen pero no se usan en el código       |
| **Valores vacíos**   | Claves con valor vacío o placeholder                  |
| **Inconsistencias**  | Diferencias en parámetros interpolados                |

### Idiomas Soportados

| Código | Idioma         |
| ------ | -------------- |
| `es`   | Español (base) |
| `en`   | Inglés         |
| `gl`   | Gallego        |

---

## Servicio Principal: `I18nValidatorService`

### Métodos Disponibles

```typescript
class I18nValidatorService {
  // Obtener todas las claves faltantes
  async getMissingTranslations(): Promise<MissingTranslation[]>;

  // Verificar un idioma específico
  async validateLanguage(lang: string): Promise<ValidationReport>;

  // Buscar claves no utilizadas en el código
  async findUnusedKeys(): Promise<string[]>;

  // Verificar consistencia de parámetros
  async checkInterpolationConsistency(): Promise<InconsistencyReport[]>;
}
```

### Estructura de Archivos i18n

```
backend/src/i18n/
├── es/
│   ├── error.json     # Mensajes de error
│   ├── valid.json     # Mensajes de validación
│   └── example.json   # Ejemplos/demos
└── en/
    ├── error.json
    ├── valid.json
    └── example.json
```

---

## API Endpoints

| Método | Endpoint         | Descripción                    |
| ------ | ---------------- | ------------------------------ |
| GET    | `/i18n/validate` | Reporte completo de validación |
| GET    | `/i18n/missing`  | Solo claves faltantes          |
| GET    | `/i18n/unused`   | Solo claves sin usar           |
| GET    | `/i18n/stats`    | Estadísticas de cobertura      |

### Ejemplo de Respuesta: `/i18n/validate`

```json
{
  "summary": {
    "totalKeys": 245,
    "missingKeys": 3,
    "unusedKeys": 12,
    "emptyValues": 1,
    "coveragePercent": {
      "es": 100,
      "en": 98.8
    }
  },
  "missing": [
    {
      "key": "error.TEAM_LOCKED",
      "missingIn": ["en"],
      "existsIn": ["es"],
      "baseValue": "El equipo está bloqueado"
    }
  ],
  "unused": ["error.DEPRECATED_FEATURE", "valid.OLD_FORMAT"],
  "empty": [
    {
      "key": "example.PLACEHOLDER",
      "language": "en"
    }
  ]
}
```

---

## Flujos de Validación

### Flujo: Detección de Claves Faltantes

```
1. Cargar todos los archivos JSON de i18n/es/ (idioma base)
2. Cargar todos los archivos JSON de i18n/en/
3. Para cada clave en ES:
   └── Si no existe en EN: registrar como faltante
4. Retornar lista de faltantes con contexto
```

### Flujo: Detección de Claves Sin Usar

```
1. Cargar todas las claves de i18n/
2. Escanear código fuente buscando:
   ├── this.i18n.t('clave')
   ├── i18n.translate('clave')
   └── @I18n('clave')
3. Comparar claves encontradas vs definidas
4. Retornar claves sin referencias
```

### Flujo: Verificación de Interpolación

```
1. Para cada clave con parámetros {param}:
   ├── Extraer parámetros del valor base
   └── Verificar que todos los idiomas tienen los mismos parámetros
2. Reportar inconsistencias
```

---

## Integración con CI/CD

### Script de Validación

```bash
# Ejecutar validación como parte del build
npm run i18n:validate

# Falla si hay claves faltantes
npm run i18n:validate --strict
```

### GitHub Action

```yaml
- name: Validate Translations
  run: |
    npm run i18n:validate
    if [ $? -ne 0 ]; then
      echo "Translation validation failed"
      exit 1
    fi
```

---

## Configuración

### Variables de Entorno

| Variable             | Descripción          | Default       |
| -------------------- | -------------------- | ------------- |
| `I18N_BASE_LANGUAGE` | Idioma de referencia | `es`          |
| `I18N_STRICT_MODE`   | Fallar en faltantes  | `false`       |
| `I18N_SCAN_PATHS`    | Paths a escanear     | `src/**/*.ts` |

---

## Uso con nestjs-i18n

Este módulo complementa `nestjs-i18n`:

```typescript
// Configuración en app.module.ts
I18nModule.forRoot({
  fallbackLanguage: 'es',
  loaderOptions: {
    path: path.join(__dirname, '/i18n/'),
    watch: true,
  },
}),
```

### Uso en Servicios

```typescript
@Injectable()
export class MyService {
  constructor(private readonly i18n: I18nService) {}

  async doSomething() {
    // Traducción con parámetros
    const message = await this.i18n.t('error.NOT_FOUND', {
      args: { entity: 'Usuario' },
    });

    throw new NotFoundException(message);
  }
}
```

---

## Troubleshooting

### "Key not found" en runtime

1. Verificar que la clave existe en el idioma base.
2. Ejecutar `GET /i18n/validate` para ver estado.
3. Reiniciar el servidor si se añadieron claves nuevas.

### Claves reportadas como "unused" pero sí se usan

- Verificar que el patrón de uso coincide con el escaneo.
- Claves dinámicas (`i18n.t(variable)`) no se detectan.
- Añadir comentario `// i18n-used: clave` para marcar manualmente.

---

## Dependencias

### Internas

- `@/i18n/*`: Archivos de traducción.

### Externas

- `nestjs-i18n`: Framework de internacionalización.
- `glob`: Búsqueda de archivos.
- `typescript-parser`: Análisis de código fuente.
