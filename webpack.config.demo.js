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
        },
        {
          from: path.resolve(
            __dirname,
            "assets/css/flows4apex.modeler.font.css"
          ),
        },
        {
          from: path.resolve(
            __dirname,
            "assets/css/flows4apex.modeler.properties-panel.css"
          ),
        },
        {
          from: path.resolve(
            __dirname,
            "node_modules/bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css"
          ),
        },
        {
          from: path.resolve(
            __dirname,
            "node_modules/bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css"
          ),
        },
      ],
    }),
    new MonacoWebpackPlugin({
      languages: ["pgsql", "json"],
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
