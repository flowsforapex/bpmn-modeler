const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    "flows4apex.modeler": [path.resolve(__dirname, "index.js")],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].min.js",
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
    minimize: true,
  },
  resolve: {
    alias: {
      'min-dom$': path.resolve(__dirname, 'min-dom-shim.js')
    }
  }
};
