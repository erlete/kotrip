/**
 * @file eslint.config.mjs
 * @description Configuración de ESLint para proyectos basados en NestJS.


 * @see {@link https://eslint.org/docs/latest/user-guide/configuring} para más información sobre las opciones de configuración.
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';
import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';
import promise from 'eslint-plugin-promise';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").ESLint.ConfigData} */
const config = defineConfig([
  // 0) Ignore generated/compiled stuff
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/documentation/**',
      '**/docs/**',
      '**/.turbo/**',
      '**/.next/**',
      '**/.cache/**',
      '**/*.min.*',
      '**/generated/**',
      '**/*spec.ts',
      'eslint.config.mjs',
      'scripts/**',
      'prettier.config.mjs',
    ],
  },

  // 1) Base JS recommended rules
  eslintJs.configs.recommended,

  // 2) TS recommended sets (syntax + typed)
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // 3) NestJS + TS application rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        ...globals.node,
        ...globals.es2025,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      perfectionist,
      'unused-imports': unusedImports,
      'import-x': importX,
      unicorn,
      promise,
    },
    rules: {
      /* -----------------------------
       * NestJS-specific preferences
       * ----------------------------- */
      'perfectionist/sort-classes': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          groups: [
            'static-property',
            'property',
            'constructor',
            'static-method',
            'method',
          ],
          partitionByComment: true,
        },
      ],

      'perfectionist/sort-objects': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          partitionByComment: true,
          partitionByNewLine: true,
        },
      ],

      'perfectionist/sort-object-types': [
        'error',
        { type: 'alphabetical', order: 'asc', ignoreCase: true },
      ],
      'perfectionist/sort-union-types': [
        'error',
        { type: 'alphabetical', order: 'asc', ignoreCase: true },
      ],

      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: [
            '\\.(module|service|controller|resolver|gateway|guard|pipe|filter|interceptor|decorator|strategy|subscriber|entity|dto|interface|schema|provider)\\.ts$',
            '^index\\.ts$',
            '^.*\\.config\\.(js|ts|mjs|cjs)$',
            '^README\\.md$',
          ],
        },
      ],

      /* -----------------------------
       * TS correctness / runtime safety
       * ----------------------------- */
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      '@typescript-eslint/no-floating-promises': [
        'error',
        { ignoreVoid: true },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',

      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      /* -----------------------------
       * Imports (Prettier owns ordering)
       * ----------------------------- */
      'perfectionist/sort-imports': 'off',
      'import-x/order': 'off',

      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'import-x/no-duplicates': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/first': 'error',

      /* -----------------------------
       * General quality
       * ----------------------------- */
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/no-abusive-eslint-disable': 'error',

      'promise/no-nesting': 'warn',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'error',
    },
  },

  // 4) NestJS plugin presets
  eslintNestJs.configs.flatRecommended,

  // 4.5) IMPORTANT: disable typed-linting for JS/MJS/CJS (must come AFTER NestJS preset)
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      parserOptions: {
        project: false,
        program: null,
      },
      globals: {
        ...globals.node,
        ...globals.es2025,
      },
    },
    rules: {
      // Disable all type-aware rules for JS files
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-array-delete': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/no-meaningless-void-operator': 'off',
      '@typescript-eslint/no-mixed-enums': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-template-expression': 'off',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-unary-minus': 'off',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/prefer-find': 'off',
      '@typescript-eslint/prefer-includes': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/prefer-readonly': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/prefer-reduce-type-parameter': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'off',
      '@typescript-eslint/prefer-return-this-type': 'off',
      '@typescript-eslint/prefer-string-starts-ends-with': 'off',
      '@typescript-eslint/promise-function-async': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      // Disable NestJS type-aware rules
      '@darraghor/nestjs-typed/all-properties-are-whitelisted': 'off',
      '@darraghor/nestjs-typed/all-properties-have-explicit-defined': 'off',
      '@darraghor/nestjs-typed/api-enum-property-best-practices': 'off',
      '@darraghor/nestjs-typed/api-method-should-specify-api-operation': 'off',
      '@darraghor/nestjs-typed/api-property-matches-property-optionality':
        'off',
      '@darraghor/nestjs-typed/controllers-should-supply-api-tags': 'off',
      '@darraghor/nestjs-typed/provided-injected-should-match-factory-parameters':
        'off',
      '@darraghor/nestjs-typed/should-specify-forbid-unknown-values': 'off',
      '@darraghor/nestjs-typed/use-validation-pipe': 'off',
      '@darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator':
        'off',
    },
  },

  // 5) Tests
  {
    files: [
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/__tests__/**/*.ts',
      '**/test/**/*.ts',
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },

  // 6) Don't interfere with Prettier formatting:
  eslintConfigPrettier,
]);

export default config;
