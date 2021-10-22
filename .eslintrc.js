module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["standard-with-typescript", "prettier"],
  parserOptions: {
    project: "tsconfig.json",
  },
  rules: {
    "no-console": ["error"],
    "eol-last": ["error"],
    "@typescript-eslint/restrict-template-expressions": 0,
  },
  ignorePatterns: [
    "playground/",
    "dist/",
    ".eslintrc.js",
    "babel.config.js",
    "commitlint.config.js",
    "jest.config.js",
    "webpack.config.js",
    "src/form-runner/form-runner-app/",
  ],
};
