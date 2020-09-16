const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: {
    bundle: [path.resolve(__dirname, "demo.js")],
  },
  output: {
    path: path.resolve(__dirname, "demo"),
    filename: "bundle.js",
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "demo.html"),
        },
        {
          from: path.resolve(__dirname, "assets/css/*")
        },
      ],
    }),
  ],
  devtool: "source-map",
};
