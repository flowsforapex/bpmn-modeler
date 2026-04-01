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

// get plain value of extension
export function getExtensionValue(element, type) {
  const extension = getExtension(element, type);
  
  return extension ? extension.value : null;
}

// create element and set parent (if needed)
export function createElement(elementType, properties, parent, bpmnFactory) {
  const element = bpmnFactory.create(elementType, properties);

  if (parent) {
    element.$parent = parent;
  }

  return element;
}

// create bpmn:extensionElements
export function createExtensionElements(element, bpmnFactory) {
  const businessObject = getBusinessObject(element);

  return createElement(
    'bpmn:ExtensionElements',
    { values: [] },
    businessObject,
    bpmnFactory
  );
}

// clean up function used in validateXML
export function removeExtension(element, businessObject, toRemove, modeling) {
  const {extensionElements} = businessObject;

  let updatedBusinessObject;
  let update;
  
  // if extension elements have no other children
  if (!extensionElements.get('values').some(k => k !== toRemove)) {
      // remove extension elements
      updatedBusinessObject = businessObject;
      update = { extensionElements: undefined};
  } else {
    // remove extension
    updatedBusinessObject = extensionElements;
    update = {
      values: extensionElements.get('values').filter(v => v !== toRemove),
    };
  }

  modeling.updateModdleProperties(element, updatedBusinessObject, update);
}