import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  createExtension,
  createExtensionElements,
  getExtension,
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

  setExtensionProperty(element, modeling, bpmnFactory, values) {
    const businessObject = getBusinessObject(element);
    let extensionElements = getExtensionElements(element);
    let extensionElement = getExtension(element, this.type);

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
        extensionElements,
        bpmnFactory,
        values
      );

      update = {
        values: extensionElements.get('values').concat(extensionElement),
      };
    } else {
      updatedBusinessObject = extensionElement;

      update = values;
    }

    return modeling.updateModdleProperties(
      element,
      updatedBusinessObject,
      update
    );
  }
}
