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
          id: 'varSeq',
          description: 'Execution sequence',
          label: 'Sequence',
          modelProperty: 'sequence',
  
          get: function(element, node) {
            var entry = getSelectedEntry(element, node);
            
            return {
              sequence: (entry && entry.get('sequence')) || undefined
            }
          },
      
          set: function(element, values, node) {
            var entry = getSelectedEntry(element, node);

            return cmdHelper.updateBusinessObject(element, entry, {
              sequence: values.sequence || ''
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
        modelProperty: 'name',
  
        get: function(element, node) {
          var entry = getSelectedEntry(element, node);
    
          return {
            name: (entry && entry.get('name')) || undefined
          }
        },
    
        set: function(element, values, node) {
          var entry = getSelectedEntry(element, node);
    
          return cmdHelper.updateBusinessObject(element, entry, {
            name: values.name || ''
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
        //description: 'Data Type',
        label: 'Data Type',
        modelProperty: 'dataType',
  
        get: function(element, node) {
          var entry = getSelectedEntry(element, node);
    
          return {
            dataType: (entry && entry.get('dataType')) || undefined
          }
        },
    
        set: function(element, values, node) {
          var entry = getSelectedEntry(element, node);
    
          return cmdHelper.updateBusinessObject(element, entry, {
            dataType: values.dataType || ''
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
        id: 'varExprType',
        //description: 'Expression type',
        label: 'Expression Type',
        modelProperty: 'expressionType',
  
        get: function(element, node) {
          var entry = getSelectedEntry(element, node);
  
          return {
            expressionType: (entry && entry.get('expressionType')) || undefined
          };
        },
  
        set: function(element, values, node) {
          var entry = getSelectedEntry(element, node);
              
          return cmdHelper.updateBusinessObject(element, entry, {
              expressionType: values.expressionType || ''
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
        id: 'varExpr',
        //description: 'Expression',
        label: 'Expression',
        //dataValueLabel: 'expressionLabel',
        modelProperty: 'expression',
  
        get: function(element, node) {

          var entry = getSelectedEntry(element, node);
          //var expressionType = (entry && entry.get('expressionType')) || undefined;
    
          return {
            expression: (entry && entry.get('expression')) || undefined,
            //expressionLabel: EXPRESSION_LABEL[expressionType] || ''
          }
        },
    
        set: function(element, values, node) {
          var entry = getSelectedEntry(element, node);
    
          return cmdHelper.updateBusinessObject(element, entry, {
            expression: values.expression || ''
          });
        },

        show: function(element, node) {
          return isSelected(element, node);
        }
      })
    );

    return detailProps;
  
  }