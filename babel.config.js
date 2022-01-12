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
        },
        extensions: [".ts", ".tsx"],
      },
    ],
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-transform-runtime",
    "@babel/plugin-syntax-top-level-await",
  ],
};
