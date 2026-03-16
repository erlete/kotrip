/**
 * @file jest.config.mjs
 * @description Configuración de Jest para tests unitarios de proyectos basados en NestJS.


 * @see {@link https://jestjs.io/docs/configuration} para más información sobre las opciones de configuración.
 */

/** @type {import("@jest/types").Config.InitialOptions} */
const config = {
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '(/src/.*|/test/.*)\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
  ],
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: false,
            decorators: true,
          },
          transform: {
            decoratorMetadata: true,
          },
          target: 'es2021',
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/content/(.*)$': '<rootDir>/src/modules/content/$1',
    '^@/delivery/(.*)$': '<rootDir>/src/modules/delivery/$1',
    '^@/user/(.*)$': '<rootDir>/src/modules/user/$1',
    '^@/common/(.*)$': '<rootDir>/src/common/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
