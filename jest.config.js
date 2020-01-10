// eslint-disable-next-line import/no-commonjs
module.exports = {
  testEnvironment: 'node',

  name: 'unit',
  displayName: 'konveyor',

  preset: 'ts-jest',
  testMatch: ['<rootDir>/src/**/*.test.ts'],

  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.test.{js,ts}'],
};
