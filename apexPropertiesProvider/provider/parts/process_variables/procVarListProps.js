var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements'),
    extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
    elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper')

export default function(element, bpmnFactory, options, translate) {

    var bo;
  
    var result = {
      getSelectedEntry: getSelectedEntry
    };
  
    var entries = result.entries = [];

    function getEntries(bo, type) {
      return bo && extensionElementsHelper.getExtensionElements(bo, type) || [];
    }
  
    function getSelectedEntry(element, node) {
      var selection = (processVariablesEntry && processVariablesEntry.getSelected(element, node)) || { idx: -1 };
  
      var entry = getEntries(bo, 'apex:apexProcessVariable')[selection.idx];
  
      return entry;
    }
  
    var setOptionLabelValue = function(type) {
      return function(element, node, option, property, value, idx) {
        var entries = getEntries(bo, type);
        var entry = entries[idx];
  
        var label = ('(' + entry.get('varSequence') + ') ' + entry.get('varName') + ' : ' + entry.get('varExpression'));
  
        option.text = label;
      };
    };
  
    var newElement = function(element, type) {
      return function(element, extensionElements, value) {
        var props = {
          varSequence: String(getEntries(bo, type).length + 1),
          varName: '',
          varDataType: 'varchar2',
          varExpression: '',
          varExpressionType: 'static',
        };
  
        var newElem = elementHelper.createElement(type, props, extensionElements, bpmnFactory);
  
        return cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newElem ]);
      };
    };
  
    var removeElement = function(element, type) {
      return function(element, extensionElements, value, idx) {
        var entries = getEntries(bo, type);
        var entry = entries[idx];
        if (entry) {
          return extensionElementsHelper.removeEntry(bo, element, entry);
        }
      };
    };
  
    bo = getBusinessObject(element);

    if (bo) {

      var processVariablesEntry = extensionElementsEntry(element, bpmnFactory, {
        id : 'procVar',
        label : 'Process Variables',
        // modelProperty: 'apexProcessVariable',

        createExtensionElement: newElement(element, 'apex:apexProcessVariable'),
        removeExtensionElement: removeElement(element, 'apex:apexProcessVariable'),

        getExtensionElements: function(element) {
          return getEntries(bo, 'apex:apexProcessVariable');
        },

        setOptionLabelValue: setOptionLabelValue('apex:apexProcessVariable')

      });
      entries.push(processVariablesEntry);
    }
  
    return result;
  
  };