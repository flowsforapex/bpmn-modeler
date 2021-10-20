import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

export function setExtensionSubProperty(container, element, node, values) {
  var entry = getSelectedEntry(container, element, node);

  return cmdHelper.updateBusinessObject(element, entry, values);
}

export function getExtensionSubProperty(container, element, node, property) {
  var entry = getSelectedEntry(container, element, node);

  return {
    [property]: (entry && entry.get(property)) || undefined,
  };
}

/* helper */

export function setOptionLabelValue(
  element,
  option,
  labelKey,
  labelValue,
  value,
  idx
) {
  var entries = getEntries(element);
  var entry = entries[idx];

  var label = entry ? `${entry.get(labelKey)}:${entry.get(labelValue)}` : '';

  option.text = label;
  option.value = entry && entry.get(value);
}

export function newElement(
  element,
  extensionElements,
  factory,
  type,
  subtype,
  property,
  values
) {
  var commands = [];
  var newElem;

  var [container] = extensionElementsHelper.getExtensionElements(
    getBusinessObject(element),
    type
  );

  if (!container) {
    container = elementHelper.createElement(
      type,
      {},
      extensionElements,
      factory
    );
    commands.push(
      cmdHelper.addElementsTolist(element, extensionElements, 'values', [
        container,
      ])
    );
  }

  newElem = elementHelper.createElement(subtype, values, container, factory);
  commands.push(
    cmdHelper.addElementsTolist(element, container, property, [newElem])
  );

  return commands;
}

export function removeElement(element, extensionElements, type, property, idx) {
  var command;

  var [container] = extensionElementsHelper.getExtensionElements(
    getBusinessObject(element),
    type
  );

  var entries = getEntries(element);
  var entry = entries[idx];

  command =
    container[property].length > 1 ? (command = cmdHelper.removeElementsFromList(
          element,
          container,
          property,
          'extensionElements',
          [entry]
        )) : cmdHelper.updateBusinessObject(element, container, {
          [property]: '',
        });

  return command;
}

export function isNotSelected(container, element, node) {
  return typeof getSelectedEntry(container, element, node) === 'undefined';
}

export function getEntries(element) {
  var bo = getBusinessObject(element);
  const [apexPage] = extensionElementsHelper.getExtensionElements(
    bo,
    'apex:ApexPage'
  );
  return apexPage && apexPage.pageItems;
}

function getSelectedEntry(container, element, node) {
  var selection;
  var entry;

  if (container.getSelected(element, node).idx > -1) {
    selection = container.getSelected(element, node);
    entry = getEntries(element)[selection.idx];
  }

  return entry;
}
