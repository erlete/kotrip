# Swagger Lib

Esta librería encapsula todas las operaciones relacionadas con la configuración y funcionamiento de Swagger para un soporte multiaplicación que permita definir, de manera sencilla y directa, las propiedades específicas de la documentación, plugins activos, etc.

## Plugins

Por el momento, la librería soporta los siguientes plugins, localizados en el directorio [`./plugins`](./plugins/):

### Auth Plugin

El [Auth Plugin](./plugins/auth.plugin.ts) proporciona botones en la interfaz de Swagger para autenticar automáticamente como cualquier usuario en la base de datos.

**Características:**

- **Autenticación Rápida**: Botones para autenticarse como cualquier usuario de la BD con un solo clic
- **Vista de Token**: Muestra el token JWT decodificado con información del usuario actual
- **Indicador de Expiración**: Muestra si el token está expirado y el tiempo restante
- **Auto-desactivación en Producción**: Se desactiva automáticamente cuando `NODE_ENV=production`
- **Logging Mejorado**: Proporciona información detallada sobre el estado del plugin y usuarios encontrados

**⚠️ ADVERTENCIA DE SEGURIDAD**: Este plugin solo debe usarse en entornos de desarrollo y staging, ya que expone las credenciales de todos los usuarios en la interfaz de Swagger. **Se desactiva automáticamente en producción.**

**Configuración:** No requiere variables de entorno adicionales. Simplemente se activa en cualquier entorno que no sea producción cuando se habilita en las opciones de setup.

```typescript
await setup(app, {
  plugins: {
    authPlugin: true, // Auto-disabled if NODE_ENV === 'production'
    collapsePlugin: true,
  },
});
```

### Collapse Plugin

El [Collapse Plugin](./plugins/collapse.plugin.ts) añade botones para colapsar/expandir todos los endpoints de Swagger de una vez.

**Características:**

- **Botón "Collapse All"**: Colapsa todos los endpoints visibles
- **Botón "Expand All"**: Expande todos los endpoints visibles
- **Interfaz Intuitiva**: Botones ubicados en la parte superior para fácil acceso

**Nota**: Este plugin se incluye automáticamente cuando el Auth Plugin está activo, pero también puede usarse de forma independiente.

## Uso

Para hacer uso de las funcionalidades de la librería solo es necesario importar la función `setup`, definida en [el archivo de funciones](./functions.ts). Proporcionando las opciones que la aplicación requiera, se podrán personalizar los aspectos de la configuración final.

### Ejemplo

> [!NOTE] Las rutas de importación pueden variar entre aplicaciones.

```typescript
import { setup } from '@/lib/swagger';

// ...

setup(app, {
  title: 'Documentación de Ejemplo',
  description: 'Descripción de la Documentación de Ejemplo para la API',
  endpoint: 'docs',
  plugins: {
    authPlugin: true,
    collapsePlugin: true,
    // ...
  },
});
```
