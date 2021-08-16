var {is} = require('bpmn-js/lib/util/ModelUtil');
    var entryFactory = require('./custom/EntryFactory');
    var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

import { getSelectedEntry } from './procVarLists';

var EXPRESSION_DESCRIPTION = {
    static: 'Static value',
    processVariable: 'Name of the Process Variable',
    // pageItem: 'Name of the APEX Page Item',
    sqlQuerySingle: 'SQL query returning a single value',
    sqlQueryList: 'SQL query returning a colon delimited list',
    plsqlExpression: 'Expression returning a value',
    plsqlFunctionBody: 'Function Body returning a value'
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

export function procVarDetailProps(element, bpmnFactory, translate) {

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
                description: 'Variable name',
                label: 'Name',
                modelProperty: 'varName',

                get: getProperty('varName'),

                set: setProperty()
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

                selectOptions: [
                    {name: 'Varchar2', value: 'VARCHAR2'},
                    {name: 'Number', value: 'NUMBER'},
                    {name: 'Date', value: 'DATE'},
                    {name: 'Clob', value: 'CLOB'},
                ]
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

                selectOptions: [
                    {name: 'Static', value: 'static'},
                    {name: 'Process Variable', value: 'processVariable'},
                    // {name: 'Page Item', value: 'pageItem'},
                    {name: 'SQL query (single value)', value: 'sqlQuerySingle'},
                    {name: 'SQL query (colon delimited list)', value: 'sqlQueryList'},
                    {name: 'Expression', value: 'plsqlExpression'},
                    {name: 'Function Body', value: 'plsqlFunctionBody'},
                ]
            })
        );

        // expression
        procVarProps.push(
            entryFactory.dynamicTextBox(translate, {
                id: 'varExpression',
                label: 'Expression',
                modelProperty: 'varExpression',
                dataValueDescription: 'varExpressionDynamicDescription',

                get: getProperty('varExpression'),

                set: setProperty()
            })
        );
    }

    return procVarProps;
}