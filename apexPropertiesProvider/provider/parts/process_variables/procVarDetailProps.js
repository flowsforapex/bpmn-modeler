var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

export default function(element, bpmnFactory, options, translate) {

    var detailProps = [];

    options = options || {};
  
    var getSelectedEntry = options.getSelectedEntry;
  
    var isSelected = function(element, node) {
      return getSelectedEntry(element, node);
    };

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
  
    // sequence field
    detailProps.push(
        entryFactory.textField(translate, {
          id: 'varSequence',
          description: 'Execution sequence',
          label: 'Sequence',
          modelProperty: 'varSequence',
  
          get: function(element, node) {
            var entry = getSelectedEntry(element, node);
            
            return {
              varSequence: (entry && entry.get('varSequence')) || undefined
            }
          },
      
          set: function(element, values, node) {
            var entry = getSelectedEntry(element, node);

            return cmdHelper.updateBusinessObject(element, entry, {
              varSequence: values.varSequence || ''
            });
          },

          hidden: function(element, node) {
            return !isSelected(element, node);
          }
        })
    );
  
    // name field
    detailProps.push(
      entryFactory.textField(translate, {
        id: 'varName',
        description: 'Variable name',
        label: 'Name',
        modelProperty: 'varName',
  
        get: function(element, node) {
          var entry = getSelectedEntry(element, node);
    
          return {
            varName: (entry && entry.get('varName')) || undefined
          }
        },
    
        set: function(element, values, node) {
          var entry = getSelectedEntry(element, node);
    
          return cmdHelper.updateBusinessObject(element, entry, {
            varName: values.varName || ''
          });
        },

        hidden: function(element, node) {
          return !isSelected(element, node);
        }
      })
    );

    // datatype field
    detailProps.push(
      entryFactory.selectBox(translate, {
        id: 'varDataType',
        description: 'Data Type',
        label: 'Data Type',
        modelProperty: 'varDataType',
  
        get: function(element, node) {
          var entry = getSelectedEntry(element, node);
    
          return {
            varDataType: (entry && entry.get('varDataType')) || undefined
          }
        },
    
        set: function(element, values, node) {
          var entry = getSelectedEntry(element, node);
    
          return cmdHelper.updateBusinessObject(element, entry, {
            varDataType: values.varDataType || ''
          });
        },

        selectOptions: dataTypeOptions,

        hidden: function(element, node) {
          return !isSelected(element, node);
        }
      })
    );
  
    // expression type
    detailProps.push(
      entryFactory.selectBox(translate, {
        id: 'varExpressionType',
        //description: 'Expression type',
        label: 'Expression Type',
        modelProperty: 'varExpressionType',
  
        get: function(element, node) {
          var entry = getSelectedEntry(element, node);
  
          return {
            varExpressionType: (entry && entry.get('varExpressionType')) || undefined
          };
        },
  
        set: function(element, values, node) {
          var entry = getSelectedEntry(element, node);
              
          return cmdHelper.updateBusinessObject(element, entry, {
            varExpressionType: values.varExpressionType || ''
            });
        },
  
        selectOptions: expressionTypeOptions,
  
        hidden: function(element, node) {
          return !isSelected(element, node);
        }
      })
    );

    var EXPRESSION_LABEL = {
      static: 'Static',
      processVariable: 'Process Variable',
      pageItem: 'Page Item',
      sqlQuerySingle: 'SQL query returning a single value',
      sqlQueryList: 'SQL query returning a colon delimited list',
      plsqlExpression: 'PLSQL Expression',
      plsqlFunctionBody: 'PLSQL Function Body'
    };
  
    // expression
    detailProps.push(
      entryFactory.textBox(translate, {
        id: 'varExpression',
        //description: 'Expression',
        label: 'Expression',
        //dataValueLabel: 'expressionLabel',
        modelProperty: 'varExpression',
  
        get: function(element, node) {

          var entry = getSelectedEntry(element, node);
          //var expressionType = (entry && entry.get('expressionType')) || undefined;
    
          return {
            varExpression: (entry && entry.get('varExpression')) || undefined,
            //expressionLabel: EXPRESSION_LABEL[expressionType] || ''
          }
        },
    
        set: function(element, values, node) {
          var entry = getSelectedEntry(element, node);
    
          return cmdHelper.updateBusinessObject(element, entry, {
            varExpression: values.varExpression || ''
          });
        },

        show: function(element, node) {
          return isSelected(element, node);
        }
      })
    );

    return detailProps;
  
  }