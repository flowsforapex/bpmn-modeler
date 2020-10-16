const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: {
    bundle: [path.resolve(__dirname, "demo.js")],
  },
  output: {
    path: path.resolve(__dirname, "demo"),
    filename: "bundle.js",
    library: "bpmnModeler",
    libraryTarget: "var",
    libraryExport: "default"
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "demo.html"),
        },
        {
          from: path.resolve(__dirname, "assets/css/mtag.bpmnmodeler.css")
        },
        {
          from: path.resolve(__dirname, "assets/css/mtag.bpmnmodeler.font.css")
        },
        {
          from: path.resolve(__dirname, "assets/css/mtag.bpmnmodeler.properties-panel.css")
        },
      ],
    }),
  ],
  devtool: "source-map",
};
