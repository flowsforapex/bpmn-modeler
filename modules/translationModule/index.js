import TranslationModule from './TranslationModule';

export default {
  __init__: ['translationModule'],
  translationModule: ['type', TranslationModule],
  translate: ['value', TranslationModule.prototype.applyTranslation()],
};
