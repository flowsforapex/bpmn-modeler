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
          to: "./index.html",
        },
        {
          from: path.resolve(__dirname, "assets/css/mtag.bpmnmodeler.css"),
        },
        {
          from: path.resolve(__dirname, "assets/css/mtag.bpmnmodeler.font.css"),
        },
        {
          from: path.resolve(
            __dirname,
            "assets/css/mtag.bpmnmodeler.properties-panel.css"
          ),
        },
        {
          from: path.resolve(__dirname, "node_modules/bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css")
        },
      ],
    }),
  ],
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "demo"),
    compress: true,
    port: 8082,
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
