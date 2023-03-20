import {
  createElement,
  createExtension,
  createExtensionElements, getBusinessObject, getExtension
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

  removeSubFactory(args) {
    const { type, listAttr, entryAttr } = this;

    const { element, listElement, modeling } = args;

    const businessObject = getBusinessObject(element);
    const {extensionElements} = businessObject;

    // top level lists (e.g. procVars)
    if (entryAttr === null) {
      return function (event) {
        event.stopPropagation();

        const extension = getExtension(element, type);

        if (!extension) {
          return;
        }

        const children = extension[listAttr];

        if (!children) {
          return;
        }

        const newChildren = without(children, listElement);        

        let updatedBusinessObject = extension;
        let update = { [listAttr]: newChildren };

        // if list container has no other entries
        if (newChildren.length === 0) {
          updatedBusinessObject = extensionElements;
          update = { values: extensionElements.get('values').filter(v => v !== extension) };
          // if extension elements have no other children
          if (!extensionElements.get('values').some(k => k !== extension)) {
            updatedBusinessObject = businessObject;
            update = { extensionElements: undefined};
          }
        }

        modeling.updateModdleProperties(
          element,
          updatedBusinessObject,
          update
        );
      };
    }

    // nested lists (e.g. pageItems)
    return function (event) {
      event.stopPropagation();

      const extension = getExtension(element, type);

      if (!extension) {
        return;
      }

      const children =
        extension[listAttr] && extension[listAttr].get(entryAttr);

      if (!children) {
        return;
      }

      const newChildren = without(children, listElement);

      let updatedBusinessObject = extension[listAttr];
      let update = { [entryAttr]: newChildren };

      // if list container has no other entries
      if (newChildren.length === 0) {
        updatedBusinessObject = extension;
        update = { [listAttr]: undefined };
        // if extension element has no other properties
        if (!Object.keys(extension).some(k => k !== '$type' && k !== listAttr)) {
          updatedBusinessObject = extensionElements;
          update = { values: extensionElements.get('values').filter(v => v !== extension) };

           // if extension elements have no other children
          if (!extensionElements.get('values').some(k => k !== extension)) {
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
    };
  }

  addSubFactory(args) {
    const { type, listType, listAttr, entryType, entryAttr } = this;

    const { element, newProps, modeling, bpmnFactory } = args;

    // top level lists (e.g. procVars)
    if (listType === null && entryAttr === null) {
      return function (event) {
        event.stopPropagation();

        const businessObject = getBusinessObject(element);

        let extensionElements = businessObject.get('extensionElements');

        // (1) ensure extension elements
        if (!extensionElements) {
          extensionElements = createExtensionElements(element, bpmnFactory);

          modeling.updateModdleProperties(
            element,
            businessObject,
            { extensionElements }
          );
        }

        // (2) ensure parent extension
        let extension = getExtension(element, type);

        if (!extension) {
          extension = createExtension(type, {}, extensionElements, bpmnFactory);

          modeling.updateModdleProperties(
            element,
            extensionElements,
            { values: [...extensionElements.get('values'), extension] }
          );
        }

        // (3) create entry
        const newEntry = createElement(
          entryType,
          newProps,
          extension,
          bpmnFactory
        );

        // (4) add entry to list
        modeling.updateModdleProperties(
          element,
          extension,
          { [listAttr]: [...extension.get(listAttr), newEntry] }
        );
      };
    }

    // nested lists (e.g. pageItems)
    return function (event) {
      event.stopPropagation();

      const businessObject = getBusinessObject(element);

      let extensionElements = businessObject.get('extensionElements');

      // (1) ensure extension elements
      if (!extensionElements) {
        extensionElements = createExtensionElements(element, bpmnFactory);

        modeling.updateModdleProperties(
          element,
          businessObject,
          { extensionElements }
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

      // (3) ensure list extension
      let listContainer = extension[listAttr];

      if (!listContainer) {
        listContainer = createExtension(listType, {}, extension, bpmnFactory);

        modeling.updateModdleProperties(
          element,
          extension,
          { [listAttr]: listContainer },
        );
      }

      // (4) create entry
      const newEntry = createElement(
        entryType,
        newProps,
        listContainer,
        bpmnFactory
      );

      // (5) add entry to list
      modeling.updateModdleProperties(
        element,
        listContainer,
        { [entryAttr]: [...listContainer.get(entryAttr), newEntry] },
      );
    };
  }

  // direct method needed for quickpicks
  addSubElement(args) {
    const { type, listType, listAttr, entryType, entryAttr } = this;

    const { element, newProps, modeling, bpmnFactory } = args;

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    if (listType === null && entryAttr === null) {
      
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

      // (3) create entry
      const newEntry = createElement(
        entryType,
        newProps,
        extension,
        bpmnFactory
      );

      // (4) add entry to list
      modeling.updateModdleProperties(
        element,
        extension,
        { [listAttr]: [...extension.get(listAttr), newEntry] },
      );

    
    } else {

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

      // (3) ensure list extension
      let listContainer = extension[listAttr];

      if (!listContainer) {
        listContainer = createExtension(listType, {}, extension, bpmnFactory);

        modeling.updateModdleProperties(
          element,
          extension,
          { [listAttr]: listContainer },
        );
      }

      // (3) create entry
      const newEntry = createElement(
        entryType,
        newProps,
        listContainer,
        bpmnFactory
      );

      // (4) add entry to list
      modeling.updateModdleProperties(
        element,
        listContainer,
        { [entryAttr]: [...listContainer.get(entryAttr), newEntry] },
      );
    }
  }
}
