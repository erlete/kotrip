# Configuración de la aplicación

Sistema de configuración dinámica que permite personalizar la plataforma Kotrip por despliegue sin modificar el código fuente versionado.

## Funcionamiento general

La configuración se resuelve mediante la **fusión profunda** (_deep merge_) de dos capas:

1. **`app.config.default.ts`** - Valores por defecto de la plataforma, versionados en el repositorio. Contienen la configuración base que se aplica a todos los despliegues.
2. **`app.config.ts`** _(opcional)_ - Sobrecargas específicas del despliegue. Este archivo está excluido del control de versiones (`.gitignore`) y solo necesita declarar las propiedades que deben diferir respecto a los valores por defecto.

El resultado de la fusión se exporta como `appConfig` desde `@/config` y está listo para su consumo por cualquier componente o módulo de la aplicación.

## Resolución dinámica

La importación de `app.config.ts` se realiza de forma **dinámica en tiempo de compilación**:

- Si el archivo `app.config.ts` existe, el bundler (webpack en producción, Turbopack en desarrollo) lo utiliza como fuente de sobrecargas.
- Si el archivo **no existe**, se utiliza automáticamente el módulo de reserva `app.config.empty.ts`, que exporta un objeto vacío. La aplicación funciona correctamente con los valores por defecto.

Este comportamiento se configura mediante alias de resolución en `next.config.ts`.

## Creación de un archivo de configuración personalizado

Para personalizar la plataforma en un despliegue concreto, crear el archivo `app.config.ts` en este directorio con la siguiente estructura:

```typescript
import type { AppConfigOverride } from './config.types';

const config: AppConfigOverride = {
  // Solo incluir las propiedades que se desean sobrecargar.
  // Ejemplo:
  brand: {
    title: 'Mi Plataforma',
  },
  theme: {
    defaultMode: 'dark',
  },
};

export default config;
```

Todas las propiedades son opcionales de forma recursiva (`DeepPartial<AppConfig>`). Las propiedades omitidas heredan el valor definido en `app.config.default.ts`.

## Secciones de configuración

| Sección | Descripción | Estado |
| --- | --- | --- |
| `brand` | Identidad de marca: título, descripción, logotipos y favicon | Integrado |
| `theme` | Tema visual: modo de color, paleta de colores y radio de bordes | Integrado |
| `i18n` | Internacionalización: idioma por defecto e idiomas disponibles | Integrado |
| `contact` | Información de contacto de la organización | Integrado |
| `legal` | URLs de documentos legales (cookies, privacidad) | Integrado |
| `layout` | Comportamiento del layout (sidebar contraído por defecto) | Integrado |
| `typography` | Familia tipográfica y escala de tamaños | Pendiente |
| `spacing` | Escala de espaciado | Pendiente |
| `animation` | Nivel de animación permitido | Pendiente |
| `roles` | Etiquetas de visualización por rol de usuario | Pendiente |

> **Nota:** Los colores y el factor de radio se definen directamente en `src/styles/globals.css` como variables CSS hex. No se requiere generador.

## Estructura de archivos

```
config/
├── app.config.ts          # Sobrecargas por despliegue (gitignored, opcional)
├── app.config.default.ts  # Valores por defecto (versionado)
├── app.config.empty.ts    # Módulo de reserva cuando no existe app.config.ts
├── config.types.ts        # Interfaz AppConfig y tipos asociados
├── config.utils.ts        # Tipos utilitarios (LanguageCode, FooterLogo, etc.)
├── resolve-config.ts      # Lógica de fusión profunda y resolución
├── index.ts               # Punto de entrada público del módulo
└── README.md              # Este archivo
```

## Referencia completa del esquema

Consultar la interfaz `AppConfig` en [`config.types.ts`](./config.types.ts) para la documentación detallada de cada propiedad y sus valores esperados.
