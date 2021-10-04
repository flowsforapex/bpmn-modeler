const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
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
            loader: "bpmnlint-loader",
          },
        ],
      },
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
