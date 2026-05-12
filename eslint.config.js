// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'tests/**',
      '*.config.js',
      '.*rc.js',
      'scripts/**',
      'playwright.config.js',
      'stylelint.config.js',
      '.commitlintrc.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['src/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        fetch: 'readonly',
        Audio: 'readonly',
        MediaRecorder: 'readonly',
        MutationObserver: 'readonly',
        CustomEvent: 'readonly',
        indexedDB: 'readonly',
        STARMUS_BOOTSTRAP: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-redeclare': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
    },
  },
];
