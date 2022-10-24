import translationModule from './translationModule';

export default {
  __init__: ['translationModule'],
  translationModule: ['type', translationModule],
  translate: ['value', translationModule.prototype.applyTranslation()],
};
