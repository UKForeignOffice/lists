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
  entry: path.resolve(__dirname, "client", "javascript", "main.tsx"),
  output: {
    path: path.resolve(__dirname, "dist", "client"),
    filename: "assets/[name].js",
    publicPath: "",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    modules: [path.resolve(__dirname, "node_modules")],
  },
  node: {
    __dirname: false,
  },
  devtool: "eval-cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: devMode,
              reloadAll: true,
              publicPath: "../../",
            },
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
          name: "assets/images/[name].[ext]",
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: "file-loader",
        options: {
          name: "assets/fonts/[name].[ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "server", "views", "layout.html"),
      filename: "views/layout.html",
      minify: prodMode,
      scriptLoading: "defer",
      inject: "head",
      hash: prodMode,
    }),
    new MiniCssExtractPlugin({
      filename: devMode
        ? "assets/css/[name].css"
        : "assets/css/[name].[hash].css",
      chunkFilename: devMode
        ? "assets/css/[id].css"
        : "assets/css/[id].[hash].css",
    }),
    new CopyPlugin({
      patterns: [
        { from: "server/views", to: "views" },
      ],
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      defaultSizes: "gzip",
      openAnalyzer: false,
    }),
  ],
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
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
    plugins: [
      new TsconfigPathsPlugin(),
    ],
  },
  node: {
    __dirname: false,
  },
  watchOptions: {
    poll: 1000, // enable polling since fsevents are not supported in docker
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  externals: [
    nodeExternals({
      modulesDir: path.resolve(__dirname, "node_modules"),
    }),
  ],
};

module.exports = [
  // client, 
  server
];
