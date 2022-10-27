import Ids from 'ids';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

// get extension element
export function getExtensionElements(element) {
  const businessObject = getBusinessObject(element);

  return businessObject.get('extensionElements');
}

// get extension element child by type
export function getExtension(element, type) {
  const extensionElements = getExtensionElements(element);

  if (!extensionElements) {
    return null;
  }

  return extensionElements.values.filter(function (e) {
    return e.$instanceOf(type);
  })[0];
}

/*
// get list-type extension element child
export function getExtensionElements(element, type) {
  const extensionElement = getExtensionElement(element, type);
  return extensionElement && extensionElement.get('values');
}
*/

// get extension element nested child by type
export function getSubExtensionElements(element, parentType, listAttr, entryAttr) {
  const parameters = getExtension(element, parentType);

  return parameters && parameters[listAttr] && parameters[listAttr].get(entryAttr);
}

export function createElement(elementType, properties, parent, factory) {
  const element = factory.create(elementType, properties);

  if (parent) {
    element.$parent = parent;
  }

  return element;
}

export function createExtension(type, properties, parent, bpmnFactory) {
  return createElement(type, properties, parent, bpmnFactory);
}

export function createExtensionElements(element, bpmnFactory) {
  const businessObject = getBusinessObject(element);

  return createElement(
    'bpmn:ExtensionElements',
    { values: [] },
    businessObject,
    bpmnFactory
  );
}

export function nextId(prefix) {
  const ids = new Ids([32, 32, 1]);

  return ids.nextPrefixed(prefix);
}
