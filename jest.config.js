const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig");

console.log(
  pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  })
);

module.exports = {
  roots: ["<rootDir>"],
  preset: "ts-jest",
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ["/node_modules/"],
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ["json"],
  // The test environment that will be used for testing
  testEnvironment: "node",
  // setupFiles
  setupFiles: ["<rootDir>/.jest/setEnvVars.js"],
  modulePaths: ["<rootDir>"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  moduleDirectories: ["node_modules", "src", "src/server"],
};
