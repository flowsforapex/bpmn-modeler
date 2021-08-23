import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

var extensionElementsEntry = require('./custom/ExtensionElements');
var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

const TYPE_PROCESS_VARIABLE = 'apex:ProcessVariable';
var procVarProps = [];
var preProcessVariables;
var postProcessVariables;

function getEntries(element, type) {
  var bo = getBusinessObject(element);
  return bo &&
    extensionElementsHelper.getExtensionElements(bo, `apex:${type}`) &&
    extensionElementsHelper.getExtensionElements(bo, `apex:${type}`)[0] ? extensionElementsHelper.getExtensionElements(bo, `apex:${type}`)[0]
        .procVars : [];
}

export function isSelected(element, node) {
  return typeof getSelectedEntry(element, node) !== 'undefined';
}

export function getSelectedEntry(element, node) {
  var selection;
  var entry;

  if (element && procVarProps) {
    procVarProps.forEach((e) => {
      if (e.getSelected(element, node).idx > -1) {
        selection = e.getSelected(element, node);
        entry = getEntries(element, e.id)[selection.idx];
      }
    });
  }
  
  return entry;
}

var setOptionLabelValue = function (type) {
  return function (element, node, option, property, value, idx) {
    var entries = getEntries(element, type);
    var entry = entries[idx];

    var label = entry ? entry.get('varName') +
        (entry.get('varExpression') && ` : ${entry.get('varExpression')}`) : '';

    option.text = label;
    option.value = entry && entry.get('varName');
  };
};

var newElement = function (bpmnFactory, type, props) {
  return function (element, extensionElements, values) {
    var commands = [];

    var container = extensionElementsHelper.getExtensionElements(getBusinessObject(element), `apex:${type}`) &&
      extensionElementsHelper.getExtensionElements(getBusinessObject(element), `apex:${type}`)[0];

    if (!container) {
      container = elementHelper.createElement(`apex:${type}`, {}, extensionElements, bpmnFactory);
      commands.push(cmdHelper.addElementsTolist(element, extensionElements, 'values', [container, ]));
    }

    var index = (container.procVars && String(container.procVars.length)) || '0';
    var re = new RegExp(`${props.varName}_\\d$`);
    var newNumber = (container.procVars && container.procVars.filter(e => e.varName.match(re)).map(e => parseInt(e.varName.split('_')[1])).reduce((a, b) => Math.max(a, b), -1)) + 1 || 0;

    values = {
      varSequence: String(index),
      varName: `${props.varName}_${newNumber}`,
      varDataType: props.varDataType,
      varExpression: props.varExpression,
      varExpressionType: props.varExpressionType,
    };

    var newElem = elementHelper.createElement(
      TYPE_PROCESS_VARIABLE,
      values,
      container,
      bpmnFactory
    );
    commands.push(cmdHelper.addElementsTolist(element, container, 'procVars', [newElem]));

    return commands;
  };
};

var removeElement = function (type) {
  return function (element, extensionElements, value, idx) {
    var container = extensionElementsHelper.getExtensionElements(getBusinessObject(element), `apex:${type}`) &&
      extensionElementsHelper.getExtensionElements(getBusinessObject(element), `apex:${type}`)[0];

    var entries = getEntries(element, type);
    var entry = entries[idx];
    if (entry) {
      var command = container.procVars.length > 1 ? cmdHelper.removeElementsFromList(element, container, 'procVars', 'extensionElements', [entry]) : cmdHelper.removeElementsFromList(element, extensionElements, 'values', 'extensionElements', [container]);
      return command;
    }
  };
};

function resetSequences(element, type) {
  var entries = getEntries(element, type);
  entries.forEach((e, i) => e.set('varSequence', String(i)));
}

export function procVarLists(element, bpmnFactory, elementRegistry, translate, options) {
  procVarProps = [];

  if (options.type1) {
    var { type1 } = options;
    var { label1 } = options;

    // create first list element
    var preProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id: type1,
      label: label1,

      createExtensionElement: newElement(bpmnFactory, type1, {
        varName: translate(type1),
        varDataType: 'VARCHAR2',
        varExpression: '',
        varExpressionType: 'static',
      }),
      removeExtensionElement: removeElement(type1),

      getExtensionElements: function (element) {
        return getEntries(element, type1);
      },

      onSelectionChange: function (element, node) {
        if (postProcessVariables) postProcessVariables.deselect(element, node);
      },

      setOptionLabelValue: setOptionLabelValue(type1),

      onEntryMoved: resetSequences(element, type1),
    });

    procVarProps.push(preProcessVariables);
  }
  
  if (options.type2) {
    var { type2 } = options;
    var { label2 } = options;

    // create second list element
    var postProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id: type2,
      label: label2,

      createExtensionElement: newElement(bpmnFactory, type2, {
        varName: translate(type2),
        varDataType: 'VARCHAR2',
        varExpression: '',
        varExpressionType: 'static',
      }),

      removeExtensionElement: removeElement(type2),

      getExtensionElements: function (element) {
        return getEntries(element, type2);
      },

      onSelectionChange: function (element, node) {
        if (preProcessVariables) preProcessVariables.deselect(element, node);
      },

      setOptionLabelValue: setOptionLabelValue(type2),

      onEntryMoved: resetSequences(element, type2),
    });

    procVarProps.push(postProcessVariables);
  }

  return procVarProps;
}
