const path = require("path");

module.exports = {
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
    ],
  },
  optimization: {
    minimize: true
  },
};
