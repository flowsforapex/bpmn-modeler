import { getBusinessObject } from '../../apexPropertiesProvider/provider/helper/util';

/**
 * An element template chooser that hooks into
 * properties panel fired "choose template" events.
 *
 * @param {Object} config
 * @param {EventBus} eventBus
 * @param {Translate} translate
 * @param {PopupMenu} popupMenu
 */
export default function ElementTemplateChooser(
    eventBus,
    translate,
    popupMenu,
    modeling
) {

  this._eventBus = eventBus;
  this._translate = translate;
  this._popupMenu = popupMenu;

  eventBus.on('elementTemplates.select', (event) => {

    // const modeling = useService('modeling');

    const { element } = event;
    const businessObject = getBusinessObject(element);

    this.open(element)
    .then((template) => {

      modeling.updateModdleProperties(element, businessObject, {
        'template': template.id
      });
    })
    .catch((err) => {
      console.error('elementTemplate.select :: error', err);
    });
  });
}

ElementTemplateChooser.$inject = [
  'eventBus',
  'translate',
  'popupMenu',
  'modeling'
];

ElementTemplateChooser.prototype.open = function (element) {

  const popupMenu = this._popupMenu;
  const translate = this._translate;
  const eventBus = this._eventBus;

  return new Promise((resolve, reject) => {

    const handleClosed = () => reject('user-canceled');

    eventBus.once('popupMenu.close', handleClosed);

    eventBus.once('elementTemplateChooser.chosen', (event) => {

      const { template } = event;

      eventBus.off('popupMenu.close', handleClosed);

      resolve(template);
    });

    popupMenu.open(element, 'element-template-chooser', { x: 0, y: 0 }, {
      title: translate('Choose element template'),
      search: true,
      width: 350
    });
  });

};