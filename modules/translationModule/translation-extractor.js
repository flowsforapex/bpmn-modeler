const fs = require('fs');

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
  .parseFilesGlob('apexPropertiesProvider/new_provider/**/*.js')
  .parseFilesGlob('custom/**/*.js')
  .parseFilesGlob('modules/translationModule/additional-strings.js');

extractor.savePotFile('modules/translationModule/messages.pot');

extractor.printStats();

fs.readFile('modules/translationModule/messages.pot', 'utf-8', (_, data) => {
  
  const result = data
    .replace(/^#.*/gm, '')
    .replace(/msgstr.*/gm, '')
    .replace(/msgid /gm, '')
    .replace(/^\n/gm, '')
    .replace(/""\n/g, '')
    .replace(/^.*charset=UTF-8.*$\n/gm, '')
    // generate the test translation entries
    .replace(/"$/gm, '": "x"');

  fs.writeFile('modules/translationModule/messages.pot', result, 'utf8', function (_) {});
});
  