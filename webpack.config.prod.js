const path = require("path");

module.exports = {
  mode: 'production',
  entry: {
    "mtag.bpmnmodeler": [path.resolve(__dirname, "src/index.js")]
  },
  optimization: {
    minimize: true
  },
  output: {
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
  }
};
