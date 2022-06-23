module.exports = {
  presets: ["@babel/preset-typescript", ["@babel/preset-env"]],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        alias: {
          "client/*": ["client/*"],
          "server/*": ["server/*"],
          "forms/*": ["../docker/apply/forms-json/*"],
        },
        extensions: [".ts", ".tsx", ".json"],
      },
    ],
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-transform-runtime",
    "@babel/plugin-syntax-top-level-await",
  ],
};
