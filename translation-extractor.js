const {
  GettextExtractor,
  JsExtractors,
  HtmlExtractors,
} = require('gettext-extractor');

const extractor = new GettextExtractor();

extractor
  .createJsParser([
    JsExtractors.callExpression('translate', {
      arguments: {
        text: 0,
      },
    }),
  ])
  .parseFilesGlob('./apexPropertiesProvider/provider/**/*.js')
  .parseFilesGlob('./custom/**/*.js');

// extractor
//   .createJsParser([
//     JsExtractors.callExpression('reporter.report', {
//       arguments: {
//         text: 1,
//       },
//     }),
//   ])
//   .parseFilesGlob('./bpmnlint-plugin-apex/**/*.js')
//   .parseFilesGlob('./node_modules/bpmnlint/rules/*.js');

extractor
  .createJsParser([
    JsExtractors.callExpression('translate', {
      arguments: {
        text: 0,
      },
    }),
  ])
  .parseFilesGlob('./lib/translation/bpmn-js-strings.js');

extractor.savePotFile('./lib/translation/messages.pot');

extractor.printStats();
