module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["standard-with-typescript", "plugin:prettier/recommended"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: ["tsconfig.json"],
      },
    },
  ],
  rules: {
    "prettier/prettier": 1,
    "no-console": ["error"],
    "eol-last": ["error"],
    "@typescript-eslint/explicit-function-return-type": 0, // prisma delegates are really difficult to handle otherwise.
    "@typescript-eslint/restrict-template-expressions": 0,
    "@typescript-eslint/strict-boolean-expressions": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/ban-ts-ignore": 0,
    "@typescript-eslint/prefer-ts-expect-error": 0,
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
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
  ],
};
