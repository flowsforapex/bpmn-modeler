import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

export function setExtensionProperty(element, factory, type, values) {
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

  let [extElement] = extensionElementsHelper.getExtensionElements(bo, type);

  if (!extElement) {
    extElement = elementHelper.createElement(
      type,
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

export function getExtensionProperty(element, type, property) {
  var bo = getBusinessObject(element);

  const [extElement] = extensionElementsHelper.getExtensionElements(bo, type);

  return {
    [property]: extElement && extElement.get(property),
  };
}

export function clearExtensionProperty(element, type, property) {
  var bo = getBusinessObject(element);

  const [extElement] = extensionElementsHelper.getExtensionElements(bo, type);
  if (extElement) extElement[property] = '';
}
