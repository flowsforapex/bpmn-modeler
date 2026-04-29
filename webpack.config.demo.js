const CopyPlugin = require("copy-webpack-plugin");
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
          from: path.resolve(__dirname, "assets/fonts/codicon.ttf"),
          to: "assets/fonts/codicon.ttf",
        },
        {
          from: path.resolve(__dirname, "assets/monaco"),
          to: "assets/monaco",
        },
        {
          from: path.resolve(__dirname, "diagrams"),
          to: "assets/diagrams",
        },
      ],
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
  resolve: {
    alias: {
      'min-dom$': path.resolve(__dirname, 'min-dom-shim.js')
    }
  },
  devtool: "source-map",
  devServer: {
    compress: true,
    port: 8082,
  },
};
