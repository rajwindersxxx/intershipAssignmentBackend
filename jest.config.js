/* eslint-disable @typescript-eslint/no-require-imports */
const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testMatch: ["**/tests/testModules/*.test.ts"],
  setupFiles: ["<rootDir>tests/jest.setup.ts"],
  globalSetup: '<rootDir>/tests/jest.globalSetup.ts',
  globalTeardown: '<rootDir>/tests/jest.globalTeardown.ts',
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
};
