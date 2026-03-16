/**
 * @file prettier.config.mjs
 * @description Configuración de Prettier global.


 * @see {@link https://prettier.io/docs/configuration} para más información sobre las opciones de configuración.
 * @see {@link https://prettier.io/docs/options#print-width} para entender por qué se utilizan 80 caracteres de ancho de impresión.
 */

/** @type {import("prettier").Config} */
const config = {
  // Opciones generales de formato:
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  printWidth: 80,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,

  // Plugins para funcionalidades adicionales:
  plugins: [
    'prettier-plugin-packagejson',
    '@ianvs/prettier-plugin-sort-imports',
  ],

  // Configuración específica para el plugin de ordenamiento de importaciones:
  importOrderParserPlugins: ['typescript', 'jsx', 'tsx', 'decorators'],

  overrides: [
    // Markdown: ajuste de línea para que coincida con printWidth:
    { files: ['**/*.md', '**/*.mdx'], options: { proseWrap: 'never' } },

    // JSON: forzado de comillas dobles:
    { files: ['**/*.json'], options: { singleQuote: false } },

    // YAML/TOML: flexibilidad de líneas más anchas:
    { files: ['**/*.{yml,yaml,toml}'], options: { printWidth: 100 } },

    // Manifiestos de paquetes: gestor de ordenamiento mediante plugin:
    { files: ['**/package.json'], options: {} },

    // JSX: incremento de legibilidad para listas largas de propiedades:
    { files: ['**/*.{jsx,tsx}'], options: { singleAttributePerLine: true } },
  ],
};

export default config;
