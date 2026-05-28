import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['.output/**', '.wxt/**', 'node_modules/**', 'public/**', 'design/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
    languageOptions: {
      globals: {
        chrome: 'readonly',
        browser: 'readonly',
        defineBackground: 'readonly',
        defineContentScript: 'readonly',
        defineAppConfig: 'readonly',
      },
    },
  },
  prettier,
];
