import Ids from 'ids';

import { getBusinessObject as getBO, is } from 'bpmn-js/lib/util/ModelUtil';

// get extension element
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

export function createExtension(type, properties, parent, bpmnFactory) {
  return createElement(type, properties, parent, bpmnFactory);
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

  modeling.updateModdleProperties(
    element,
    updatedBusinessObject,
    update
  );
}

export function nextId(prefix) {
  const ids = new Ids([32, 32, 1]);

  return ids.nextPrefixed(prefix);
}

export function getBusinessObject(element) {

  return (is(element, 'bpmn:Participant') && getBO(element).processRef) ? getBO(element).processRef : getBO(element);
}

export function isChildOf(element, type) {

  const businessObject = getBusinessObject(element);

  const parent = businessObject.$parent;

  if (parent) {
    
    if (is(parent, type)) return true;

    return isChildOf(parent, type);
  }

  return false;
}

export function getProperty(element, listElement, property) {

  const businessObject = listElement || getBusinessObject(element);

  // nested
  if (property.indexOf('.') !== -1) {
    const [parent] = property.split('.');
    const extension = businessObject[parent];

    if (extension) {
      return extension[property.split('.')[1]];
    }
  }

  return businessObject[property];
}

export function updateProperties(element, listElement, values, modeling, bpmnFactory) {

  const businessObject = listElement || getBusinessObject(element);

  const directProperties = {};
  const nestedProperties = {};

  Object.entries(values).forEach(([k, v]) => {
    if (k.includes('.')) {
      nestedProperties[k] = v;
    } else {
      directProperties[k] = v;
    }
  });

  // update direct properties
  modeling.updateModdleProperties(
    element,
    businessObject,
    directProperties
  );

  // update nested properties
  Object.entries(nestedProperties).forEach(([k, v]) => {
    // get parent and child by splitting property
    const [parentProp, childProp] = k.split('.');

    let extension = businessObject[parentProp];

    let update;
    let updatedBusinessObject;

    if (!extension) {
      // type name has to start with uppercase
      const typeName = `apex:${parentProp.charAt(0).toUpperCase() + parentProp.slice(1)}`;
      
      updatedBusinessObject = businessObject;

      extension = createExtension(
        typeName,
        { [childProp]: v },
        businessObject,
        bpmnFactory
      );

      update = {
        [parentProp]: extension
      };
    } else {
      updatedBusinessObject = extension;
      update = { [childProp]: v };
    }
    
    modeling.updateModdleProperties(
      element,
      updatedBusinessObject,
      update
    );

  });
}
