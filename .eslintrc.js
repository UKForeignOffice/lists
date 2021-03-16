module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["standard-with-typescript", "prettier"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "no-console": ["error"],
  },
  ignorePatterns: ["dist/", ".eslintrc.js", "jest.config.js"],
};
