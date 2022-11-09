import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  createElement,
  createExtension,
  createExtensionElements,
  getExtension, updateProperties
} from './util';

import { without } from 'min-dash';

export default class ListExtensionHelper {
  constructor(type, listType, listAttr, entryType, entryAttr) {
    this.type = type;
    this.listType = listType;
    this.listAttr = listAttr;
    this.entryType = entryType;
    this.entryAttr = entryAttr;
  }

  getNextName(element) {
    const name = this.type.split(':')[1];
    return name + (this.getSubExtensionElements(element) ? this.getSubExtensionElements(element).length : 0);
  }

  getNextSequence(element) {
    return (this.getSubExtensionElements(element) ? this.getSubExtensionElements(element).length : 0);
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

  removeSubFactory({ commandStack, element, parameter }) {
    const { type, listAttr, entryAttr } = this;

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

        const newChildren = without(children, parameter);

        // remove entry from list
        updateProperties(
          {
            element,
            moddleElement: extension,
            properties: {
              [listAttr]: newChildren,
            },
          },
          commandStack
        );
      };
    }

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

      const newChildren = without(children, parameter);

      // remove entry from list
      updateProperties(
        {
          element,
          moddleElement: extension[listAttr],
          properties: {
            [entryAttr]: newChildren,
          },
        },
        commandStack
      );

      // remove list container if empty
      if (newChildren.length === 0) {
        updateProperties(
          {
            element,
            moddleElement: extension,
            properties: {
              [listAttr]: null,
            },
          },
          commandStack
        );
      }
    };
  }

  addSubFactory({ element, bpmnFactory, commandStack }, newProps) {
    const { type, listType, listAttr, entryType, entryAttr } = this;

    if (listType === null && entryAttr === null) {
      return function (event) {
        event.stopPropagation();

        const businessObject = getBusinessObject(element);

        let extensionElements = businessObject.get('extensionElements');

        // (1) ensure extension elements
        if (!extensionElements) {
          extensionElements = createExtensionElements(element, bpmnFactory);

          updateProperties(
            {
              element,
              moddleElement: businessObject,
              properties: { extensionElements },
            },
            commandStack
          );
        }

        // (2) ensure parent extension
        let extension = getExtension(element, type);

        if (!extension) {
          extension = createExtension(type, {}, extensionElements, bpmnFactory);

          updateProperties(
            {
              element,
              moddleElement: extensionElements,
              properties: {
                values: [...extensionElements.get('values'), extension],
              },
            },
            commandStack
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
        updateProperties(
          {
            element,
            moddleElement: extension,
            properties: {
              [listAttr]: [...extension.get(listAttr), newEntry],
            },
          },
          commandStack
        );
      };
    }

    return function (event) {
      event.stopPropagation();

      const businessObject = getBusinessObject(element);

      let extensionElements = businessObject.get('extensionElements');

      // (1) ensure extension elements
      if (!extensionElements) {
        extensionElements = createExtensionElements(element, bpmnFactory);

        updateProperties(
          {
            element,
            moddleElement: businessObject,
            properties: { extensionElements },
          },
          commandStack
        );
      }

      // (2) ensure parent extension
      let extension = getExtension(element, type);

      if (!extension) {
        extension = createExtension(type, {}, extensionElements, bpmnFactory);

        updateProperties(
          {
            element,
            moddleElement: extensionElements,
            properties: {
              values: [...extensionElements.get('values'), extension],
            },
          },
          commandStack
        );
      }

      // (3) ensure list extension
      let listContainer = extension[listAttr];

      if (!listContainer) {
        listContainer = createExtension(listType, {}, extension, bpmnFactory);

        updateProperties(
          {
            element,
            moddleElement: extension,
            properties: {
              [listAttr]: listContainer,
            },
          },
          commandStack
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
      updateProperties(
        {
          element,
          moddleElement: listContainer,
          properties: {
            [entryAttr]: [...listContainer.get(entryAttr), newEntry],
          },
        },
        commandStack
      );
    };
  }

  // direct method needed for quickpicks
  addSubElement({ element, bpmnFactory, commandStack }, newProps) {
    const { type, listType, listAttr, entryType, entryAttr } = this;

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createExtensionElements(element, bpmnFactory);

      updateProperties(
        {
          element,
          moddleElement: businessObject,
          properties: { extensionElements },
        },
        commandStack
      );
    }

    // (2) ensure parent extension
    let extension = getExtension(element, type);

    if (!extension) {
      extension = createExtension(type, {}, extensionElements, bpmnFactory);

      updateProperties(
        {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), extension],
          },
        },
        commandStack
      );
    }

    // (3) ensure list extension
    let listContainer = extension[listAttr];

    if (!listContainer) {
      listContainer = createExtension(listType, {}, extension, bpmnFactory);

      updateProperties(
        {
          element,
          moddleElement: extension,
          properties: {
            [listAttr]: listContainer,
          },
        },
        commandStack
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
    updateProperties(
      {
        element,
        moddleElement: listContainer,
        properties: {
          [entryAttr]: [...listContainer.get(entryAttr), newEntry],
        },
      },
      commandStack
    );
  }
}
