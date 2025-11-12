import {
  getBusinessObject,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

/**
 * A entry provider for the <element-template-chooser> popup menu.
 */
export default function ElementTemplateChooserEntryProvider(popupMenu, eventBus, translate, elementTemplates) {

  this._popupMenu = popupMenu;
  this._eventBus = eventBus;
  this._translate = translate;
  this._elementTemplates = elementTemplates;

  this.register();
}

ElementTemplateChooserEntryProvider.$inject = [
  'popupMenu',
  'eventBus',
  'translate',
  'config.elementTemplates',
];

/**
 * Register replace menu provider in the popup menu
 */
ElementTemplateChooserEntryProvider.prototype.register = function () {
  this._popupMenu.registerProvider('element-template-chooser', this);
};

/**
 * Adds the element templates to the replace menu.
 * @param {djs.model.Base} element
 *
 * @returns {Object}
 */
ElementTemplateChooserEntryProvider.prototype.getPopupMenuEntries = function (element) {

  const eventBus = this._eventBus;
  const translate = this._translate;

  return this._elementTemplates
  .filter(t => t.appliesTo.includes(element.type))
  .map((template) => {

    const entryId = `apply-template-${template.id}`;

    return [
      entryId,
      {
        label: template.name && translate(template.name),
        description: template.description && translate(template.description),
        action: () => {
          eventBus.fire('elementTemplateChooser.chosen', { element, template });
        }
      }
    ];
  })
  .reduce((entries, [key, value]) => {
    entries[key] = value;

    return entries;
  }, {});

};

// helpers ////////////

export function isTemplateApplied(element, template) {
  const businessObject = getBusinessObject(element);

  if (businessObject) {
    return businessObject.get('modelerTemplate') === template.id;
  }

  return false;
}