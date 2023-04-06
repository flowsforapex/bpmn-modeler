const {
  GettextExtractor,
  JsExtractors,
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
