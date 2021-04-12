const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const devMode = process.env.NODE_ENV !== "production";
const prodMode = process.env.NODE_ENV === "production";
const environment = prodMode ? "production" : "development";

const client = {
  target: "web",
  mode: environment,
  watch: devMode,
  entry: path.resolve(__dirname, "src", "client", "main.ts"),
  output: {
    path: path.resolve(__dirname, "dist", "client"),
    filename: "main.js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    modules: ["node_modules"],
  },
  node: {
    __dirname: false,
  },
  devtool: "eval-cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              configFile: "tsconfig-client.json",
            },
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {},
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
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        loader: "file-loader",
        options: {
          name: "images/[name].[ext]",
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: "file-loader",
        options: {
          name: "fonts/[name].[ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(
        __dirname,
        "src",
        "server",
        "views",
        "layout.html"
      ),
      filename: "../views/layout.html",
      minify: false,
      scriptLoading: "defer",
      inject: false,
      hash: prodMode,
      publicPath: "/assets/",
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? "styles/[name].css" : "styles/[name].[hash].css",
      chunkFilename: devMode ? "styles/[id].css" : "styles/[id].[hash].css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/server/views",
          to: "../views",
          globOptions: {
            ignore: ["**/layout.html"],
          },
        },
      ],
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: "static",
    //   defaultSizes: "gzip",
    //   openAnalyzer: false,
    // }),
  ],
  externals: [
    nodeExternals({
      modulesDir: "node_modules",
    }),
  ],
};

const server = {
  target: "node",
  mode: environment,
  watch: devMode,
  entry: path.resolve(__dirname, "src", "server", "index.ts"),
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
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  externals: [
    nodeExternals({
      modulesDir: "node_modules",
    }),
  ],
};

module.exports = [
  client, 
  server
];
