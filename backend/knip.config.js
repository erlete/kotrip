/**
 * @file knip.config.js
 * @description Configuración de Knip para el backend (NestJS + TypeORM).

 * @see {@link https://knip.dev/reference/dynamic-configuration} para más información sobre las opciones de configuración.
 * @see {@link https://knip.dev/reference/plugins/nest} para la documentación del plugin de NestJS.
 */

/** @type {import("knip").KnipConfig} */
const config = {
  treatConfigHintsAsErrors: true,

  /**
   * Puntos de entrada de la aplicación.
   *
   * El plugin de NestJS solo lee la configuración del CLI (nest-cli.*.json),
   * por lo que los puntos de entrada de la aplicación deben declararse
   * manualmente. Se incluyen los puntos de entrada principales, el DataSource
   * de TypeORM para migraciones, los archivos de migración, scripts de
   * utilidad y archivos de test.
   */
  entry: [
    // Puntos de entrada principales:
    'src/main.ts',
    'src/app.module.ts',

    // DataSource de TypeORM para migraciones (CLI):
    'src/db/data-source.ts',

    // Migraciones de base de datos (cargadas dinámicamente):
    'src/db/migrations/*.ts',

    // Scripts de utilidad:
    'src/scripts/**/*.ts',

    // Archivos de test:
    'src/**/*.spec.ts',
    'src/**/*.e2e-spec.ts',
  ],

  /**
   * Archivos del proyecto a analizar.
   * Se excluyen los archivos generados automáticamente mediante patrones de negación
   * para evitar falsos positivos en los reportes de exportaciones no utilizadas.
   */
  project: ['src/**/*.ts', '!src/i18n/generated/**'],

  /**
   * Dependencias referenciadas indirectamente o por herramientas externas
   * que Knip no puede detectar estáticamente.
   */
  ignoreDependencies: [
    // Usado por Fastify como transport de logs (referenciado como string en main.ts):
    'pino-pretty',
    // Usado por el builder SWC de NestJS (configurado en nest-cli.*.json vía builder: "swc"):
    '@swc/cli',
    '@swc/core',
    // Driver de PostgreSQL usado por TypeORM en tiempo de ejecución (no importado directamente):
    'pg',
    // Paquetes usados exclusivamente a través de sus binarios en scripts de npm
    // que Knip no resuelve correctamente en configuraciones monorepo por workspace:
    '@compodoc/compodoc',
    '@nestjs/cli',
    'npm-run-all',
    // Paquete de workspace con re-exportaciones (knip no lo detecta automáticamente):
    '@kotrip/data',
    // Dependencia peer de @nestjs/swagger, requerida por Fastify en modo estático:
    '@fastify/static',
    // Dependencia peer de @nestjs/axios (usado en módulo LTI):
    'axios',
    // Dependencia peer de @darraghor/eslint-plugin-nestjs-typed:
    '@typescript-eslint/parser',
    // Usado en lib/conversion (módulo utilitario de conversión de unidades):
    'convert',
    // Dependencia peer de @nestjs/axios, importado para tipos en controladores:
    'fastify',
    // Usado indirectamente por @nestjs/axios (módulo LTI):
    '@nestjs/axios',
  ],

  /**
   * Binarios referenciados en scripts de npm que Knip no puede resolver
   * automáticamente en el contexto de un monorepo con workspaces.
   */
  ignoreBinaries: [
    'ts-node',
    'nest',
    'typeorm',
    'run-s',
    'tsc',
    'compodoc',
    'eslint',
    'jest',
    'knip',
  ],

  /**
   * Exportaciones de tipos e interfaces consumidas en el mismo archivo donde
   * se declaran no se reportan como no utilizadas.
   */
  ignoreExportsUsedInFile: {
    interface: true,
    type: true,
  },

  // region Plugins
  // El plugin de NestJS se activa automáticamente por las dependencias @nestjs/*.
  // Lee los archivos nest-cli.*.json para extraer la colección de schematics.

  nest: {
    config: ['nest-cli.dev.json', 'nest-cli.prod.json'],
  },

  eslint: {
    config: ['eslint.config.mjs'],
  },

  jest: {
    config: ['jest.config.mjs', 'jest.config.e2e.mjs'],
  },
};

export default config;
