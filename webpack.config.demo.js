const CopyPlugin = require("copy-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    bundle: [path.resolve(__dirname, "index.js")],
  },
  output: {
    path: path.resolve(__dirname, "demo"),
    filename: "bundle.js",
    library: "bpmnModeler",
    libraryTarget: "var",
    libraryExport: "default",
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "demo.html"),
          to: "./index.html",
        },
        {
          from: path.resolve(__dirname, "assets/css/flows4apex.modeler.css"),
          to: "assets/css/flows4apex.modeler.css",
        },
        {
          from: path.resolve(__dirname, "node_modules/bpmn-js/dist/assets"),
          to: "assets/bpmn-js",
        },
        {
          from: path.resolve(
            __dirname,
            "node_modules/bpmn-js-properties-panel/dist/assets"
          ),
          to: "assets/bpmn-js-properties-panel",
        },
        {
          from: path.resolve(
            __dirname,
            "node_modules/bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css"
          ),
          to: "assets/bpmn-js-bpmnlint",
        },
      ],
    }),
    new MonacoWebpackPlugin({
      languages: ["sql", "json", "html"],
    }),
  ],
  devtool: "source-map",
  devServer: {
    compress: true,
    port: 8082,
  },
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
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"],
      },
    ],
  },
};
