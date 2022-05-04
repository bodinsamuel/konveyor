/* eslint-disable import/no-commonjs */
const config = {
  testEnvironment: 'node',

  displayName: 'konveyor',

  preset: 'ts-jest',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  // extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      diagnostics: false,
      // useESM: true,
    },
  },
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.test.{js,ts}'],
  // moduleNameMapper: {
  //   '^(\\.{1,2}/.*)\\.js$': '$1',
  //   "#(.*)": "<rootDir>/node_modules/$1"
  // },
};
module.exports = config;
