var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements'),
    extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
    elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper')

export default function (element, bpmnFactory, translate, options) {

  var prePanel = options.prePanelLabel || false,
      postPanel = options.postPanelLabel || false;

  var procVarProps = [];
  var bo;

  function getEntries(bo, type) {
      return bo && extensionElementsHelper.getExtensionElements(bo, type) || [];
  }

  function getFilteredEntries(bo, type, scope) {
      return bo && extensionElementsHelper.getExtensionElements(bo, type) && extensionElementsHelper.getExtensionElements(bo, type).filter(element => element.varScope == scope) || [];
  }
  
  function getSelectedEntry(element, node) {

      var selection,
          entry

      if (preProcessVariables && preProcessVariables.getSelected(element, node).idx > -1) {
          selection = preProcessVariables.getSelected(element, node);
          entry = getFilteredEntries(bo, 'apex:processVariable', 'pre')[selection.idx];
      }
      else if (postProcessVariables && postProcessVariables.getSelected(element, node).idx > -1) {
          selection = postProcessVariables.getSelected(element, node);
          entry = getFilteredEntries(bo, 'apex:processVariable', 'post')[selection.idx];
      }
  
      return entry;
  }
  
  var setOptionLabelValue = function(type, scope) {
      return function(element, node, option, property, value, idx) {
      var entries = getFilteredEntries(bo, type, scope);
      var entry = entries[idx];
  
      var label = ('(' + entry.get('varSequence') + ') ' + entry.get('varName') + ' : ' + entry.get('varExpression'));
  
      option.text = label;
      };
  };
  
  var newElement = function(element, type, scope) {
      return function(element, extensionElements, value) {
      var props = {
          varSequence: String(getFilteredEntries(bo, type, scope).length + 1),
          varName: '',
          varDataType: 'varchar2',
          varExpression: '',
          varExpressionType: 'static',
          varScope: scope
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

  if (prePanel) {
    var preProcessVariables = extensionElementsEntry(element, bpmnFactory, {
        id : 'preProcVar',
        label : options.prePanelLabel,

        createExtensionElement: newElement(element, 'apex:processVariable', 'pre'),
        removeExtensionElement: removeElement(element, 'apex:processVariable'),

        getExtensionElements: function(element) {
            return getFilteredEntries(bo, 'apex:processVariable', 'pre');
        },

        onSelectionChange: function(element, node, event, scope) {
            if (postProcessVariables)
              postProcessVariables.deselect(element, node);
        },

        setOptionLabelValue: setOptionLabelValue('apex:processVariable', 'pre')
    });

    procVarProps.push(preProcessVariables);
  }

  if (postPanel) {
    var postProcessVariables = extensionElementsEntry(element, bpmnFactory, {
        id : 'postProcVar',
        label : options.postPanelLabel,

        createExtensionElement: newElement(element, 'apex:processVariable', 'post'),
        removeExtensionElement: removeElement(element, 'apex:processVariable'),

        getExtensionElements: function(element) {
            return getFilteredEntries(bo, 'apex:processVariable', 'post');
        },

        onSelectionChange: function(element, node, event, scope) {
          if (preProcessVariables)
            preProcessVariables.deselect(element, node);
        },

        setOptionLabelValue: setOptionLabelValue('apex:processVariable', 'post')
    });
    
    procVarProps.push(postProcessVariables);
  }

  ////////// details //////////

  var isSelected = function(element, node) {
    return getSelectedEntry(element, node);
  };

  var notSelected = function(element, node) {
    return (typeof getSelectedEntry(element, node) == 'undefined');
  }

  var dataTypeOptions = [
    {name: 'Varchar2', value: 'varchar2'},
    {name: 'Number', value: 'number'},
    {name: 'Date', value: 'date'},
    {name: 'Clob', value: 'clob'},
  ]

  var expressionTypeOptions = [
    {name: 'Static', value: 'static'},
    {name: 'Process Variable', value: 'processVariable'},
    {name: 'Page Item', value: 'pageItem'},
    {name: 'SQL query (single value)', value: 'sqlQuerySingle'},
    {name: 'SQL query (colon delimited list)', value: 'sqlQueryList'},
    {name: 'PLSQL Expression', value: 'plsqlExpression'},
    {name: 'PLSQL Function Body', value: 'plsqlFunctionBody'},
  ]

  var getProperty = function(property) {
    return function(element, node) {
      var entry = getSelectedEntry(element, node);

      return {
        [property]: (entry && entry.get(property)) || undefined
      }
    }
  }

  var setProperty = function() {
    return function(element, values, node) {
      var entry = getSelectedEntry(element, node);

      return cmdHelper.updateBusinessObject(element, entry, values);
    }
  }

  // sequence field
  procVarProps.push(
      entryFactory.textField(translate, {
        id: 'varSequence',
        description: 'Execution sequence',
        label: 'Sequence',
        modelProperty: 'varSequence',

        get: getProperty('varSequence'),
    
        set: setProperty(),

        hidden: notSelected
      })
  );

  // name field
  procVarProps.push(
    entryFactory.textField(translate, {
      id: 'varName',
      description: 'Variable name',
      label: 'Name',
      modelProperty: 'varName',

      get: getProperty('varName'),
  
      set: setProperty(),

      hidden: notSelected
    })
  );

  // datatype field
  procVarProps.push(
    entryFactory.selectBox(translate, {
      id: 'varDataType',
      description: 'Data Type',
      label: 'Data Type',
      modelProperty: 'varDataType',

      get: getProperty('varDataType'),
  
      set: setProperty(),

      selectOptions: dataTypeOptions,

      hidden: notSelected
    })
  );

  // expression type
  procVarProps.push(
    entryFactory.selectBox(translate, {
      id: 'varExpressionType',
      label: 'Expression Type',
      modelProperty: 'varExpressionType',

      get: getProperty('varExpressionType'),

      set: setProperty(),

      selectOptions: expressionTypeOptions,

      hidden: notSelected
    })
  );

  // expression
  procVarProps.push(
    entryFactory.textBox(translate, {
      id: 'varExpression',
      label: 'Expression',
      modelProperty: 'varExpression',

      get: getProperty('varExpression'),
  
      set: setProperty(),

      show: isSelected
    })
  );

  return procVarProps;
}