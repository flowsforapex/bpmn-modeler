import german from './languages/de.json';
import french from './languages/fr.json';
import japanese from './languages/ja.json';
import portuguese from './languages/pt-br.json';
import test from './languages/test.json';

const languages = {
  test: test,
  fr: french,
  de: german,
  ja: japanese,
  'pt-br': portuguese,
};

var language;

function applyTranslation() {
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
}

export default {
  translate: ['value', applyTranslation()],
};
