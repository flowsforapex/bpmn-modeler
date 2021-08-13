const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = { 
  entry: {
    "flows4apex.modeler": [path.resolve(__dirname, "index.js")],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].js',
    library: "bpmnModeler",
    libraryTarget: "var",
    libraryExport: "default",
  },
  optimization: {
    minimize: false
  },
  devtool: "source-map",
  
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
}
;
