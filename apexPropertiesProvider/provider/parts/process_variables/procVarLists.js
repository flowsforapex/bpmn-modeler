import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements'),
    extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
    elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper')

const TYPE_PROCESS_VARIABLE = 'apex:processVariable';
var listElements;

function getEntries(element, type) {
    var bo = getBusinessObject(element);
    return bo && extensionElementsHelper.getExtensionElements(bo, type) && extensionElementsHelper.getExtensionElements(bo, type)[0].procVars || [];
}

export function isSelected(element, node) {
    return (typeof getSelectedEntry(element, node) != 'undefined');
}

export function getSelectedEntry(element, node) {

    var selection,
        entry;

    if (element && listElements) {
        listElements.forEach(e => {
            if (e.listObject && e.listObject.getSelected(element, node).idx > -1) {
                selection = e.listObject.getSelected(element, node);
                entry = getEntries(element, e.type)[selection.idx];
            }
        });
    }

    return entry;
}

var setOptionLabelValue = function(type) {
    return function(element, node, option, property, value, idx) {
        var entries = getEntries(element, type);
        var entry = entries[idx];

        var label = entry ? ('(' + entry.get('varSequence') + ') ' + entry.get('varName') + (entry.get('varExpression') && (' : ' + entry.get('varExpression')))) : '';

        option.text = label;
    };
};

var newElement = function(bpmnFactory, type, props) {
    return function(element, extensionElements, values) {

        var commands = [];

        var container = extensionElementsHelper.getExtensionElements(getBusinessObject(element), type) && extensionElementsHelper.getExtensionElements(getBusinessObject(element), type)[0];

        if (!container) {
            container = elementHelper.createElement(type, {}, extensionElements, bpmnFactory);
            commands.push(cmdHelper.addElementsTolist(element, extensionElements, 'values', [ container ]));
        }

        // retrieve counter
        var nextSequence = getEntries(element, type).length + 1;

        values = {
            varSequence: String(nextSequence),
            varName: props.varName + '_' + nextSequence,
            varDataType: props.varDataType,
            varExpression: props.varExpression,
            varExpressionType: props.varExpressionType
        }

        var newElem = elementHelper.createElement(TYPE_PROCESS_VARIABLE, values, container, bpmnFactory);
        commands.push(cmdHelper.addElementsTolist(element, container, 'procVars', [ newElem ]));

        return commands;
    };
};

var removeElement = function(type) {
    return function(element, extensionElements, value, idx) {
        var entries = getEntries(element, type);
        var entry = entries[idx];
        if (entry) {
            var bo = getBusinessObject(element);
            return extensionElementsHelper.removeEntry(bo, element, entry);
        }
    };
};

export function procVarLists(element, bpmnFactory, translate, options) {

    var procVarProps = [];

    var type1 = options.type1,
        label1 = options.label1;

    // create first list element
    var preProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id : 'pre',
      label : label1,

      createExtensionElement: newElement(bpmnFactory, type1, {
          varSequence: '0', // TODO count gesamtzahl
          varName: 'pre',
          varDataType: 'varchar2',
          varExpression: '',
          varExpressionType: 'static'
      }),
      removeExtensionElement: removeElement(type1),

      getExtensionElements: function(element) {
          return getEntries(element, type1);
      },

      onSelectionChange: function(element, node) {
          postProcessVariables.deselect(element, node);
      },

      setOptionLabelValue: setOptionLabelValue(type1)
    });

    procVarProps.push(preProcessVariables);

    var type2 = options.type2,
        label2 = options.label2;

    // create second list element
    var postProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id : 'post',
      label : label2,

      createExtensionElement: newElement(bpmnFactory, type2, {
        varSequence: '0', // TODO count gesamtzahl
        varName: 'post',
        varDataType: 'varchar2',
        varExpression: '',
        varExpressionType: 'static'
      }),

      removeExtensionElement: removeElement(type2),

      getExtensionElements: function(element) {
          return getEntries(element, type2);
      },

      onSelectionChange: function(element, node) {
          preProcessVariables.deselect(element, node);
      },

      setOptionLabelValue: setOptionLabelValue(type2)
    });
    
    procVarProps.push(postProcessVariables);

    // set list items references
    listElements = [
      {
        listObject: preProcessVariables,
        type: type1
      },
      {
        listObject: postProcessVariables,
        type: type2
      }
    ];
    
  return procVarProps;
}
