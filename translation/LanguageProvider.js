import german from './languages/de';
import french from './languages/fr';

const _languages = {
  'german': german,
  'french': french
};

export default function LanguageProvider() {
}

LanguageProvider.prototype.applyTranslation = function (language) {

  const _language = _languages[language];

  return (template, replacements) => {
    replacements = replacements || {};

    // Translate
    template = _language[template] || template;

    // Replace
    return template.replace(/{([^}]+)}/g, function (_, key) {
      return replacements[key] || `{${key}}`;
    });
  };
};

LanguageProvider.$inject = [
];