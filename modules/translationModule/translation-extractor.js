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

/** *
 * finalize generated .pot file by using these regex in search & replace (with empty string)
 * ^#.*
 * msgstr.*
 * msgid 
 * ^\n
 * ""\n
 * ^.*charset=UTF-8.*$\n
*/
