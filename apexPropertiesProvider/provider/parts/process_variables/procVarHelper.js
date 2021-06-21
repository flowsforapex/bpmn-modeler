import { selectedOption } from 'bpmn-js-properties-panel/lib/Utils';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

var is = require('bpmn-js/lib/util/ModelUtil').is;

var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements'),
    extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
    elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper')


const TYPE = 'apex:processVariable';
var listElements;

export function setListElements(lists) {
    listElements = lists;
}
    
export function getEntries(element) {
    var bo = getBusinessObject(element)
    return bo && extensionElementsHelper.getExtensionElements(bo, TYPE) || [];
}

export function getFilteredEntries(element, filter) {
    var bo = getBusinessObject(element);
    return bo && extensionElementsHelper.getExtensionElements(bo, TYPE) && extensionElementsHelper.getExtensionElements(bo, TYPE).filter(e => e.varScope == filter.varScope) || [];
}

export function getSelectedEntry(element, node) {

    var selection,
        entry

    if (element) {
        listElements.forEach(e => {
            if (e.listObject && e.listObject.getSelected(element, node).idx > -1) {
                selection = e.listObject.getSelected(element, node);
                entry = getFilteredEntries(element, e.filter)[selection.idx];
            }
        });
    }

    return entry;

    // if (element) {
    //     lists.forEach(e => {
    //         selection = e.getSelected(element, node);
    //         if (selection.idx > -1) {
    //             entry = getFilteredEntries(element, e.id)[selection.idx];
    //         }
    //     });
    // }
}

export var setOptionLabelValue = function(filter) {
    return function(element, node, option, property, value, idx) {
        var entries = getFilteredEntries(element, filter);
        var entry = entries[idx];

        var label = entry ? ('(' + entry.get('varSequence') + ') ' + entry.get('varName') + ' : ' + entry.get('varExpression')) : '';

        option.text = label;
    };
};

export var newElement = function(bpmnFactory, props) {
    return function(element, extensionElements, value) {
        props.varSequence = String(getFilteredEntries(element, props).length + 1);
        var newElem = elementHelper.createElement(TYPE, props, extensionElements, bpmnFactory);
        return cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newElem ]);
    };
};

export var removeElement = function(filter) {
    return function(element, extensionElements, value, idx) {
        var entries = getFilteredEntries(element, filter);
        var entry = entries[idx];
        if (entry) {
            var bo = getBusinessObject(element);
            return extensionElementsHelper.removeEntry(bo, element, entry);
        }
    };
};

export function isSelected(element, node) {
    return getSelectedEntry(element, node);
};

export function notSelected(element, node) {
    return (typeof getSelectedEntry(element, node) == 'undefined');
}

export var getProperty = function(property) {
    return function(element, node) {

        var entry = getSelectedEntry(element, node);

        return {
            [property]: (entry && entry.get(property)) || undefined
        }
    }
}

export var setProperty = function() {
    return function(element, values, node) {
    var entry = getSelectedEntry(element, node);

    return cmdHelper.updateBusinessObject(element, entry, values);
    }
}