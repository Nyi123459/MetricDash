import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  globalTeardown: "<rootDir>/tests/jest.global-teardown.cjs",
};

export default config;
