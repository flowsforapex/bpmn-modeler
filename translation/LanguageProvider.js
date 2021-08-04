import german from './languages/de';
import french from './languages/fr';

export default function LanguageProvider() {
}

LanguageProvider.$inject = [
];

var _language;
var _languages = {
  'german': german,
  'french': french
};

LanguageProvider.prototype.applyTranslation = function (template, replacements) {
  replacements = replacements || {};

  // Translate
  if (_language !== undefined) {
    template = _language[template] || template;
  }

  // Replace
  return template.replace(/{([^}]+)}/g, function (_, key) {
    return replacements[key] || `{${key}}`;
  });
};

LanguageProvider.prototype.setLanguage = function (language) {
  _language = _languages[language];
};