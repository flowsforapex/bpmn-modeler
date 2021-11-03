var { is, getBusinessObject } = require('bpmn-js/lib/util/ModelUtil');
var entryFactory = require('./custom/EntryFactory');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var MultiCommandHandler = require('bpmn-js-properties-panel/lib/cmd/MultiCommandHandler');

import { getContainer, openEditor } from '../../customElements/monacoEditor';
import { getSelectedEntry } from './procVarLists';

export function procVarDetailProps(element, translate) {
  const DATA_TYPE_DESCRIPTION = {
    DATE: translate('Date in format YYYY-MM-DD HH24:MI:SS'),
  };

  var procVarProps = [];

  function getProperty(element, node, property) {
    var entry = getSelectedEntry(element, node);

    return {
      [property]: (entry && entry.get(property)) || undefined,
      varDataTypeDynamicDescription:
        DATA_TYPE_DESCRIPTION[entry && entry.get('varDataType')],
    };
  }

  function setProperty(element, values, node) {
    var entry = getSelectedEntry(element, node);

    if (values.varDataType !== undefined) {
      if (values.varDataType === 'NUMBER' || values.varDataType === 'DATE') {
        if (entry.varExpressionType === 'sqlQueryList') {
          entry.varExpressionType = 'static';
        }
      } else if (values.varDataType === 'CLOB') {
        entry.varExpressionType = 'processVariable';
      }
    }

    return cmdHelper.updateBusinessObject(element, entry, values);
  }

  if (
    // task elements
    is(element, 'bpmn:Task') ||
    is(element, 'bpmn:UserTask') ||
    is(element, 'bpmn:ScriptTask') ||
    is(element, 'bpmn:ServiceTask') ||
    is(element, 'bpmn:ManualTask') ||
    // gateway elements
    is(element, 'bpmn:ExclusiveGateway') ||
    is(element, 'bpmn:ParallelGateway') ||
    is(element, 'bpmn:InclusiveGateway') ||
    is(element, 'bpmn:EventBasedGateway') ||
    // event elements
    is(element, 'bpmn:StartEvent') ||
    is(element, 'bpmn:IntermediateThrowEvent') ||
    is(element, 'bpmn:IntermediateCatchEvent') ||
    is(element, 'bpmn:BoundaryEvent') ||
    is(element, 'bpmn:EndEvent')
  ) {
    // name field
    procVarProps.push(
      entryFactory.textField(translate, {
        id: 'varName',
        label: translate('Name'),
        modelProperty: 'varName',

        get: function (element, node) {
          return getProperty(element, node, 'varName');
        },

        set: function (element, values, node) {
          return setProperty(element, values, node);
        },
      })
    );

    // datatype field
    procVarProps.push(
      entryFactory.dynamicSelectBox(translate, {
        id: 'varDataType',
        label: translate('Data Type'),
        modelProperty: 'varDataType',
        dataValueDescription: 'varDataTypeDynamicDescription',

        get: function (element, node) {
          return getProperty(element, node, 'varDataType');
        },

        set: function (element, values, node) {
          return setProperty(element, values, node);
        },

        selectOptions: [
          { name: translate('Varchar2'), value: 'VARCHAR2' },
          { name: translate('Number'), value: 'NUMBER' },
          { name: translate('Date'), value: 'DATE' },
          { name: translate('Clob'), value: 'CLOB' },
        ],
      })
    );
  }

  return procVarProps;
}

