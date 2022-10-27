import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  createElement,
  createExtension,
  getExtension,
  nextId
} from '../../helper/util';

import { without } from 'min-dash';

export function removeSubFactory(
  parent,
  listAttr,
  entryAttr,
  { commandStack, element, parameter }
) {
  return function (event) {
    event.stopPropagation();

    const extension = getExtension(element, parent);

    if (!extension) {
      return;
    }

    const children = extension[listAttr] && extension[listAttr].get(entryAttr);

    if (!children) {
      return;
    }

    const new_children = without(children, parameter);

    // remove entry from list
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extension[listAttr],
      properties: {
        [entryAttr]: new_children,
      },
    });

    // TODO remove container if empty
  };
}

export function addSubFactory(
  parentType,
  listType,
  listAttr,
  entryType,
  entryAttr,
  { element, bpmnFactory, commandStack }
) {
  return function (event) {
    event.stopPropagation();

    const commands = [];

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: { extensionElements },
        },
      });
    }

    // (2) ensure parent extension
    let parent_container = getExtension(element, parentType);

    if (!parent_container) {
      parent_container = createExtension(
        parentType,
        {},
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), parent_container],
          },
        },
      });
    }

    // (2) ensure list extension
    let list_container = parent_container[listAttr];

    if (!list_container) {
      list_container = createExtension(
        listType,
        {},
        parent_container,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: parent_container,
          properties: {
            [listAttr]: list_container,
          },
        },
      });
    }

    // (3) create entry
    const newEntry = createElement(
      entryType,
      {
        itemName: nextId('PageItem_'),
        itemValue: '',
      },
      list_container,
      bpmnFactory
    );

    // (4) add entry to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: list_container,
        properties: {
          [entryAttr]: [...list_container.get(entryAttr), newEntry],
        },
      },
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}
