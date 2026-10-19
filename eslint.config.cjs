const js = require("@eslint/js");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const importPlugin = require("eslint-plugin-import-x");
const nodePlugin = require("eslint-plugin-n");
const prettierConfig = require("eslint-plugin-prettier/recommended");
const promisePlugin = require("eslint-plugin-promise");
const globals = require("globals");

const typescriptBase = typescriptPlugin.configs["flat/base"];

// Keep the project's ESLint 8 recommended-rule baseline across newer ESLint releases.
const postEslint8RecommendedAdditions = [
  "for-direction",
  "getter-return",
  "no-constant-binary-expression",
  "no-dupe-else-if",
  "no-empty-static-block",
  "no-new-native-nonconstructor",
  "no-nonoctal-decimal-escape",
  "no-setter-return",
  "no-unsafe-optional-chaining",
  "no-unused-labels",
  "no-unused-private-class-members",
  "require-yield",
  "no-unassigned-vars",
  "no-useless-assignment",
  "preserve-caught-error",
];
const eslint8RecommendedRules = { ...js.configs.recommended.rules };
for (const rule of postEslint8RecommendedAdditions) {
  delete eslint8RecommendedRules[rule];
}

// Preserve Standard's rules outside eslint:recommended; Prettier below disables
// the stylistic rules it replaces.
const standardRules = {
  "no-var": "warn",
  "object-shorthand": ["warn", "properties"],
  "accessor-pairs": ["error", { setWithoutGet: true, enforceForClassMembers: true }],
  "array-callback-return": ["error", { allowImplicit: false, checkForEach: false }],
  camelcase: ["error", { allow: ["^UNSAFE_"], properties: "never", ignoreGlobals: true }],
  "default-case-last": "error",
  "dot-notation": ["error", { allowKeywords: true }],
  eqeqeq: ["error", "always", { null: "ignore" }],
  "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
  "new-cap": [
    "error",
    {
      newIsCap: true,
      capIsNew: false,
      properties: true,
      newIsCapExceptions: [],
      capIsNewExceptions: [],
    },
  ],
  "no-array-constructor": "error",
  "no-caller": "error",
  "no-eval": "error",
  "no-extend-native": "error",
  "no-extra-bind": "error",
  "no-implied-eval": "error",
  "no-iterator": "error",
  "no-labels": ["error", { allowLoop: false, allowSwitch: false }],
  "no-lone-blocks": "error",
  "no-multi-str": "error",
  "no-new": "error",
  "no-new-func": "error",
  "no-new-object": "error",
  "no-new-symbol": "error",
  "no-new-wrappers": "error",
  "no-octal-escape": "error",
  "no-proto": "error",
  "no-return-assign": ["error", "except-parens"],
  "no-self-compare": "error",
  "no-sequences": "error",
  "no-template-curly-in-string": "error",
  "no-throw-literal": "error",
  "no-undef-init": "error",
  "no-unmodified-loop-condition": "error",
  "no-unneeded-ternary": ["error", { defaultAssignment: false }],
  "no-unreachable-loop": "error",
  "no-empty": ["error", { allowEmptyCatch: true }],
  "no-constant-condition": ["error", { checkLoops: false }],
  "no-redeclare": ["error", { builtinGlobals: false }],
  "valid-typeof": ["error", { requireStringLiterals: true }],
  "no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }],
  "no-use-before-define": ["error", { functions: false, classes: false, variables: false }],
  "no-useless-call": "error",
  "no-useless-computed-key": "error",
  "no-useless-constructor": "error",
  "no-useless-rename": "error",
  "no-useless-return": "error",
  "no-void": "error",
  "one-var": ["error", { initialized: "never" }],
  "prefer-const": ["error", { destructuring: "all" }],
  "prefer-promise-reject-errors": "error",
  "prefer-regex-literals": ["error", { disallowRedundantWrapping: true }],
  "spaced-comment": [
    "error",
    "always",
    {
      line: { markers: ["*package", "!", "/", ",", "="] },
      block: {
        balanced: true,
        markers: ["*package", "!", ",", ":", "::", "flow-include"],
        exceptions: ["*"],
      },
    },
  ],
  "symbol-description": "error",
  "unicode-bom": ["error", "never"],
  yoda: ["error", "never"],
  "import/export": "error",
  "import/first": "error",
  "import/no-absolute-path": ["error", { esmodule: true, commonjs: true, amd: false }],
  "import/no-duplicates": "error",
  "import/no-named-default": "error",
  "import/no-webpack-loader-syntax": "error",
  "n/handle-callback-err": ["error", "^(err|error)$"],
  "n/no-callback-literal": "error",
  "n/no-deprecated-api": "error",
  "n/no-exports-assign": "error",
  "n/no-new-require": "error",
  "n/no-path-concat": "error",
  "n/process-exit-as-throw": "error",
  "promise/param-names": "error",
};

module.exports = [
  {
    ignores: [
      "playground/**",
      "dist/**",
      "eslint.config.cjs",
      "babel.config.js",
      "commitlint.config.js",
      "jest.config.js",
      "webpack.config.js",
      "src/form-runner/form-runner-app/**",
      "src/**/*.spec.ts",
      "src/**/*.test.ts",
    ],
  },
  {
    ...js.configs.recommended,
    rules: eslint8RecommendedRules,
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.es2021,
        ...globals.node,
        document: "readonly",
        navigator: "readonly",
        window: "readonly",
      },
    },
    plugins: {
      import: importPlugin,
      n: nodePlugin,
      promise: promisePlugin,
    },
    rules: standardRules,
  },
  {
    ...typescriptBase,
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ...typescriptBase.languageOptions,
      parserOptions: {
        ...typescriptBase.languageOptions.parserOptions,
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
  },
  prettierConfig,
  {
    rules: {
      "prettier/prettier": "warn",
      "no-console": "error",
      // Retain the prior explicit rule; Prettier also checks for a final newline.
      "eol-last": "error",
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-use-before-define": "off",
      "no-useless-return": "off",
    },
  },
  {
    linterOptions: {
      // Preserve prior behavior; flat config reports unused disable comments by default.
      reportUnusedDisableDirectives: "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off", // Prisma delegates are difficult to handle otherwise.
      "@typescript-eslint/no-use-before-define": ["warn", { functions: false, classes: false, variables: true }],
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        { "ts-expect-error": "allow-with-description", minimumDescriptionLength: 0 },
      ],
      "@typescript-eslint/no-confusing-void-expression": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/no-misused-promises": ["warn", { checksVoidReturn: false }],
      "@typescript-eslint/return-await": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/promise-function-async": "warn",
    },
  },
];
