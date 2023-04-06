import languages from './languages/collector';

export default function TranslationModule() {}

TranslationModule.prototype.applyTranslation = function () {
  var language;

  if (typeof window.f4a !== 'undefined') {
    language = languages[window.f4a.language];
  }

  return (template, replacements) => {
    replacements = replacements || {};

    if (typeof language !== 'undefined') {
      // Translate
      template = language[template] || template;
    }

    // Replace
    return template.replace(/{([^}]+)}/g, function (_, key) {
      return replacements[key] || `{${key}}`;
    });
  };
};
