import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements'),
    extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
    elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper')

const TYPE = 'apex:processVariable';
var listElements;

function getEntries(element, scope) {
    var bo = getBusinessObject(element);
    return bo && extensionElementsHelper.getExtensionElements(bo, TYPE) && extensionElementsHelper.getExtensionElements(bo, TYPE).filter(e => e.varScope == scope) || [];
}

export function getSelectedEntry(element, node) {

    var selection,
        entry;

    if (element && listElements) {
        listElements.forEach(e => {
            if (e.listObject && e.listObject.getSelected(element, node).idx > -1) {
                selection = e.listObject.getSelected(element, node);
                entry = getEntries(element, e.scope)[selection.idx];
            }
        });
    }

    return entry;
}

var setOptionLabelValue = function(scope) {
    return function(element, node, option, property, value, idx) {
        var entries = getEntries(element, scope);
        var entry = entries[idx];

        var label = entry ? ('(' + entry.get('varSequence') + ') ' + entry.get('varName') + (entry.get('varExpression') && (' : ' + entry.get('varExpression')))) : '';

        option.text = label;
    };
};

var newElement = function(bpmnFactory, props) {
    return function(element, extensionElements, values) {
        // retrieve counter
        var nextSequence = getEntries(element, props.varScope).length + 1;

        values = {
        varSequence: String(nextSequence),
        varName: props.varName + '_' + nextSequence,
        varDataType: props.varDataType,
        varExpression: props.varExpression,
        varExpressionType: props.varExpressionType,
        varScope: props.varScope,
        }

        var newElem = elementHelper.createElement(TYPE, values, extensionElements, bpmnFactory);
        return cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newElem ]);
    };
};

var removeElement = function(scope) {
    return function(element, extensionElements, value, idx) {
        var entries = getEntries(element, scope);
        var entry = entries[idx];
        if (entry) {
            var bo = getBusinessObject(element);
            return extensionElementsHelper.removeEntry(bo, element, entry);
        }
    };
};

export function procVarLists(element, bpmnFactory, translate, options) {

    var procVarProps = [];

    var scope1 = options.scope1,
        label1 = options.label1

    // create first list element
    var preProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id : scope1,
      label : label1,

      createExtensionElement: newElement(bpmnFactory, {
          varSequence: '0', // TODO count gesamtzahl
          varName: 'pre',
          varDataType: 'varchar2',
          varExpression: '',
          varExpressionType: 'static',
          varScope: scope1
      }),
      removeExtensionElement: removeElement(scope1),

      getExtensionElements: function(element) {
          return getEntries(element, scope1);
      },

      onSelectionChange: function(element, node) {
          postProcessVariables.deselect(element, node);
      },

      setOptionLabelValue: setOptionLabelValue(scope1)
    });

    procVarProps.push(preProcessVariables);

    var scope2 = options.scope2,
        label2 = options.label2;

    // create second list element
    var postProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id : scope2,
      label : label2,

      createExtensionElement: newElement(bpmnFactory, {
        varSequence: '0', // TODO count gesamtzahl
        varName: 'post',
        varDataType: 'varchar2',
        varExpression: '',
        varExpressionType: 'static',
        varScope: scope2
      }),

      removeExtensionElement: removeElement(scope2),

      getExtensionElements: function(element) {
          return getEntries(element, scope2);
      },

      onSelectionChange: function(element, node) {
          preProcessVariables.deselect(element, node);
      },

      setOptionLabelValue: setOptionLabelValue(scope2)
    });
    
    procVarProps.push(postProcessVariables);

    // set list items references
    listElements = [
      {
        listObject: preProcessVariables,
        scope: scope1
      },
      {
        listObject: postProcessVariables,
        scope: scope2
      }
    ];
    
  return procVarProps;
}
