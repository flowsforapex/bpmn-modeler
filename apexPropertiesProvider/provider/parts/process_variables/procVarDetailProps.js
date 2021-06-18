var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

export default function(element, bpmnFactory, options, translate) {

    var detailProps = [];

    options = options || {};
  
    var getSelectedEntry = options.getSelectedEntry;
  
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
    detailProps.push(
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
    detailProps.push(
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
    detailProps.push(
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
    detailProps.push(
      entryFactory.selectBox(translate, {
        id: 'varExpressionType',
        //description: 'Expression type',
        label: 'Expression Type',
        modelProperty: 'varExpressionType',
  
        get: getProperty('varExpressionType'),
  
        set: setProperty(),
  
        selectOptions: expressionTypeOptions,
  
        hidden: notSelected
      })
    );

    // var EXPRESSION_LABEL = {
    //   static: 'Static',
    //   processVariable: 'Process Variable',
    //   pageItem: 'Page Item',
    //   sqlQuerySingle: 'SQL query returning a single value',
    //   sqlQueryList: 'SQL query returning a colon delimited list',
    //   plsqlExpression: 'PLSQL Expression',
    //   plsqlFunctionBody: 'PLSQL Function Body'
    // };
  
    // expression
    detailProps.push(
      entryFactory.textBox(translate, {
        id: 'varExpression',
        //description: 'Expression',
        label: 'Expression',
        //dataValueLabel: 'expressionLabel',
        modelProperty: 'varExpression',
  
        // get: function(element, node) {

        //   var entry = getSelectedEntry(element, node);
        //   //var expressionType = (entry && entry.get('expressionType')) || undefined;
    
        //   return {
        //     varExpression: (entry && entry.get('varExpression')) || undefined,
        //     //expressionLabel: EXPRESSION_LABEL[expressionType] || ''
        //   }
        // },

        get: getProperty('varExpression'),
    
        set: setProperty(),

        show: isSelected

        // validate: function(element, values, node) {
        //   var varExpression = values.varExpression,
        //   validate = {};

        //   if (typeof varExpression == 'undefined' || (varExpression && varExpression.length < 1)) {
        //     validate.varExpression = 'Enter expression';
        //   }
        //   return validate;
        // }

      })
    );

    return detailProps;
  
  }