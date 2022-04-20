// eslint-disable-next-line import/no-commonjs
module.exports = {
  extends: [
    'algolia',
    'algolia/typescript',
    'algolia/jest',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],

  env: {
    es6: true,
    jest: true,
  },

  // plugins: ['prettier', '@typescript-eslint', 'import'],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
      impliedStrict: true,
      jsx: true,
    },
    experimentalObjectRestSpread: true,
    ecmaVersion: 2018,
    sourceType: 'module',
  },

  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/ignore': [
      'node_modules',
      '\\.(coffee|scss|css|less|hbs|svg|json)$',
    ],
  },

  rules: {
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/generic-type-naming': 'off',
    'valid-jsdoc': 'off',
    'no-continue': 'off',
  },
};
