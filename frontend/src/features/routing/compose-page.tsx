import { ServerAuthGuard } from '@/features/auth';
import { ComponentType } from 'react';
import { AccessConfig, SidebarConfig } from './types';

type PageConfig<P extends object> = {
  component: ComponentType<P>;
  access?: AccessConfig;
  sidebar?: SidebarConfig;
};

/**
 * Compone un componente de página de Next.js con configuración de acceso y/o sidebar.
 *
 * Si se proporciona configuración de `access` con roles específicos, envuelve el
 * componente con `ServerAuthGuard` para verificación de roles. De lo contrario,
 * renderiza el componente directamente (asumiendo que el layout padre ya maneja
 * la autenticación básica).
 *
 * Adjunta `access` y `sidebar` como propiedades estáticas para la generación
 * del registro de rutas.
 *
 * @template P - El tipo de props del componente de página
 * @param config - El objeto de configuración de la página
 * @param config.access - Configuración de acceso opcional con roles permitidos
 * @param config.sidebar - Configuración de sidebar opcional para renderizado de navegación
 * @param config.component - El componente de página a envolver
 * @returns Un componente de servidor con propiedades estáticas `access` y `sidebar`
 *
 * @example
 * ```tsx
 * // app/(protected)/dashboard/page.tsx
 * import { composePage } from '@/lib/compose-page'
 *
 * export default composePage({
 *   access: { roles: [Role.Admin, Role.Manager] },
 *   sidebar: { labelKey: 'sidebar.dashboard', icon: LayoutDashboard, order: 1 },
 *   component: DashboardViewPage
 * })
 * ```
 */
export function composePage<P extends object>(pageConfig: PageConfig<P>) {
  const { access, sidebar, component: Component } = pageConfig;

  // Solo envolver con ServerAuthGuard si hay roles específicos a verificar.
  // La autenticación básica (require="auth") ya está manejada por el layout
  // padre en app/(main)/(protected)/layout.tsx, evitando llamadas duplicadas
  // a getSession() que pueden causar inconsistencias.
  const needsRoleGuard = access?.roles && access.roles.length > 0;

  async function Page(props: P) {
    if (needsRoleGuard) {
      return (
        <ServerAuthGuard roles={access?.roles}>
          <Component {...props} />
        </ServerAuthGuard>
      );
    }
    return <Component {...props} />;
  }

  Page.access = access;
  Page.sidebar = sidebar;

  return Page;
}
