import { getBusinessObject } from "./util";

import { createElement } from "./extensions";

export function getProperty({ element, listElement, property }) {
  // use list element directly or get business object from element
  const businessObject = listElement || getBusinessObject(element);

  // get value from nested extension for nested properties
  if (property.indexOf('.') !== -1) {
    const [parent] = property.split('.');
    const extension = businessObject[parent];

    if (extension) {
      return extension[property.split('.')[1]];
    }
  }

  return businessObject[property];
}

export function updateProperties({ element, listElement, values, modeling, bpmnFactory }) {
  // use list element directly or get business object from element
  const businessObject = listElement || getBusinessObject(element);

  const directProperties = {};
  const nestedProperties = {};

  // split direct and nested properties based on dot notation
  Object.entries(values).forEach(([k, v]) => {
    if (k.includes('.')) {
      nestedProperties[k] = v;
    } else {
      directProperties[k] = v;
    }
  });

  // update direct properties
  modeling.updateModdleProperties(element, businessObject, directProperties);

  // update nested properties
  Object.entries(nestedProperties).forEach(([k, v]) => {
    // get parent and child by splitting property
    const [parentProp, childProp] = k.split('.');

    let extension = businessObject[parentProp];

    let update;
    let updatedBusinessObject;

    // create extension if not existing
    if (!extension) {
      // type name has to start with uppercase
      const typeName = `apex:${parentProp.charAt(0).toUpperCase() + parentProp.slice(1)}`;
      
      updatedBusinessObject = businessObject;

      extension = createElement(
        typeName,
        { [childProp]: v },
        businessObject,
        bpmnFactory
      );

      update = {
        [parentProp]: extension
      };
    // update existing extension
    } else {
      updatedBusinessObject = extension;
      update = { [childProp]: v };
    }
    
    modeling.updateModdleProperties(element, updatedBusinessObject, update);
  });
}
