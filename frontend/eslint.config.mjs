import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import i18next from 'eslint-plugin-i18next';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  // Configuración para detectar strings hardcodeados en componentes.
  {
    plugins: {
      i18next,
    },
    rules: {
      'i18next/no-literal-string': [
        'warn',
        {
          // Modo JSX: solo detecta strings en texto JSX y props específicas.
          mode: 'jsx-text-only',
          // Atributos que deben ser traducidos.
          'jsx-attributes': {
            include: ['alt', 'aria-label', 'title', 'placeholder', 'label'],
          },
          // Palabras permitidas sin traducir (técnicas, abreviaturas, etc.).
          words: {
            exclude: [
              '[0-9]+',
              '[A-Z_]+',
              '\\$\\{.*\\}',
              'undefined',
              'null',
              'true',
              'false',
              '.',
              ':',
              '-',
            ],
          },
        },
      ],
    },
  },
]);

export default eslintConfig;
