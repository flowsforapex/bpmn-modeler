var {is} = require('bpmn-js/lib/util/ModelUtil');
var entryFactory = require('./custom/EntryFactory');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

import { getSelectedEntry } from './procVarLists';

export function procVarDetailProps(element, bpmnFactory, translate) {

    var EXPRESSION_DESCRIPTION = {
        static: translate('Static value'),
        processVariable: translate('Name of the Process Variable'),
        // pageItem: translate('Name of the APEX Page Item'),
        sqlQuerySingle: translate('SQL query returning a single value'),
        sqlQueryList: translate('SQL query returning a colon delimited list'),
        plsqlExpression: translate('Expression returning a value'),
        plsqlFunctionBody: translate('Function Body returning a value')
    };
    
    var getProperty = function (property) {
        return function (element, node) {
    
            var entry = getSelectedEntry(element, node);
    
            return {
                [property]: (entry && entry.get(property)) || undefined,
                varExpressionDynamicDescription: EXPRESSION_DESCRIPTION[entry && entry.get('varExpressionType')],
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
                // description: 'Variable name',
                label: translate('Name'),
                modelProperty: 'varName',

                get: getProperty('varName'),

                set: setProperty()
            })
        );

        // datatype field
        procVarProps.push(
            entryFactory.selectBox(translate, {
                id: 'varDataType',
                // description: 'Data Type',
                label: translate('Data Type'),
                modelProperty: 'varDataType',

                get: getProperty('varDataType'),

                set: setProperty(),

                selectOptions: [
                    {name: translate('Varchar2'), value: 'varchar2'},
                    {name: translate('Number'), value: 'number'},
                    {name: translate('Date'), value: 'date'},
                    {name: translate('Clob'), value: 'clob'},
                ]
            })
        );

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