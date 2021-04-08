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
    "@typescript-eslint/restrict-template-expressions": false,
  },
  ignorePatterns: ["playground/", "dist/", ".eslintrc.js", "jest.config.js"],
};
