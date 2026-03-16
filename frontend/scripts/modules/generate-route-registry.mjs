import fs from 'node:fs';
import path, { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import format from '../../../scripts/modules/format.mjs';

/**
 * Directorio del paquete frontend, resuelto a partir de la ubicación del script.
 */
const FRONTEND_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

const appDir = resolve(FRONTEND_DIR, 'src', 'app');
const outputFile = resolve(
  FRONTEND_DIR,
  'src',
  'features',
  'routing',
  'route-registry.generated.ts',
);
const pathnamesOutputFile = resolve(
  FRONTEND_DIR,
  'src',
  'features',
  'routing',
  'pathnames.generated.ts',
);

/**
 * Normaliza una lista de segmentos en una ruta con formato de URL.
 *
 * @param {string[]} segments - Segmentos de la ruta.
 * @returns {string} Ruta normalizada con barra inicial.
 */
const normalizePath = (segments) => {
  if (segments.length === 0) return '/';
  return `/${segments.join('/')}`;
};

/**
 * Determina si un segmento de ruta es un grupo de Next.js (envuelto en paréntesis).
 *
 * @param {string} segment - Segmento a evaluar.
 * @returns {boolean} `true` si el segmento es un grupo.
 */
const isGroupSegment = (segment) =>
  segment.startsWith('(') && segment.endsWith(')');

/**
 * Obtiene la ruta de la URL a partir de la ubicación del archivo `page.tsx`.
 *
 * @param {string} filePath - Ruta absoluta del archivo.
 * @returns {string} Ruta de la URL correspondiente.
 */
const getRoutePathFromFile = (filePath) => {
  const relativePath = path.relative(appDir, filePath);
  const segments = relativePath.split(path.sep);
  const filename = segments.pop();

  const baseName = filename
    ? path.basename(filename, path.extname(filename))
    : undefined;

  const filtered = segments.filter((segment) => !isGroupSegment(segment));
  const routeSegments = filtered.filter(Boolean);

  if (baseName && baseName !== 'page') {
    routeSegments.push(baseName);
  }

  return normalizePath(routeSegments);
};

/**
 * Extrae el valor de un nodo literal del AST de TypeScript.
 *
 * @param {import('typescript').Node} node - Nodo del AST.
 * @returns {string | number | boolean | undefined} Valor extraído o `undefined` si no es un literal reconocido.
 */
const parseLiteral = (node) => {
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  return undefined;
};

/**
 * Extrae el nombre del ícono de un nodo del AST.
 *
 * @param {import('typescript').Node} node - Nodo del AST.
 * @returns {string | undefined} Nombre del ícono o `undefined`.
 */
const parseIcon = (node) => {
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isStringLiteral(node)) return node.text;
  return undefined;
};

/**
 * Extrae un token de rol de un nodo del AST (por ejemplo, `Role.ADMIN`).
 *
 * @param {import('typescript').Node} node - Nodo del AST.
 * @returns {string | undefined} Token de rol o `undefined`.
 */
const parseRoleToken = (node) => {
  if (ts.isPropertyAccessExpression(node)) {
    const left = node.expression;
    if (ts.isIdentifier(left)) {
      return `${left.text}.${node.name.text}`;
    }
  }

  if (ts.isIdentifier(node)) return node.text;
  return undefined;
};

/**
 * Parsea un array literal de roles del AST.
 *
 * @param {import('typescript').Node} node - Nodo del AST.
 * @returns {string[] | undefined} Lista de tokens de roles o `undefined`.
 */
const parseRolesArray = (node) => {
  if (!ts.isArrayLiteralExpression(node)) return undefined;

  return node.elements
    .map((element) => parseRoleToken(element))
    .filter((value) => value !== undefined);
};

/**
 * Parsea un objeto literal del AST, extrayendo propiedades de configuración de página.
 *
 * @param {import('typescript').Node} node - Nodo del AST.
 * @returns {object | undefined} Objeto con las propiedades extraídas o `undefined`.
 */
const parseObjectLiteral = (node) => {
  if (!ts.isObjectLiteralExpression(node)) return undefined;

  const result = {};
  node.properties.forEach((prop) => {
    if (!ts.isPropertyAssignment(prop)) return;

    const name = prop.name;
    const key = ts.isIdentifier(name)
      ? name.text
      : ts.isStringLiteral(name)
        ? name.text
        : undefined;

    if (!key) return;

    if (key === 'roles') {
      const roles = parseRolesArray(prop.initializer);
      if (roles) result.roles = roles;
      return;
    }

    if (key === 'icon') {
      const icon = parseIcon(prop.initializer);
      if (icon) result.icon = { symbol: icon };
      return;
    }

    const value = parseLiteral(prop.initializer);
    if (value !== undefined) result[key] = value;
  });

  return result;
};

/**
 * Extrae la configuración de página (access, sidebar) del archivo fuente TypeScript.
 *
 * Busca un `export default` con una llamada a función cuyo primer argumento sea un objeto literal.
 *
 * @param {import('typescript').SourceFile} sourceFile - Archivo fuente parseado por TypeScript.
 * @returns {{ access: object | undefined, sidebar: object | undefined }} Configuración extraída.
 */
