/**
 * @file jest.config.mjs
 * @description Configuración de Jest para tests E2E de proyectos basados en NestJS.


 * @see {@link https://jestjs.io/docs/configuration} para más información sobre las opciones de configuración.
 */

/** @type {import("@jest/types").Config.InitialOptions} */
const config = {
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: 'src/.*\\.e2e-spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {}],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: false,
};

export default config;
