import translation from './languages/fr';

export default function customTranslate(template, replacements) {
  replacements = replacements || {};

  // Translate
  template = translation[template] || template;

  // Replace
  return template.replace(/{([^}]+)}/g, function (_, key) {
    return replacements[key] || `{${key}}`;
  });
}