const parsePageConfig = (sourceFile) => {
  for (const statement of sourceFile.statements) {
    // Buscar: export default page({ ... })
    if (!ts.isExportAssignment(statement)) continue;
    if (statement.isExportEquals) continue; // omitir `export =`

    const expr = statement.expression;

    // Verificar si es una expresión de llamada: fn({ ... })
    if (!ts.isCallExpression(expr)) continue;

    // Obtener el primer argumento (el objeto de configuración)
    const configArg = expr.arguments[0];
    if (!configArg || !ts.isObjectLiteralExpression(configArg)) continue;

    const result = { access: undefined, sidebar: undefined };

    for (const prop of configArg.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      if (!ts.isIdentifier(prop.name)) continue;

      const key = prop.name.text;

      if (key === 'access' || key === 'sidebar') {
        result[key] = parseObjectLiteral(prop.initializer);
      }
    }

    return result;
  }

  return { access: undefined, sidebar: undefined };
};

/**
 * Recopila recursivamente todos los archivos `page.ts` o `page.tsx` en un directorio.
 *
 * @param {string} dir - Directorio raíz de búsqueda.
 * @returns {string[]} Lista de rutas absolutas de archivos de página encontrados.
 */
const collectPageFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectPageFiles(fullPath));
      continue;
    }

    if (/^page\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
};

/**
 * Construye el registro de rutas a partir de todos los archivos de página del directorio de la aplicación.
 *
 * @returns {Array<{ path: string, access?: object, sidebar?: object }>} Registro ordenado de rutas.
 */
const buildRegistry = () => {
  const files = collectPageFiles(appDir);
  const registry = [];

  files.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );

    const { access, sidebar } = parsePageConfig(sourceFile);

    if (!access && !sidebar) return;

    registry.push({
      path: getRoutePathFromFile(filePath),
      ...(access ? { access } : {}),
      ...(sidebar ? { sidebar } : {}),
    });
  });

  registry.sort((a, b) => a.path.localeCompare(b.path));
  return registry;
};

/**
 * Escribe el archivo TypeScript del registro de rutas con las importaciones necesarias.
 *
 * @param {Array<{ path: string, access?: object, sidebar?: object }>} entries - Entradas del registro.
 */
const writeRegistry = (entries) => {
  const header = `// Este archivo se genera automáticamente por scripts/modules/generate-route-registry.mjs.\n//! No editar manualmente.\n`;
  const iconSymbols = Array.from(
    new Set(
      entries.map((entry) => entry.sidebar?.icon?.symbol).filter(Boolean),
    ),
  );

  const roleTokens = Array.from(
    new Set(
      entries.flatMap((entry) => entry.access?.roles ?? []).filter(Boolean),
    ),
  );

  const needsUserRoles = roleTokens.some((token) => token.startsWith('Role.'));

  const iconImport = iconSymbols.length
    ? `import { ${iconSymbols.join(', ')} } from 'lucide-react';\n`
    : '';

  const formatAccess = (access) => {
    if (!access) return undefined;
    const parts = [];
    if (access.roles) {
      parts.push(`roles: [${access.roles.join(', ')}]`);
    }
    return `{ ${parts.join(', ')} }`;
  };

  const formatSidebar = (sidebar) => {
    if (!sidebar) return undefined;
    const parts = [];
    if (sidebar.labelKey)
      parts.push(`labelKey: ${JSON.stringify(sidebar.labelKey)}`);
    if (sidebar.icon?.symbol) parts.push(`icon: ${sidebar.icon.symbol}`);
    if (sidebar.order !== undefined) parts.push(`order: ${sidebar.order}`);
    return `{ ${parts.join(', ')} }`;
  };

  const formattedEntries = entries
    .map((entry) => {
      const parts = [`path: ${JSON.stringify(entry.path)}`];
      const access = formatAccess(entry.access);
      const sidebar = formatSidebar(entry.sidebar);
      if (access) parts.push(`access: ${access}`);
      if (sidebar) parts.push(`sidebar: ${sidebar}`);
      return `{ ${parts.join(', ')} }`;
    })
    .join(',\n  ');

  const roleImport = needsUserRoles
    ? `import { Role } from '@kotrip/data';\n`
    : '';

  const content = `${header}
import type { RouteRegistryEntry } from '@/features/routing';
${roleImport}${iconImport}
export const ROUTE_REGISTRY: RouteRegistryEntry[] = [
  ${formattedEntries}
];
`;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, content, 'utf8');
};

/**
 * Escribe el archivo TypeScript de pathnames con todos los paths únicos de la aplicación.
 *
 * @param {string[]} entries - Lista de rutas de la aplicación.
 */
const writePathnames = (entries) => {
  const header = `// Este archivo se genera automáticamente por scripts/modules/generate-route-registry.mjs.\n//! No editar manualmente.\n`;
  const uniquePaths = Array.from(new Set(entries)).sort((a, b) =>
    a.localeCompare(b),
  );

  const body = uniquePaths
    .map(
      (pathname) =>
        `  ${JSON.stringify(pathname)}: ${JSON.stringify(pathname)},`,
    )
    .join('\n');

  const content = `${header}
export const pathnames = {
${body}
} as const;
`;

  fs.mkdirSync(path.dirname(pathnamesOutputFile), { recursive: true });
  fs.writeFileSync(pathnamesOutputFile, content, 'utf8');
};

/**
 * Función principal del módulo.
 *
 * @remarks Genera el registro de rutas y los pathnames a partir de los archivos `page.tsx` presentes en el directorio de la aplicación.
 */
async function main() {
  const registry = buildRegistry();
  writeRegistry(registry);
  const allRoutePaths = collectPageFiles(appDir).map(getRoutePathFromFile);
  writePathnames(allRoutePaths);

  await format([outputFile, pathnamesOutputFile]);

  console.log(`Registro de rutas generado con ${registry.length} entradas.`);
}

// Exportar la función principal como exportación nombrada y por defecto:
export { main, main as default };

// Ejecutar la función principal en invocación directa:
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('Error during execution:', error);
    process.exit(1);
  });
}
