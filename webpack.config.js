const path = require("path");
const dotenv = require("dotenv");
const CopyPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const NodemonPlugin = require("nodemon-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

dotenv.config();

const devMode = process.env.NODE_ENV !== "production";
const prodMode = process.env.NODE_ENV === "production";
const environment = prodMode ? "production" : "development";
const isDockerCompose = process.env.DOCKER_COMPOSE === "true";

console.log("Webpack Starting", { devMode, prodMode, isDockerCompose });

const client = {
  target: ["web", "es5"],
  mode: environment,
  watch: devMode,
  watchOptions: {
    poll: 300,
    ignored: /node_modules/,
  },
  entry: path.resolve(__dirname, "src", "client", "main.ts"),
  output: {
    path: path.resolve(__dirname, "dist", "client"),
    filename: "main.js",
    publicPath: "/assets/",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    modules: ["node_modules"],
  },
  node: {
    __dirname: false,
  },
  devtool: "cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                outputStyle: "expanded",
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: devMode ? "styles/[name].css" : "styles/[name].css",
      chunkFilename: devMode ? "styles/[id].css" : "styles/[id].css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "server", "views"),
          to: "../views",
        },
      ],
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      defaultSizes: "gzip",
      openAnalyzer: false,
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: "write-references",
      },
    }),
  ],
};

const server = {
  target: "node",
  mode: environment,
  watch: devMode,
  entry: path.resolve(__dirname, "src", "server", "index.ts"),
  devtool: "cheap-module-source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    modules: ["node_modules"],
    plugins: [new TsconfigPathsPlugin()],
  },
  node: {
    __dirname: false,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    ...(devMode
      ? [
          new NodemonPlugin({
            verbose: true,
            watch: path.resolve("./dist"),
            ext: "js,html,json",
            legacyWatch: isDockerCompose,
            nodeArgs: [
              `--inspect${isDockerCompose ? "=0.0.0.0 --nolazy" : ""}`,
            ],
          }),
        ]
      : []),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: "write-references",
      },
    }),
  ],
  externals: [
    nodeExternals({
      modulesDir: "node_modules",
    }),
  ],
};

module.exports = [client, server];
