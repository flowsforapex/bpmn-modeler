var is = require('bpmn-js/lib/util/ModelUtil').is;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
    extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements');

import * as procVarHelper from './procVarHelper.js';

export default function (element, bpmnFactory, translate) {

  var procVarProps = [];

  if (
    is(element, 'bpmn:Task') ||
    is(element, 'bpmn:UserTask') ||
    is(element, 'bpmn:ScriptTask') ||
    is(element, 'bpmn:ServiceTask') ||
    is(element, 'bpmn:ManualTask')
  ) {

    // create first list element
    var preProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id : 'pre',
      label : 'Pre-Task',

      createExtensionElement: procVarHelper.newElement(bpmnFactory, {
          varSequence: '0', // TODO count gesamtzahl
          varName: '',
          varDataType: 'varchar2',
          varExpression: '',
          varExpressionType: 'static',
          varScope: 'pre'
      }),
      removeExtensionElement: procVarHelper.removeElement({ varScope: 'pre' }),

      getExtensionElements: function(element) {
          return procVarHelper.getFilteredEntries(element, {
            varScope: 'pre'
          });
      },

      onSelectionChange: function(element, node, event, scope) {
          postProcessVariables.deselect(element, node);
      },

      setOptionLabelValue: procVarHelper.setOptionLabelValue({
        varScope: 'pre'
      })
    });

    procVarProps.push(preProcessVariables);

    // create second list element
    var postProcessVariables = extensionElementsEntry(element, bpmnFactory, {
      id : 'post',
      label : 'Post-Task',

      createExtensionElement: procVarHelper.newElement(bpmnFactory, {
        varSequence: '0', // TODO count gesamtzahl
        varName: '',
        varDataType: 'varchar2',
        varExpression: '',
        varExpressionType: 'static',
        varScope: 'post'
      }),

      removeExtensionElement: procVarHelper.removeElement({ varScope: 'post' }),

      getExtensionElements: function(element) {
          return procVarHelper.getFilteredEntries(element, {
            varScope: 'post'
          });
      },

      onSelectionChange: function(element, node, event, scope) {
          preProcessVariables.deselect(element, node);
      },

      setOptionLabelValue: procVarHelper.setOptionLabelValue({
        varScope: 'post'
      })
    });
    
    procVarProps.push(postProcessVariables);

    // create detail form items
    var lists = [
      {
        listObject: preProcessVariables,
        filter: {
          varScope: 'pre'
        }
      },
      {
        listObject: postProcessVariables,
        filter: {
          varScope: 'post'
        }
      }
    ];

    procVarHelper.setListElements(lists);

    // sequence field
    procVarProps.push(
      entryFactory.textField(translate, {
        id: 'varSequence',
        description: 'Execution sequence',
        label: 'Sequence',
        modelProperty: 'varSequence',

        get: procVarHelper.getProperty('varSequence'),
    
        set: procVarHelper.setProperty(),

        hidden: procVarHelper.notSelected()
      })
  );

  // name field
  procVarProps.push(
    entryFactory.textField(translate, {
      id: 'varName',
      description: 'Variable name',
      label: 'Name',
      modelProperty: 'varName',

      get: procVarHelper.getProperty('varName'),
  
      set: procVarHelper.setProperty(),

      hidden: procVarHelper.notSelected()
    })
  );

  // datatype field
  procVarProps.push(
    entryFactory.selectBox(translate, {
      id: 'varDataType',
      description: 'Data Type',
      label: 'Data Type',
      modelProperty: 'varDataType',

      get: procVarHelper.getProperty('varDataType'),
  
      set: procVarHelper.setProperty(),

      selectOptions: [
        {name: 'Varchar2', value: 'varchar2'},
        {name: 'Number', value: 'number'},
        {name: 'Date', value: 'date'},
        {name: 'Clob', value: 'clob'},
      ],

      hidden: procVarHelper.notSelected()
    })
  );

  // expression type
  procVarProps.push(
    entryFactory.selectBox(translate, {
      id: 'varExpressionType',
      label: 'Expression Type',
      modelProperty: 'varExpressionType',

      get: procVarHelper.getProperty('varExpressionType'),

      set: procVarHelper.setProperty(),

      selectOptions: [
        {name: 'Static', value: 'static'},
        {name: 'Process Variable', value: 'processVariable'},
        {name: 'Page Item', value: 'pageItem'},
        {name: 'SQL query (single value)', value: 'sqlQuerySingle'},
        {name: 'SQL query (colon delimited list)', value: 'sqlQueryList'},
        {name: 'PLSQL Expression', value: 'plsqlExpression'},
        {name: 'PLSQL Function Body', value: 'plsqlFunctionBody'},
      ],

      hidden: procVarHelper.notSelected()
    })
  );

  // expression
  procVarProps.push(
    entryFactory.textBox(translate, {
      id: 'varExpression',
      label: 'Expression',
      modelProperty: 'varExpression',

      get: procVarHelper.getProperty('varExpression'),
  
      set: procVarHelper.setProperty(),

      show: procVarHelper.isSelected()
    })
  );
  }
  
  return procVarProps;
}
