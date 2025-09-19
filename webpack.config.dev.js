const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    "flows4apex.modeler": [path.resolve(__dirname, "index.js")],
  },
  output: {
    path: path.resolve(__dirname, "dev"),
    filename: "[name].js",
    library: "bpmnModeler",
    libraryTarget: "var",
    libraryExport: "default",
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ["sql", "json", "html"],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.bpmnlintrc$/,
        use: [
          {
            loader: "bpmnlint-loader",
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["css-loader"],
      },
      {
        test: /\.ttf$/,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  devtool: "source-map",
};
