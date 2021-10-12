const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    "flows4apex.modeler": [path.resolve(__dirname, "src/index.js")],
  },
  output: {
    filename: "[name].min.js",
    library: "bpmnModeler",
    libraryTarget: "var",
    libraryExport: "default",
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ["pgsql"],
      features: [
        "!accessibilityHelp",
        "!bracketMatching",
        "!caretOperations",
        "!clipboard",
        "!codeAction",
        "!codelens",
        "!colorDetector",
        "!comment",
        "!contextmenu",
        "!coreCommands",
        "!cursorUndo",
        "!dnd",
        "!find",
        "!folding",
        "!fontZoom",
        "!format",
        "!gotoError",
        "!gotoLine",
        "!gotoSymbol",
        "!hover",
        "!iPadShowKeyboard",
        "!inPlaceReplace",
        "!inspectTokens",
        "!linesOperations",
        "!links",
        "!multicursor",
        "!parameterHints",
        "!quickCommand",
        "!quickOutline",
        "!referenceSearch",
        "!rename",
        "!smartSelect",
        "!snippets",
        "!suggest",
        "!toggleHighContrast",
        "!toggleTabFocusMode",
        "!transpose",
        "!wordHighlighter",
        "!wordOperations",
        "!wordPartOperations",
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
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"],
      },
    ],
  },
  optimization: {
    minimize: true,
    usedExports: true,
  },
};
