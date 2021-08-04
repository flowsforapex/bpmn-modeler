import languageProvider from './LanguageProvider';

export default {
  __depends__: [languageProvider],
  translate: ['value', languageProvider.prototype.applyTranslation]
};