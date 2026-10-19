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
          "shared/*": ["shared/*"],
          "scheduler/*": ["scheduler/*"],
        },
        extensions: [".ts", ".tsx"],
      },
    ],
    "@babel/plugin-transform-class-properties",
    "@babel/plugin-transform-object-rest-spread",
    "@babel/plugin-transform-runtime",
  ],
};
