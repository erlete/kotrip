import { Role } from '@kotrip/data';
import { ROUTE_REGISTRY } from './route-registry.generated';
import type { RouteRegistryEntry, SidebarRoute } from './types';

/**
 * Normaliza una ruta eliminando barras finales.
 *
 * @param path - Ruta a normalizar.
 * @returns Ruta normalizada sin barra final.
 */
const normalizePath = (path: string) => {
  if (!path) return '/';
  const normalized = path.replace(/\/+$/, '');
  return normalized.length === 0 ? '/' : normalized;
};

const compareSidebar = (a: SidebarRoute, b: SidebarRoute) => {
  const orderA = a.sidebar.order ?? 0;
  const orderB = b.sidebar.order ?? 0;
  if (orderA !== orderB) return orderA - orderB;
  return a.sidebar.labelKey.localeCompare(b.sidebar.labelKey);
};

const findParentPath = (
  entry: RouteRegistryEntry,
  nodesByPath: Map<string, SidebarRoute>,
) => {
  const normalizedChild = normalizePath(entry.path);
  const candidateParents = Array.from(nodesByPath.keys()).filter((path) =>
    normalizedChild.startsWith(`${normalizePath(path)}/`),
  );

  if (candidateParents.length === 0) return undefined;
  return candidateParents.sort((a, b) => b.length - a.length)[0];
};

/**
 * Obtiene las rutas de sidebar permitidas para un rol, organizadas en arbol.
 *
 * Filtra las rutas del registro segun el rol proporcionado, las organiza
 * jerarquicamente por su path y las ordena segun la propiedad `order`.
 *
 * @param role - Rol del usuario.
 * @param routes - Registro de rutas (por defecto el generado automaticamente).
 * @returns Arbol de rutas de sidebar permitidas para el rol.
 */
export const getSidebarRoutesForRole = (
  role: Role,
  routes: RouteRegistryEntry[] = ROUTE_REGISTRY,
): SidebarRoute[] => {
  const allowedEntries = routes.filter((route) => {
    if (!route.sidebar) return false;
    const roles = route.access?.roles;
    if (!roles || roles.length === 0) return true;
    return roles.includes(role);
  });

  const nodes = allowedEntries.map((entry) => ({
    path: entry.path,
    sidebar: entry.sidebar!,
    children: [] as SidebarRoute[],
  }));

  const nodesByPath = new Map<string, SidebarRoute>(
    nodes.map((node) => [node.path, node]),
  );
  const roots: SidebarRoute[] = [];

  nodes.forEach((node) => {
    const parentPath = findParentPath(
      allowedEntries.find((entry) => entry.path === node.path)!,
      nodesByPath,
    );

    if (parentPath && nodesByPath.has(parentPath)) {
      nodesByPath.get(parentPath)!.children?.push(node);
      return;
    }

    roots.push(node);
  });

  const sortTree = (items: SidebarRoute[]) => {
    items.sort(compareSidebar);
    items.forEach((item) => {
      if (item.children?.length) sortTree(item.children);
    });
  };

  sortTree(roots);
  return roots;
};
