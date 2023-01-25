import {
  createExtension,
  createExtensionElements, getBusinessObject, getExtension,
  getExtensionElements
} from './util';


export default class ExtensionHelper {
  constructor(type) {
    this.type = type;
  }

  getExtensionProperty(element, property) {
    const extension = getExtension(element, this.type);

    return extension && extension[property];
  }

  setExtensionProperty(element, modeling, bpmnFactory, values, parent) {
    const businessObject = parent || getBusinessObject(element);
    let extensionElements = getExtensionElements(businessObject);
    let extensionElement = getExtension(businessObject, this.type);

    let update;
    let updatedBusinessObject;

    if (!extensionElements) {
      updatedBusinessObject = businessObject;

      extensionElements = createExtensionElements(element, bpmnFactory);
      extensionElement = createExtension(
        this.type,
        values,
        extensionElements,
        bpmnFactory
      );
      
      extensionElements.values.push(extensionElement);

      update = { extensionElements };
    } else if (!extensionElement) {
      updatedBusinessObject = extensionElements;

      extensionElement = createExtension(
        this.type,
        values,
        extensionElements,
        bpmnFactory
      );

      update = {
        values: extensionElements.get('values').concat(extensionElement),
      };
    } else {
      const removedProperties = [];

      // set empty properties to undefined (will be removed)
      for (const v in values) {
        if (!values[v]) {
          values[v] = undefined;
          removedProperties.push(v);
        }
      }

      // if extension element has no other properties
      if (!Object.keys(extensionElement).some(k => k !== '$type' && !removedProperties.includes(k))) {
        // if extension elements have no other children
        if (!extensionElements.get('values').some(k => k !== extensionElement)) {
          // remove extension elements
          updatedBusinessObject = businessObject;
          update = { extensionElements: null};
        } else {
          // remove extension
          updatedBusinessObject = extensionElements;
          update = {
            values: extensionElements.get('values').filter(v => v !== extensionElement),
          };
        }
      } else {
        // update (or remove) properties
        updatedBusinessObject = extensionElement;
        update = values;
      }
    }

    return modeling.updateModdleProperties(
      element,
      updatedBusinessObject,
      update
    );
  }
}
