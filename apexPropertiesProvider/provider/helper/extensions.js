import { getBusinessObject } from "./util";

// get extension elements
export function getExtensionElements(element) {
  const businessObject = getBusinessObject(element);

  return businessObject.get('extensionElements');
}

// get extension element child by type
export function getExtension(element, type) {
  const extensionElements = getExtensionElements(element);

  if (!extensionElements || !extensionElements.values) {
    return null;
  }

  return extensionElements.values.filter(function (e) {
    return e.$instanceOf(type);
  })[0];
}

export function createElement(elementType, properties, parent, bpmnFactory) {
  const element = bpmnFactory.create(elementType, properties);

  if (parent) {
    element.$parent = parent;
  }

  return element;
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