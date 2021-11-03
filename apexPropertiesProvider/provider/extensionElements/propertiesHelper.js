import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

export default class propertiesHelper {
  constructor(type) {
    this.type = type;
  }

  /* setter / getter */

  setExtensionProperty(element, factory, values) {
    var commands = [];
    var bo = getBusinessObject(element);
    var extensions = bo.extensionElements;

    if (!extensions) {
      extensions = elementHelper.createElement(
        'bpmn:ExtensionElements',
        {},
        bo,
        factory
      );
      commands.push(
        cmdHelper.updateProperties(element, { extensionElements: extensions })
      );
    }

    let [extElement] = extensionElementsHelper.getExtensionElements(
      bo,
      this.type
    );

    if (!extElement) {
      extElement = elementHelper.createElement(
        this.type,
        {},
        extensionElementsHelper,
        factory
      );
      commands.push(
        cmdHelper.addElementsTolist(element, extensions, 'values', [extElement])
      );
    }

    commands.push(cmdHelper.updateBusinessObject(element, extElement, values));
    return commands;
  }

  getExtensionProperty(element, property) {
    var bo = getBusinessObject(element);

    const [extElement] = extensionElementsHelper.getExtensionElements(
      bo,
      this.type
    );

    return {
      [property]: extElement && extElement.get(property),
    };
  }

  /* helper */

  clearExtensionProperty(element, property) {
    var bo = getBusinessObject(element);

    const [extElement] = extensionElementsHelper.getExtensionElements(
      bo,
      this.type
    );
    if (extElement) extElement[property] = '';
  }
}
