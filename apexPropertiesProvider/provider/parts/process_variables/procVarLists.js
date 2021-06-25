import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

var extensionElementsEntry = require('./helper/ExtensionElements'),
    extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
    elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper')

const TYPE_PROCESS_VARIABLE = 'apex:processVariable';
var procVarProps = [];

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

    if (element && procVarProps) {
        procVarProps.forEach(e => {
            if (e.getSelected(element, node).idx > -1) {
                selection = e.getSelected(element, node);
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

        var label = entry ? (entry.get('varName') + (entry.get('varExpression') && (' : ' + entry.get('varExpression')))) : '';

        option.text = label;
        option.value = entry && entry.get('varName');
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

        var index = (container.procVars && String(container.procVars.length)) || '0';
        var re = new RegExp(props.varName + "_\\d$");
        var newNumber = (container.procVars && container.procVars.filter(e => e.varName.match(re)).map(e => parseInt(e.varName.split('_')[1])).reduce((a, b) => {return Math.max(a, b)}))+1 || 0;

        values = {
            varSequence: String(index),
            varName: props.varName + '_' + newNumber,
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

        var container = extensionElementsHelper.getExtensionElements(getBusinessObject(element), type) && extensionElementsHelper.getExtensionElements(getBusinessObject(element), type)[0];

        var entries = getEntries(element, type);
        var entry = entries[idx];
        if (entry) {
            var command = (container.procVars.length > 1) ? 
                cmdHelper.removeElementsFromList(element, container, 'procVars', 'extensionElements', [ entry ]) :
                cmdHelper.removeElementsFromList(element, extensionElements, 'values', 'extensionElements', [ container ]);
            return command;
        }
    };
};

export function procVarLists(element, bpmnFactory, translate, options) {

    procVarProps = [];
    
    if (options.type1) {

        var type1 = options.type1,
            label1 = options.label1;

        // create first list element
        var preProcessVariables = extensionElementsEntry(element, bpmnFactory, {
        id : 'pre',
        label : label1,
        type: type1,

        createExtensionElement: newElement(bpmnFactory, type1, {
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
            if (postProcessVariables)
                postProcessVariables.deselect(element, node);
        },

        setOptionLabelValue: setOptionLabelValue(type1),

        onEntryMoved : function(element) {
            var entries = getEntries(element, type1);
            entries.forEach((e, i) => e.set('varSequence', String(i)));
        }
        });

        procVarProps.push(preProcessVariables);

    }

    if (options.type2) {

        var type2 = options.type2,
            label2 = options.label2;

        // create second list element
        var postProcessVariables = extensionElementsEntry(element, bpmnFactory, {
        id : 'post',
        label : label2,
        type: type2,

        createExtensionElement: newElement(bpmnFactory, type2, {
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
            if (preProcessVariables)
                preProcessVariables.deselect(element, node);
        },

        setOptionLabelValue: setOptionLabelValue(type2),

        onEntryMoved : function(element) {
            var entries = getEntries(element, type2);
            entries.forEach((e, i) => e.set('varSequence', String(i)));
        }
        });
        
        procVarProps.push(postProcessVariables);
    }
    
  return procVarProps;
}
