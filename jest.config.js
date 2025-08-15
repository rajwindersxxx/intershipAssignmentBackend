/* eslint-disable @typescript-eslint/no-require-imports */
const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testMatch: [
    "**/tests/testModules/integration/**/*.test.ts",
    "**/tests/testModules/unit/**/*.test.ts",
  ],
  setupFiles: ["<rootDir>tests/jest.setup.ts"],
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
};
