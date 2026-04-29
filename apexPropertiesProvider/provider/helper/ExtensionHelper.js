import { getBusinessObject } from './util';

import { createElement, createExtensionElements, getExtension, getExtensionElements } from './extensions';

export default class ExtensionHelper {
  constructor(type) {
    this.type = type;
  }

  getProperty({element, property, parent} = {}) {
    // use parent if existing (e.g. eventDefinition or loopCharacteristics), otherwise getBusinessObject
    const businessObject = parent || getBusinessObject(element);
    
    const extensionElement = getExtension(businessObject, this.type);

    return extensionElement && extensionElement[property];
  }

  setProperty({element, values, parent, modeling, bpmnFactory} = {}) {
    // use parent if existing (e.g. eventDefinition or loopCharacteristics), otherwise getBusinessObject
    const businessObject = parent || getBusinessObject(element);
    
    let extensionElements = getExtensionElements(businessObject);
    let extensionElement = getExtension(businessObject, this.type);

    let update;
    let updatedBusinessObject;

    // check if any of the values are not empty or undefined
    const hasValues = Object.values(values).some(v => v !== undefined && v !== '');

    // if extensionElements are not existing
    if (!extensionElements && hasValues) {
      
      // create extension elements
      extensionElements = createExtensionElements(element, bpmnFactory);
      
      // create extension
      extensionElement = createElement(
        this.type,
        values,
        extensionElements,
        bpmnFactory
      );
      
      // append extension to extension elements
      extensionElements.values.push(extensionElement);
      // set update parameters
      updatedBusinessObject = businessObject;
      update = { extensionElements };
    
      // if extension is not existing
    } else if (!extensionElement && hasValues) {
      
      // create extension
      extensionElement = createElement(
        this.type,
        values,
        extensionElements,
        bpmnFactory
      );
      
      // set update parameters
      updatedBusinessObject = extensionElements;
      update = { values: extensionElements.get('values').concat(extensionElement) };
    
    // extension elemens and extension already existing
    } else if (extensionElements && extensionElement) {
      
      // filter out removed properties
      const removedProperties = Object.entries(values).filter(([_, v]) => !v).map(([k, _]) => k);
      
      // check if extension has any non-removed properties left
      const hasProperties = Object.keys(extensionElement).some(k => k !== '$type' && !removedProperties.includes(k));
      
      // if extension element has no other properties
      if (!hasProperties) {
        
        // if extension elements have no other children
        if (!extensionElements.get('values').some(k => k !== extensionElement)) {
          
          // remove extension elements
          updatedBusinessObject = businessObject;
          update = { extensionElements: undefined};
        
        // else: other extensions existing
        } else {
          
          // remove extension
          updatedBusinessObject = extensionElements;
          update = { values: extensionElements.get('values').filter(v => v !== extensionElement)};
        }
      
      // else: other properties existing
      } else {
        
        // set empty properties to undefined (will be removed)
        const updatedValues = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, (v || undefined)]));
        
        // update (or remove) properties
        updatedBusinessObject = extensionElement;
        update = updatedValues;
      }
    
    // fallback: do nothing
    } else {
      return null;
    }

    return modeling.updateModdleProperties(element, updatedBusinessObject, update);
  }
}
