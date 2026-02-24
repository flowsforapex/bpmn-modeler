import {
  createElement,
  createExtension,
  createExtensionElements, getBusinessObject, getExtension,
  updateProperties
} from './util';

import { without } from 'min-dash';

export default class ListExtensionHelper {
  constructor(type, listType, listAttr, entryType, entryAttr, entryName) {
    this.type = type;
    this.listType = listType;
    this.listAttr = listAttr;
    this.entryType = entryType;
    this.entryAttr = entryAttr;
    this.entryName = entryName;
  }

  getNextName(element) {
    const name = this.entryName || this.type.split(':')[1];
    return name + (this.getSubExtensionElements(element) ? (`_${this.getSubExtensionElements(element).length}`) : (`_${0}`));
  }

  getNextSequence(element) {
    return String((this.getSubExtensionElements(element) ? this.getSubExtensionElements(element).length : 0));
  }

  // get extension element nested child by type
  getSubExtensionElements(element) {
    const { type, listAttr, entryAttr } = this;

    const extension = getExtension(element, type);

    if (entryAttr === null) {
      return extension && extension[listAttr];
    }

    return (
      extension && extension[listAttr] && extension[listAttr].get(entryAttr)
    );
  }

  addSubElement(args) {
    const { type, listType, listAttr, entryType, entryAttr } = this;

    const { element, newProps, modeling, bpmnFactory } = args;

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createExtensionElements(element, bpmnFactory);

      modeling.updateModdleProperties(
        element,
        businessObject,
        { extensionElements },
      );
    }

    // (2) ensure parent extension
    let extension = getExtension(element, type);

    if (!extension) {
      extension = createExtension(type, {}, extensionElements, bpmnFactory);

      modeling.updateModdleProperties(
        element,
        extensionElements,
        { values: [...extensionElements.get('values'), extension] },
      );
    }

    let listContainer;

    // nested lists (e.g. pageItems) - top level lists (e.g. procVars) dont need another container level
    if (listType) {
      // ensure list extension
      listContainer = extension[listAttr];

      if (!listContainer) {
        listContainer = createExtension(listType, {}, extension, bpmnFactory);

        modeling.updateModdleProperties(
          element,
          extension,
          { [listAttr]: listContainer },
        );
      }
    }

    let updatedBusinessObject;
    
    if (listContainer) updatedBusinessObject = listContainer;
    else updatedBusinessObject = extension;

    // (3) create entry
    const newEntry = createElement(
      entryType,
      {},
      updatedBusinessObject,
      bpmnFactory
    );

    // update properties
    updateProperties(element, newEntry, newProps, modeling, bpmnFactory);
    
    let update;

    if (listContainer && entryAttr) update = { [entryAttr]: [...listContainer.get(entryAttr), newEntry] };
    else update = {[listAttr]: [...extension.get(listAttr), newEntry] };

    // (4) add entry to list
    modeling.updateModdleProperties(
      element,
      updatedBusinessObject,
      update,
    );
  }

  removeSubElement(args) {
    const { type, listAttr, entryAttr } = this;

    const { element, listElement, modeling } = args;

    const businessObject = getBusinessObject(element);
    
    const {extensionElements} = businessObject;

    const extension = getExtension(element, type);

    if (!extension) {
      return;
    }

    let children;

    // nested lists (e.g. pageItems)
    if (entryAttr) children = extension[listAttr] && extension[listAttr].get(entryAttr);
    else children = extension[listAttr];

    if (!children) {
      return;
    }

    const newChildren = without(children, listElement);   
    
    let updatedBusinessObject;
    let update;

    // nested lists (e.g. pageItems)
    if (listAttr && entryAttr) {
      
      // if list container has no other entries -> remove list
      if (newChildren.length === 0) {

        updatedBusinessObject = extension;
        update = { [listAttr]: undefined };
        
        // if extension has no other properties -> remove extension
        if (!Object.keys(extension).some(k => k !== '$type' && k !== listAttr)) {
          
          updatedBusinessObject = extensionElements;
          update = { values: extensionElements.get('values').filter(v => v !== extension) };

          // if extension elements have no other children -> remove extension elements
          if (!extensionElements.get('values').some(k => k !== extension)) {
            updatedBusinessObject = businessObject;
            update = { extensionElements: undefined};
          }
        }
      } else {
        updatedBusinessObject = extension[listAttr];
        update = { [entryAttr]: newChildren };
      }
    // top level lists (e.g. procVars)
    // if list container has no other entries -> remove list/extension
    } else if (newChildren.length === 0) {
        
      updatedBusinessObject = extensionElements;
      update = { values: extensionElements.get('values').filter(v => v !== extension) };
        
      // if extension elements have no other children -> remove extension elements
      if (!extensionElements.get('values').some(k => k !== extension)) {
        updatedBusinessObject = businessObject;
        update = { extensionElements: undefined};
      }
    } else {
      updatedBusinessObject = extension;
      update = { [listAttr]: newChildren };
    }
    
    modeling.updateModdleProperties(
      element,
      updatedBusinessObject,
      update
    );
  }
}
