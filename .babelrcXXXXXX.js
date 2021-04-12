const plugins = [
  [
    "module-resolver",
    {
      root: ["./src"],
      alias: {
        "client/*": ["client/*"],
        "server/*": ["server/*"],
        "services/*": ["services/*"],
      },
      extensions: [".ts", ".tsx"],
    },
  ],
  "@babel/plugin-proposal-class-properties",
  "@babel/plugin-proposal-object-rest-spread",
  "@babel/plugin-transform-runtime",
];

module.exports = {
  env: {
    node: {
      presets: ["@babel/preset-typescript", ["@babel/preset-env"]],
      ignore: ["node_modules", "src/public/**", "**/*.test.*"],
      plugins,
      sourceMaps: true,
    },
    browser: {
      presets: [
        "@babel/preset-typescript",
        [
          "@babel/preset-env",
          {
            targets: {
              browsers: "last 2 versions, ie 10-11",
            },
          },
        ],
      ],
      ignore: ["node_modules"],
      plugins,
      sourceMaps: true,
    },
  },
};
