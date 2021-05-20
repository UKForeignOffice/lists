module.exports = {
  roots: ["src"],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ["/node_modules/"],
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "babel",
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ["json", "text"],
  // The test environment that will be used for testing
  testEnvironment: "jsdom",
  // setupFiles
  setupFiles: ["<rootDir>/.jest/setEnvVars.ts"],
  setupFilesAfterEnv: [
    "<rootDir>/.jest/setup.ts",
    "<rootDir>/.jest/extensions.ts",
  ],
  modulePathIgnorePatterns: ["<rootDir>/src/form-runner/form-runner-app"],
};
