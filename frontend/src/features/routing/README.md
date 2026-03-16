# composePage

Wrapper para crear páginas protegidas con configuraciones para el sidebar y control de acceso.

## Uso

```tsx
import { composePage } from '@/features/routing';
import { BookOpen } from 'lucide-react';

export default composePage({
  component: SomePage,
  access: { roles: [Role.USER, Role.ADMIN] },
  sidebar: { labelKey: 'sidebar.somePage', icon: BookOpen, order: 30 },
});

function SomePage() {
  return <div>Contenido protegido</div>;
}
```

## Propiedades

| Propiedad          | Descripción                          |
| ------------------ | ------------------------------------ |
| `component`        | El componente de página a renderizar |
| `access.roles`     | Array de roles permitidos (`Role.*`) |
| `sidebar.labelKey` | Clave i18n para el menú              |
| `sidebar.icon`     | Componente de icono (lucide-react)   |
| `sidebar.order`    | Orden en el sidebar                  |

## ⚠️ Importante: config inline obligatorio

El generador de rutas usa análisis estático (AST), **no ejecuta código**. Solo detecta configuración escrita directamente en `composePage()`:

```tsx
// ✅ Funciona
export default composePage({
  access: { roles: [Role.ADMIN] },
  component: Page,
});

// ❌ NO funciona - el generador no lo detecta
const config = { access: { roles: [Role.ADMIN] }, component: Page };
export default composePage(config);
```

## Regenerar rutas

```bash
npm run routes:generate
```

Genera `route-registry.generated.ts` y `pathnames.generated.ts`.