export function procVarExpressionProps(element, commandStack, translate) {
  const EXPRESSION_DESCRIPTION = {
    static: translate('Static value'),
    processVariable: translate('Name of the Process Variable'),
    // pageItem: translate('Name of the APEX Page Item'),
    sqlQuerySingle: translate('SQL query returning a single value'),
    sqlQueryList: translate('SQL query returning a colon delimited list'),
    plsqlExpression: translate('PL/SQL Expression returning a value'),
    plsqlFunctionBody: translate('PL/SQL Function Body returning a value'),
  };

  var procVarProps = [];

  var getExpressionTypes = function () {
    return function (element, node) {
      var entry = getSelectedEntry(element, node);
      var expressionType = entry && entry.get('varDataType');

      switch (expressionType) {
        case 'CLOB':
          return [
            { name: translate('Process Variable'), value: 'processVariable' },
          ];
        case 'NUMBER':
        case 'DATE':
          return [
            { name: translate('Static'), value: 'static' },
            { name: translate('Process Variable'), value: 'processVariable' },
            {
              name: translate('SQL query (single value)'),
              value: 'sqlQuerySingle',
            },
            { name: translate('Expression'), value: 'plsqlExpression' },
            { name: translate('Function Body'), value: 'plsqlFunctionBody' },
          ];
        default:
          return [
            { name: translate('Static'), value: 'static' },
            { name: translate('Process Variable'), value: 'processVariable' },
            {
              name: translate('SQL query (single value)'),
              value: 'sqlQuerySingle',
            },
            {
              name: translate('SQL query (colon delimited list)'),
              value: 'sqlQueryList',
            },
            { name: translate('Expression'), value: 'plsqlExpression' },
            { name: translate('Function Body'), value: 'plsqlFunctionBody' },
          ];
      }
    };
  };

  function getProperty(element, node, property) {
    var entry = getSelectedEntry(element, node);

    return {
      [property]: (entry && entry.get(property)) || undefined,
      varExpressionDynamicDescription:
        EXPRESSION_DESCRIPTION[entry && entry.get('varExpressionType')],
    };
  }

  function setProperty(element, values, node) {
    var entry = getSelectedEntry(element, node);

    return cmdHelper.updateBusinessObject(element, entry, values);
  }

  if (
    // task elements
    is(element, 'bpmn:Task') ||
    is(element, 'bpmn:UserTask') ||
    is(element, 'bpmn:ScriptTask') ||
    is(element, 'bpmn:ServiceTask') ||
    is(element, 'bpmn:ManualTask') ||
    // gateway elements
    is(element, 'bpmn:ExclusiveGateway') ||
    is(element, 'bpmn:ParallelGateway') ||
    is(element, 'bpmn:InclusiveGateway') ||
    is(element, 'bpmn:EventBasedGateway') ||
    // event elements
    is(element, 'bpmn:StartEvent') ||
    is(element, 'bpmn:IntermediateThrowEvent') ||
    is(element, 'bpmn:IntermediateCatchEvent') ||
    is(element, 'bpmn:BoundaryEvent') ||
    is(element, 'bpmn:EndEvent')
  ) {
    // expression type
    procVarProps.push(
      entryFactory.selectBox(translate, {
        id: 'varExpressionType',
        label: translate('Expression Type'),
        modelProperty: 'varExpressionType',

        get: function (element, node) {
          return getProperty(element, node, 'varExpressionType');
        },

        set: function (element, values, node) {
          return setProperty(element, values, node);
        },

        selectOptions: getExpressionTypes(),
      })
    );

    // expression
    procVarProps.push(
      entryFactory.dynamicTextBox(translate, {
        id: 'varExpression',
        label: translate('Expression'),
        modelProperty: 'varExpression',
        dataValueDescription: 'varExpressionDynamicDescription',

        get: function (element, node) {
          return getProperty(element, node, 'varExpression');
        },

        set: function (element, values, node) {
          return setProperty(element, values, node);
        },
      })
    );

    // container for script editor
    procVarProps.push(getContainer('varExpression'));

    // link to script editor
    procVarProps.push(
      entryFactory.link(translate, {
        id: 'varExpressionEditor',
        buttonLabel: 'Open Editor',
        handleClick: function (element, node, event) {
          var getVarExpression = function () {
            return getProperty(element, node, 'varExpression').varExpression;
          };
          var saveVarExpression = function (text) {
            var commands = [];
            commands.push(setProperty(element, { varExpression: text }, node));
            new MultiCommandHandler(commandStack).preExecute(commands);
          };
          openEditor('varExpression', getVarExpression, saveVarExpression);
        },
        showLink: function (element, node) {
          var expressionType = getProperty(
            element,
            node,
            'varExpressionType'
          ).varExpressionType;
          return [
            'sqlQuerySingle',
            'sqlQueryList',
            'plsqlExpression',
            'plsqlFunctionBody',
          ].includes(expressionType);
        },
      })
    );
  }

  return procVarProps;
}
