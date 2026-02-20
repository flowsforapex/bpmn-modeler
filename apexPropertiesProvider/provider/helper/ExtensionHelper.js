import {
  createExtension,
  createExtensionElements, getBusinessObject, getExtension,
  getExtensionElements
} from './util';


export default class ExtensionHelper {
  constructor(type) {
    this.type = type;
  }

  getProperty({element, property, parent} = {}) {
    const businessObject = parent || getBusinessObject(element);
    const extensionElement = getExtension(businessObject, this.type);

    return extensionElement && extensionElement[property];
  }

  setProperty({element, values, parent, modeling, bpmnFactory} = {}) {
    const businessObject = parent || getBusinessObject(element);
    let extensionElements = getExtensionElements(businessObject);
    let extensionElement = getExtension(businessObject, this.type);

    let update;
    let updatedBusinessObject;

    const hasValues = Object.values(values).some(v => v !== undefined && v !== '');

    if (!extensionElements && hasValues) {
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
    } else if (!extensionElement && hasValues) {
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
    } else if (extensionElements && extensionElement) {
      const removedProperties = Object.entries(values).filter(([_, v]) => !v).map(([k, _]) => k);

      const hasProperties = Object.keys(extensionElement).some(k => k !== '$type' && !removedProperties.includes(k));
      
      // if extension element has no other properties
      if (!hasProperties) {
        // if extension elements have no other children
        if (!extensionElements.get('values').some(k => k !== extensionElement)) {
          // remove extension elements
          updatedBusinessObject = businessObject;
          update = { extensionElements: undefined};
        } else {
          // remove extension
          updatedBusinessObject = extensionElements;
          update = {
            values: extensionElements.get('values').filter(v => v !== extensionElement),
          };
        }
      } else {
        // set empty properties to undefined (will be removed)
        const updatedValues = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, (v || undefined)]));
        // update (or remove) properties
        updatedBusinessObject = extensionElement;
        update = updatedValues;
      }
    } else {
      return null;
    }

    return modeling.updateModdleProperties(
      element,
      updatedBusinessObject,
      update
    );
  }
}
