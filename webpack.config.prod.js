const path = require("path");

module.exports = {
    entry: {
      "mtag.bpmnmodeler": [path.resolve(__dirname, "index.js")],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: '[name].min.js',
      library: "bpmnModeler",
      libraryTarget: "var",
      libraryExport: "default"
    }
  }
;
