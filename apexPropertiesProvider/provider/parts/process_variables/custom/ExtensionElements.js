

var {getBusinessObject} = require('bpmn-js/lib/util/ModelUtil');

var domQuery = require('min-dom').query;
    var domClosest = require('min-dom').closest;
    var {domify} = require('min-dom');
    var forEach = require('lodash/forEach');

var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');
    var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
    var utils = require('bpmn-js-properties-panel/lib/Utils');

    var {escapeHTML} = utils;

function getSelectBox(node, id) {
  var currentTab = domClosest(node, 'div.bpp-properties-tab');
  var query = `select[name=selectedExtensionElement]${id ? `[id=cam-extensionElements-${id}]` : ''}`;
  return domQuery(query, currentTab);
}

function getSelected(node, id) {
  var selectBox = getSelectBox(node, id);
  return {
    value: (selectBox || {}).value,
    idx: (selectBox || {}).selectedIndex
  };
}

function generateElementId(prefix) {
  prefix += '_';
  return utils.nextId(prefix);
}

var CREATE_EXTENSION_ELEMENT_ACTION = 'create-extension-element';
    var REMOVE_EXTENSION_ELEMENT_ACTION = 'remove-extension-element';

module.exports = function (element, bpmnFactory, options, translate) {

  var {id} = options;
      var prefix = options.prefix || 'elem';
      var label = options.label || id;
      var idGeneration = (options.idGeneration === false) ? options.idGeneration : true;
      var businessObject = options.businessObject || getBusinessObject(element);
      var {type} = options;

  var modelProperty = options.modelProperty || 'id';

  var getElements = options.getExtensionElements;

  var createElement = options.createExtensionElement;
      var canCreate = typeof createElement === 'function';

  var removeElement = options.removeExtensionElement;
      var canRemove = typeof removeElement === 'function';

  var {onSelectionChange} = options;
  var {onEntryMoved} = options;

  var hideElements = options.hideExtensionElements;
      var canBeHidden = typeof hideElements === 'function';

  var {setOptionLabelValue} = options;

  var defaultSize = options.size || 5;
      var {resizable} = options;

  var reference = options.reference || undefined;

  var selectionChanged = function (element, node, event, scope) {
    if (typeof onSelectionChange === 'function') {
      return onSelectionChange(element, node, event, scope);
    }
  };

  var entryMoved = function (element) {
    if (typeof onEntryMoved === 'function') {
      return onEntryMoved(element);
    }
  };

  var createOption = function (value) {
    return `<option value="${escapeHTML(value)}" data-value data-name="extensionElementValue">${escapeHTML(value)}</option>`;
  };

  var initSelectionSize = function (selectBox, optionsLength) {
    if (resizable) {
      selectBox.size = optionsLength > defaultSize ? optionsLength : defaultSize;
    }
  };

  return {
    id: id,
    type: type,
    html: `<div class="bpp-row bpp-element-list" ${ 
            canBeHidden ? 'data-show="hideElements"' : ''}>` +
            `<label for="cam-extensionElements-${escapeHTML(id)}">${escapeHTML(label)}</label>` +
            '<div class="bpp-field-wrapper">' +
              `<select id="cam-extensionElements-${escapeHTML(id)}"` +
                      'name="selectedExtensionElement" ' +
                      `size="${escapeHTML(defaultSize)}" ` +
                      'data-list-entry-container ' +
                      'data-on-change="selectElement">' +
              `</select>${ 
              canCreate ? `${'<button class="action-button add" ' +
                                   'id="cam-extensionElements-create-'}${escapeHTML(id)}" ` +
                                   'data-action="createElement">' +
                             '<span>+</span>' +
                           '</button>' : '' 
              }${canRemove ? `${'<button class="action-button clear" ' +
                                   'id="cam-extensionElements-remove-'}${escapeHTML(id)}" ` +
                                   'data-action="removeElement" ' +
                                   'data-disable="disableRemove">' +
                             '<span>-</span>' +
                           '</button>' : '' 
              }<button class="action-button down fa fa-arrow-down" id="cam-extensionElements-down-${escapeHTML(id)}" data-action="moveDown" data-disable="disableMoveDown"><span>d</span></button>` +
              `<button class="action-button up fa fa-arrow-up" id="cam-extensionElements-up-${escapeHTML(id)}" data-action="moveUp" data-disable="disableMoveUp"><span>u</span></button>` +
            '</div>' +
          '</div>',

    get: function (element, node) {
      var elements = getElements(element, node);

      var result = [];
      forEach(elements, function (elem) {
        result.push({
          extensionElementValue: elem.get(modelProperty)
        });
      });

      var selectBox = getSelectBox(node.parentNode, id);
      initSelectionSize(selectBox, result.length);

      return result;
    },

    set: function (element, values, node) {
      var action = this.__action;
      delete this.__action;

      businessObject = businessObject || getBusinessObject(element);

      var bo =
        (reference && businessObject.get(reference)) ? businessObject.get(reference) : businessObject;

      var extensionElements = bo.get('extensionElements');

      if (action.id === CREATE_EXTENSION_ELEMENT_ACTION) {
        var commands = [];
        if (!extensionElements) {
          extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
          commands.push(cmdHelper.updateBusinessObject(element, bo, { extensionElements: extensionElements }));
        }
        commands.push(createElement(element, extensionElements, action.value, node));
        return commands;

      } else if (action.id === REMOVE_EXTENSION_ELEMENT_ACTION) {
        return removeElement(element, extensionElements, action.value, action.idx, node);
      }

    },

    createListEntryTemplate: function (value, index, selectBox) {
      initSelectionSize(selectBox, selectBox.options.length + 1);
      return createOption(value.extensionElementValue);
    },

    deselect: function (element, node) {
      var selectBox = getSelectBox(node, id);
      selectBox.selectedIndex = -1;
    },

    getSelected: function (element, node) {
      return getSelected(node, id);
    },

    setControlValue: function (element, node, option, property, value, idx) {
      node.value = value;

      if (!setOptionLabelValue) {
        node.text = value;
      } else {
        setOptionLabelValue(element, node, option, property, value, idx);
      }
    },

    createElement: function (element, node) {

      // create option template
      var generatedId;
      if (idGeneration) {
        generatedId = generateElementId(prefix);
      }

      var selectBox = getSelectBox(node, id);
      var template = domify(createOption(generatedId));

      // add new empty option as last child element
      selectBox.appendChild(template);

      // select last child element
      selectBox.lastChild.selected = 'selected';
      selectionChanged(element, node);

      // update select box size
      initSelectionSize(selectBox, selectBox.options.length);

      this.__action = {
        id: CREATE_EXTENSION_ELEMENT_ACTION,
        value: generatedId
      };

      return true;
    },

    removeElement: function (element, node) {
      var selection = getSelected(node, id);

      var selectBox = getSelectBox(node, id);
      selectBox.removeChild(selectBox.options[selection.idx]);

      // update select box size
      initSelectionSize(selectBox, selectBox.options.length);

      this.__action = {
        id: REMOVE_EXTENSION_ELEMENT_ACTION,
        value: selection.value,
        idx: selection.idx
      };

      return true;
    },

    hideElements: function (element, entryNode, node, scopeNode) {
      return !hideElements(element, entryNode, node, scopeNode);
    },

    disableRemove: function (element, entryNode, node, scopeNode) {
      return (getSelected(entryNode, id) || {}).idx < 0;
    },

    selectElement: selectionChanged,

    moveUp: function (element, node) {
        var selection = getSelected(node, id);
            var selectBox = getSelectBox(node, id);
            var elements = getElements(element, node);

        var prevOption = selectBox.options[selection.idx - 1];
            var currentOption = selectBox.options[selection.idx];

        var prevElement = elements[prevOption.index];
            var currentElement = elements[currentOption.index];

        elements[prevOption.index] = currentElement;
        elements[currentOption.index] = prevElement;

        currentOption.parentNode.insertBefore(currentOption, prevOption);    
        
        entryMoved(element);
    },

    disableMoveUp: function (element, node) {
        var selection = getSelected(node, id);
            var selectBox = getSelectBox(node, id);

        return !(selectBox && selection && selectBox.options[selection.idx - 1]);
    },

    moveDown: function (element, node) {
        var selection = getSelected(node, id);
            var selectBox = getSelectBox(node, id);
            var elements = getElements(element, node);

        var nextOption = selectBox.options[selection.idx + 1];
            var currentOption = selectBox.options[selection.idx];

        var nextElement = elements[nextOption.index];
            var currentElement = elements[currentOption.index];

        elements[nextOption.index] = currentElement;
        elements[currentOption.index] = nextElement;

        currentOption.parentNode.insertBefore(nextOption, currentOption);

        entryMoved(element);
    },

    disableMoveDown: function (element, node) {
        var selection = getSelected(node, id);
            var selectBox = getSelectBox(node, id);

        return !(selectBox && selection && selectBox.options[selection.idx + 1] && selection.idx > -1);
    }
  };
};
