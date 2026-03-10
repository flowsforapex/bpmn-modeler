import {
  createElement,
  createExtension,
  createExtensionElements, getBusinessObject, getExtension,
  updateProperties
} from './util';

import { without } from 'min-dash';

export default class ListExtensionHelper {
  constructor({ listParentType, listType, entryType, listAttr, entryAttr, entryName }) {
    
    // type of the list parent e.g. apex:apexPage
    this.listParentType = listParentType;
    // type of the list e.g. apex:pageItems
    this.listType = listType;
    // type of the list entries e.g. apex:pageItem
    this.entryType = entryType;
    // name of the list attribute in the parent extension e.g. pageItems
    this.listAttr = listAttr;
    // name of the list entry attribute in the list e.g. pageItem
    this.entryAttr = entryAttr;
    // name for generating new entries
    this.entryName = entryName;
  }

  getNextName(element) {
    const name = this.entryName || this.listType.split(':')[1];
    return name + (this.getSubExtensionElements(element) ? (`_${this.getSubExtensionElements(element).length}`) : (`_${0}`));
  }

  getNextSequence(element) {
    return String((this.getSubExtensionElements(element) ? this.getSubExtensionElements(element).length : 0));
  }

  getSubExtensionElements(element) {
    const { listParentType, listType, listAttr, entryAttr } = this;

    if (listParentType) {
      const parent = getExtension(element, listParentType);
      return parent && parent.get(listAttr) && parent.get(listAttr).get(entryAttr);
    }
  
    const extension = getExtension(element, listType);
    return extension && extension.get(entryAttr);
  }

  addSubElement(args) {
    const { listParentType, listType, entryType, listAttr, entryAttr } = this;

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

    let parent;

    // (2) ensure parent
    if (listParentType) {
      
      parent = getExtension(element, listParentType);

      if (!parent) {
        parent = createExtension(listParentType, {}, extensionElements, bpmnFactory);

        modeling.updateModdleProperties(
          element,
          extensionElements,
          { values: [...extensionElements.get('values'), parent] },
        );
      }
    }
    
    let list;

    // (3) ensure list
    if (listType) {

      if (parent) list = parent.get(listAttr);
      else list = getExtension(element, listType);

      if (!list) {
        list = createExtension(listType, {}, extensionElements, bpmnFactory);

        if (parent) {
          modeling.updateModdleProperties(
            element,
            parent,
            { [listAttr]: list },
          );
        } else {
          modeling.updateModdleProperties(
            element,
            extensionElements,
            { values: [...extensionElements.get('values'), list] },
          );
        }
      }
    }

    // (4) create entry
    const newEntry = createElement(
      entryType,
      {},
      list,
      bpmnFactory
    );

    // update properties
    updateProperties(element, newEntry, newProps, modeling, bpmnFactory);

    // (5) add entry to list
    modeling.updateModdleProperties(
      element,
      list,
      { [entryAttr]: [...list.get(entryAttr), newEntry] }
    );
  }

  removeSubElement(args) {
    const { listParentType, listType, listAttr, entryAttr } = this;

    const { element, listElement, modeling } = args;

    const businessObject = getBusinessObject(element);
    
    const {extensionElements} = businessObject;

    let list;
    
    if (listParentType) {
      const parent = getExtension(element, listParentType);
      list = parent.get(listAttr);
    } else {
      list = getExtension(element, listType);
    }
    
    if (!list) {
      return;
    }

    const children = list.get(entryAttr);

    if (!children) {
      return;
    }

    const newChildren = without(children, listElement);   
    
    let updatedBusinessObject = list;
    let update = { [entryAttr]: newChildren };

    // if list container has no other entries -> remove list
    if (newChildren.length === 0) {

      if (listParentType) {
        const parent = getExtension(element, listParentType);

        updatedBusinessObject = parent;
        update = { [listAttr]: undefined };

        // if parent has no other properties -> remove extension
        if (!Object.keys(parent).some(k => k !== '$type' && k !== listAttr)) {

          updatedBusinessObject = extensionElements;
          update = { values: extensionElements.get('values').filter(v => v !== parent) };

          // if extension elements have no other children -> remove extension elements
          if (!extensionElements.get('values').some(k => k !== parent)) {
            updatedBusinessObject = businessObject;
            update = { extensionElements: undefined};
          }
        }
      } else {

        updatedBusinessObject = extensionElements;
        update = { values: extensionElements.get('values').filter(v => v !== list) };
          
        // if extension elements have no other children -> remove extension elements
        if (!extensionElements.get('values').some(k => k !== list)) {
          updatedBusinessObject = businessObject;
          update = { extensionElements: undefined};
        }
      }
    }
    
    modeling.updateModdleProperties(
      element,
      updatedBusinessObject,
      update
    );
  }
}
