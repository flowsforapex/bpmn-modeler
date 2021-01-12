const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  mode: 'development',
  entry: {
    "mtag.bpmnmodeler": [path.resolve(__dirname, "src/index.js")]
  },
  devtool: "source-map",
  optimization: {
    minimize: false
  },
  output: {
    filename: '[name].js',
    library: "bpmnModeler",
    libraryTarget: "var",
    libraryExport: "default"
  },
  module: {
    rules: [
      {
        test: /\.bpmnlintrc$/,
        use: [
          {
            loader: 'bpmnlint-loader',
          }
        ]
      }
    ]
  },
};
