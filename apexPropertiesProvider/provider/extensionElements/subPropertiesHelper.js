import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

export default class subPropertiesHelper {
  constructor(type, subtype, attribute, parentAttribute, parentType) {
    this.type = type;
    this.subtype = subtype;
    this.attribute = attribute;
    this.parentAttribute = parentAttribute;
    this.parentType = parentType;
  }

  /* setter / getter */

  setExtensionSubProperty(container, element, node, values) {
    var entry = this.getSelectedEntry(container, element, node);

    return cmdHelper.updateBusinessObject(element, entry, values);
  }

  getExtensionSubProperty(container, element, node, property) {
    var entry = this.getSelectedEntry(container, element, node);

    return {
      [property]: (entry && entry.get(property)) || undefined,
    };
  }

  /* helper */

  setOptionLabelValue(element, option, labelKey, labelValue, value, idx) {
    var entries = this.getEntries(element);
    var entry = entries[idx];

    var label = entry ? `${entry.get(labelKey)}:${entry.get(labelValue)}` : '';

    option.text = label;
    option.value = entry && entry.get(value);
  }

  newElement(element, extensionElements, factory, values) {
    var commands = [];
    var newElem;

    var [container] = extensionElementsHelper.getExtensionElements(
      getBusinessObject(element),
      this.type
    );

    if (!container) {
      container = elementHelper.createElement(
        this.type,
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

    if (this.parentAttribute) {
      var subContainer = container[this.parentAttribute];

      if (!subContainer) {
        subContainer = elementHelper.createElement(
          this.parentType,
          {},
          container,
          factory
        );
        commands.push(
          cmdHelper.updateBusinessObject(element, container, {
            pageItems: subContainer,
          })
        );
      }
      newElem = elementHelper.createElement(
        this.subtype,
        values,
        subContainer,
        factory
      );
      commands.push(
        cmdHelper.addElementsTolist(element, subContainer, this.attribute, [
          newElem,
        ])
      );
    } else {
      newElem = elementHelper.createElement(
        this.subtype,
        values,
        container,
        factory
      );
      commands.push(
        cmdHelper.addElementsTolist(element, container, this.attribute, [
          newElem,
        ])
      );
    }

    return commands;
  }
  removeElement(element, extensionElements, idx) {
    var command;

    var [container] = extensionElementsHelper.getExtensionElements(
      getBusinessObject(element),
      this.type
    );

    var entries = this.getEntries(element);
    var entry = entries[idx];

    if (this.parentAttribute) {
      var subContainer = container[this.parentAttribute];

      command =
        subContainer[this.attribute].length > 1 ? (command = cmdHelper.removeElementsFromList(
              element,
              subContainer,
              this.attribute,
              extensionElements,
              [entry]
            )) : cmdHelper.updateBusinessObject(element, container, {
              [this.parentAttribute]: null,
            });
    } else {
      command =
        container[this.attribute].length > 1 ? (command = cmdHelper.removeElementsFromList(
              element,
              container,
              this.attribute,
              extensionElements,
              [entry]
            )) : cmdHelper.updateBusinessObject(element, container, {
              [this.attribute]: null,
            });
    }

    return command;
  }

  isNotSelected(container, element, node) {
    return (
      typeof this.getSelectedEntry(container, element, node) === 'undefined'
    );
  }

  isSelected(container, element, node) {
    return (
      typeof this.getSelectedEntry(container, element, node) !== 'undefined'
    );
  }

  getEntries(element) {
    var bo = getBusinessObject(element);
    const [apexPage] = extensionElementsHelper.getExtensionElements(
      bo,
      this.type
    );
    if (this.parentAttribute) {
      return (
        (apexPage &&
          apexPage[this.parentAttribute] &&
          apexPage[this.parentAttribute][this.attribute]) ||
        []
      );
    }
    return (apexPage && apexPage[this.attribute]) || [];
  }

  getSelectedEntry(container, element, node) {
    var selection;
    var entry;

    if (container.getSelected(element, node).idx > -1) {
      selection = container.getSelected(element, node);
      entry = this.getEntries(element)[selection.idx];
    }

    return entry;
  }
}
