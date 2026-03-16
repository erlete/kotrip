/**
 * @file knip.config.js
 * @description Configuración de Knip para el frontend (Next.js 16 + React 19).

 * @see {@link https://knip.dev/reference/dynamic-configuration} para más información sobre las opciones de configuración.
 * @see {@link https://knip.dev/reference/plugins/next} para la documentación del plugin de Next.js.
 */

/** @type {import("knip").KnipConfig} */
const config = {
  treatConfigHintsAsErrors: true,

  /**
   * Puntos de entrada adicionales (no cubiertos por plugins).
   *
   * El plugin de Next.js detecta automáticamente los archivos del App Router
   * (page, layout, route, not-found, forbidden, unauthorized, error, loading,
   * middleware, instrumentation) y el archivo next.config.ts. Los puntos de
   * entrada declarados aquí corresponden únicamente a scripts y archivos
   * referenciados indirectamente por la configuración de plugins.
   */
  entry: [
    'scripts/**/*.mjs',
    // Referenciado por createNextIntlPlugin() en next.config.ts:
    'src/features/i18n/request.ts',
  ],

  /**
   * Archivos del proyecto a analizar.
   * Se excluyen los archivos generados automáticamente mediante patrones de negación
   * para evitar falsos positivos en los reportes de exportaciones no utilizadas.
   */
  project: [
    'scripts/**/*.{cjs,js,mjs}',
    'src/**/*.{ts,tsx}',
    '!src/**/*.generated.{ts,tsx}',
  ],

  /**
   * Dependencias referenciadas indirectamente o usadas por plugins/compiladores
   * que Knip no puede detectar estáticamente.
   */
  ignoreDependencies: [
    // Usado por el compilador de React (configurado en next.config.ts vía reactCompiler: true):
    'babel-plugin-react-compiler',
    // Dependencia peer requerida por React/Next.js, no importada directamente en código de usuario:
    'react-dom',
    '@types/react-dom',
    // Usado internamente por Next.js para compilación de módulos SCSS:
    'sass',
    // Paquete de workspace con re-exportaciones (knip no lo detecta automáticamente):
    '@kotrip/data',
    // Dependencia peer de @tiptap/starter-kit y @tiptap/react:
    '@tiptap/pm',
    // Importación condicional en scripts (fallback para entornos sin fetch nativo):
    'node-fetch',
    // Usado en componente combobox (archivo aún no integrado en rutas activas):
    '@base-ui/react',
  ],

  /**
   * Binarios referenciados en scripts de npm que Knip no puede resolver
   * automáticamente en el contexto de un monorepo con workspaces.
   */
  ignoreBinaries: ['next', 'run-s', 'tsc', 'eslint', 'knip', 'nodemon'],

  /**
   * Exportaciones de tipos e interfaces consumidas en el mismo archivo donde
   * se declaran no se reportan como no utilizadas.
   */
  ignoreExportsUsedInFile: {
    interface: true,
    type: true,
  },

  // region Plugins
  // El plugin de Next.js se activa automáticamente por la dependencia `next`.
  // El plugin de TypeScript se activa automáticamente por `typescript`.

  eslint: {
    config: ['eslint.config.mjs'],
  },
};

export default config;
