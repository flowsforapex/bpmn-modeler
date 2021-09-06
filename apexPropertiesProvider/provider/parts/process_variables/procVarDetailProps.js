var {is} = require('bpmn-js/lib/util/ModelUtil');
var entryFactory = require('./custom/EntryFactory');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

import { getSelectedEntry } from './procVarLists';

export function procVarDetailProps(element, bpmnFactory, translate) {
   
    const DATA_TYPE_DESCRIPTION = {
        DATE: translate('Date in format YYYY-MM-DD HH24:MI:SS'),
    };

    var getDataTypes = function () {
        return function (element, node) {
            var entry = getSelectedEntry(element, node);
            var expressionType = entry && entry.get('varExpressionType');

            switch (expressionType) {
                case 'sqlQueryList':
                    return [
                        {name: translate('Varchar2'), value: 'VARCHAR2'},
                    ];
                case 'sqlQuerySingle':
                case 'plsqlExpression':
                case 'plsqlFunctionBody':
                    return [
                        {name: translate('Varchar2'), value: 'VARCHAR2'},
                        {name: translate('Number'), value: 'NUMBER'},
                        {name: translate('Date'), value: 'DATE'},
                    ];
                case 'static':
                case 'processVariable':
                default:
                    return [
                        {name: translate('Varchar2'), value: 'VARCHAR2'},
                        {name: translate('Number'), value: 'NUMBER'},
                        {name: translate('Date'), value: 'DATE'},
                        {name: translate('Clob'), value: 'CLOB'},
                    ];
            }
        };
    };

    var getProperty = function (property) {
        return function (element, node) {
    
            var entry = getSelectedEntry(element, node);
    
            return {
                [property]: (entry && entry.get(property)) || undefined,
                varDataTypeDynamicDescription: DATA_TYPE_DESCRIPTION[entry && entry.get('varDataType')]
            };
        };
    };
    
    var setProperty = function () {
        return function (element, values, node) {
        var entry = getSelectedEntry(element, node);
    
        return cmdHelper.updateBusinessObject(element, entry, values);
        };
    };

    var procVarProps = [];

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

                get: getProperty('varName'),

                set: setProperty()
            })
        );

        // datatype field
        procVarProps.push(
            entryFactory.dynamicSelectBox(translate, {
                id: 'varDataType',
                label: translate('Data Type'),
                modelProperty: 'varDataType',
                dataValueDescription: 'varDataTypeDynamicDescription',

                get: getProperty('varDataType'),

                set: setProperty(),

                selectOptions: getDataTypes()
            })
        );
    }

    return procVarProps;
}

export function procVarExpressionProps(element, bpmnFactory, translate) {

    const EXPRESSION_DESCRIPTION = {
        static: translate('Static value'),
        processVariable: translate('Name of the Process Variable'),
        // pageItem: translate('Name of the APEX Page Item'),
        sqlQuerySingle: translate('SQL query returning a single value'),
        sqlQueryList: translate('SQL query returning a colon delimited list'),
        plsqlExpression: translate('PL/SQL Expression returning a value'),
        plsqlFunctionBody: translate('PL/SQL Function Body returning a value')
    };

    var getProperty = function (property) {
        return function (element, node) {
    
            var entry = getSelectedEntry(element, node);
    
            return {
                [property]: (entry && entry.get(property)) || undefined,
                varExpressionDynamicDescription: EXPRESSION_DESCRIPTION[entry && entry.get('varExpressionType')]
            };
        };
    };
    
    var setProperty = function () {
        return function (element, values, node) {
        var entry = getSelectedEntry(element, node);

        if (values.varExpressionType !== undefined) {
            switch (values.varExpressionType) {
                case 'sqlQuerySingle':
                case 'plsqlExpression':
                case 'plsqlFunctionBody':
                    if (entry.varDataType === 'CLOB') { entry.varDataType = 'VARCHAR2'; }
                    break;
                case 'sqlQueryList':
                    entry.varDataType = 'VARCHAR2';
                    break;
                default:
                    break;
            }
        }
    
        return cmdHelper.updateBusinessObject(element, entry, values);
        };
    };

    var procVarProps = [];

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

                get: getProperty('varExpressionType'),

                set: setProperty(),

                selectOptions: [
                    {name: translate('Static'), value: 'static'},
                    {name: translate('Process Variable'), value: 'processVariable'},
                    // {name: translate('Page Item'), value: 'pageItem'},
                    {name: translate('SQL query (single value)'), value: 'sqlQuerySingle'},
                    {name: translate('SQL query (colon delimited list)'), value: 'sqlQueryList'},
                    {name: translate('Expression'), value: 'plsqlExpression'},
                    {name: translate('Function Body'), value: 'plsqlFunctionBody'},
                ]
            })
        );

        // expression
        procVarProps.push(
            entryFactory.dynamicTextBox(translate, {
                id: 'varExpression',
                label: translate('Expression'),
                modelProperty: 'varExpression',
                dataValueDescription: 'varExpressionDynamicDescription',

                get: getProperty('varExpression'),

                set: setProperty()
            })
        );
    }

    return procVarProps;
}